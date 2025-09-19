using Microsoft.EntityFrameworkCore;
using PersonalTrackerBackend.Data;
using PersonalTrackerBackend.Data.Models;
using PersonalTrackerBackend.Models;

namespace PersonalTrackerBackend.Services
{
    public interface IBankingService
    {
        Task<string> InitiateBankConnectionAsync(string userId, string returnUrl);
        Task<List<BankConnection>> GetUserBankConnectionsAsync(string userId);
        Task<List<BankAccount>> GetUserBankAccountsAsync(string userId);
        Task<BankConnection?> ProcessBankConnectionCallbackAsync(string connectionId, string userId);
        Task<bool> SyncBankDataAsync(string userId);
        Task<bool> SyncAccountTransactionsAsync(int bankAccountId);
        Task<bool> DisconnectBankAsync(string userId, int connectionId);
        Task<List<Transaction>> GetBankTransactionsAsync(string userId, DateTime? fromDate = null, DateTime? toDate = null);
        Task<decimal> GetTotalBankBalanceAsync(string userId);
    }

    public class BankingService : IBankingService
    {
        private readonly AppDbContext _context;
        private readonly ISaltEdgeService _saltEdgeService;
        private readonly ILogger<BankingService> _logger;

        public BankingService(AppDbContext context, ISaltEdgeService saltEdgeService, ILogger<BankingService> logger)
        {
            _context = context;
            _saltEdgeService = saltEdgeService;
            _logger = logger;
        }

        public async Task<string> InitiateBankConnectionAsync(string userId, string returnUrl)
        {
            try
            {
                // Define supported providers for Denmark
                var supportedProviders = new[] { "nordea_dk", "lunar_dk", "danske_bank_dk", "jyske_bank_dk" };
                
                var connectUrl = await _saltEdgeService.CreateConnectSessionAsync(userId, returnUrl, supportedProviders);
                
                _logger.LogInformation("Created Salt Edge connect session for user {UserId}", userId);
                return connectUrl;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Failed to initiate bank connection for user {UserId}", userId);
                throw;
            }
        }

        public async Task<List<BankConnection>> GetUserBankConnectionsAsync(string userId)
        {
            return await _context.BankConnections
                .Where(bc => bc.UserId == userId)
                .Include(bc => bc.BankAccounts)
                .OrderByDescending(bc => bc.CreatedAt)
                .ToListAsync();
        }

        public async Task<List<BankAccount>> GetUserBankAccountsAsync(string userId)
        {
            return await _context.BankAccounts
                .Include(ba => ba.BankConnection)
                .Where(ba => ba.BankConnection.UserId == userId && ba.IsActive)
                .OrderBy(ba => ba.BankConnection.BankName)
                .ThenBy(ba => ba.AccountName)
                .ToListAsync();
        }

        public async Task<BankConnection?> ProcessBankConnectionCallbackAsync(string connectionId, string userId)
        {
            try
            {
                // Get connection details from Salt Edge
                var saltEdgeConnection = await _saltEdgeService.GetConnectionAsync(connectionId);
                if (saltEdgeConnection == null)
                {
                    _logger.LogWarning("Salt Edge connection {ConnectionId} not found", connectionId);
                    return null;
                }

                // Check if connection already exists
                var existingConnection = await _context.BankConnections
                    .FirstOrDefaultAsync(bc => bc.ConnectionId == connectionId);

                BankConnection bankConnection;
                if (existingConnection != null)
                {
                    // Update existing connection
                    existingConnection.Status = saltEdgeConnection.Status;
                    existingConnection.LastSyncAt = DateTime.UtcNow;
                    existingConnection.ConsentExpiresAt = saltEdgeConnection.ConsentExpiresAt;
                    bankConnection = existingConnection;
                }
                else
                {
                    // Create new connection
                    bankConnection = new BankConnection
                    {
                        UserId = userId,
                        ConnectionId = connectionId,
                        BankName = saltEdgeConnection.ProviderName,
                        BankCode = saltEdgeConnection.ProviderCode,
                        Status = saltEdgeConnection.Status,
                        LastSyncAt = DateTime.UtcNow,
                        ConsentExpiresAt = saltEdgeConnection.ConsentExpiresAt
                    };
                    _context.BankConnections.Add(bankConnection);
                }

                await _context.SaveChangesAsync();

                // Sync accounts for this connection
                await SyncBankAccountsAsync(bankConnection);

                _logger.LogInformation("Processed bank connection callback for connection {ConnectionId}", connectionId);
                return bankConnection;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Failed to process bank connection callback for connection {ConnectionId}", connectionId);
                throw;
            }
        }

        public async Task<bool> SyncBankDataAsync(string userId)
        {
            try
            {
                var userConnections = await GetUserBankConnectionsAsync(userId);
                var syncTasks = userConnections
                    .Where(bc => bc.Status == "active")
                    .Select(SyncBankAccountsAsync);

                await Task.WhenAll(syncTasks);

                _logger.LogInformation("Synced bank data for user {UserId}", userId);
                return true;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Failed to sync bank data for user {UserId}", userId);
                return false;
            }
        }

        private async Task SyncBankAccountsAsync(BankConnection connection)
        {
            try
            {
                var saltEdgeAccounts = await _saltEdgeService.GetAccountsAsync(connection.ConnectionId);

                foreach (var saltEdgeAccount in saltEdgeAccounts)
                {
                    var existingAccount = await _context.BankAccounts
                        .FirstOrDefaultAsync(ba => ba.BankConnectionId == connection.Id && ba.AccountId == saltEdgeAccount.Id);

                    if (existingAccount != null)
                    {
                        // Update existing account
                        existingAccount.AccountName = saltEdgeAccount.Name;
                        existingAccount.Balance = saltEdgeAccount.Balance;
                        existingAccount.AvailableBalance = saltEdgeAccount.Extra?.AvailableAmount;
                        existingAccount.UpdatedAt = DateTime.UtcNow;
                    }
                    else
                    {
                        // Create new account
                        var bankAccount = new BankAccount
                        {
                            BankConnectionId = connection.Id,
                            AccountId = saltEdgeAccount.Id,
                            AccountName = saltEdgeAccount.Name,
                            AccountType = saltEdgeAccount.Nature,
                            Currency = saltEdgeAccount.CurrencyCode,
                            Balance = saltEdgeAccount.Balance,
                            AvailableBalance = saltEdgeAccount.Extra?.AvailableAmount,
                            Iban = saltEdgeAccount.Extra?.Iban,
                            AccountNumber = saltEdgeAccount.Extra?.AccountNumber,
                            SwiftCode = saltEdgeAccount.Extra?.Swift
                        };
                        _context.BankAccounts.Add(bankAccount);
                    }
                }

                connection.LastSyncAt = DateTime.UtcNow;
                await _context.SaveChangesAsync();

                _logger.LogInformation("Synced accounts for bank connection {ConnectionId}", connection.ConnectionId);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Failed to sync accounts for bank connection {ConnectionId}", connection.ConnectionId);
                throw;
            }
        }

        public async Task<bool> SyncAccountTransactionsAsync(int bankAccountId)
        {
            try
            {
                var bankAccount = await _context.BankAccounts
                    .Include(ba => ba.BankConnection)
                    .FirstOrDefaultAsync(ba => ba.Id == bankAccountId);

                if (bankAccount == null)
                {
                    _logger.LogWarning("Bank account {BankAccountId} not found", bankAccountId);
                    return false;
                }

                // Get transactions from the last 30 days or since last sync
                var fromDate = DateTime.UtcNow.AddDays(-30);
                var lastTransaction = await _context.Transactions
                    .Where(t => t.BankAccountId == bankAccountId && t.IsFromBank)
                    .OrderByDescending(t => t.Date)
                    .FirstOrDefaultAsync();

                if (lastTransaction != null)
                {
                    fromDate = lastTransaction.Date.AddDays(-1); // Overlap by 1 day to avoid missing transactions
                }

                var saltEdgeTransactions = await _saltEdgeService.GetTransactionsAsync(
                    bankAccount.AccountId, fromDate, DateTime.UtcNow);

                foreach (var saltEdgeTransaction in saltEdgeTransactions)
                {
                    // Check if transaction already exists
                    var existingTransaction = await _context.Transactions
                        .FirstOrDefaultAsync(t => t.ExternalTransactionId == saltEdgeTransaction.Id);

                    if (existingTransaction != null)
                        continue; // Skip if already exists

                    // Create new transaction
                    var transaction = new Transaction
                    {
                        TransactionId = Guid.NewGuid().ToString(),
                        AccountId = bankAccount.BankConnection.UserId, // Map to user account
                        BankAccountId = bankAccountId,
                        ExternalTransactionId = saltEdgeTransaction.Id,
                        Amount = saltEdgeTransaction.Amount,
                        Currency = saltEdgeTransaction.CurrencyCode,
                        Description = saltEdgeTransaction.Description,
                        MerchantName = saltEdgeTransaction.Extra?.Merchant,
                        Category = saltEdgeTransaction.Category,
                        TransactionType = saltEdgeTransaction.Mode,
                        RunningBalance = saltEdgeTransaction.Extra?.RunningBalance,
                        Date = saltEdgeTransaction.MadeOn,
                        Status = saltEdgeTransaction.Status,
                        IsFromBank = true,
                        ExtraData = System.Text.Json.JsonSerializer.Serialize(saltEdgeTransaction.Extra)
                    };

                    _context.Transactions.Add(transaction);
                }

                await _context.SaveChangesAsync();

                _logger.LogInformation("Synced transactions for bank account {BankAccountId}", bankAccountId);
                return true;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Failed to sync transactions for bank account {BankAccountId}", bankAccountId);
                return false;
            }
        }

        public async Task<bool> DisconnectBankAsync(string userId, int connectionId)
        {
            try
            {
                var connection = await _context.BankConnections
                    .FirstOrDefaultAsync(bc => bc.Id == connectionId && bc.UserId == userId);

                if (connection == null)
                {
                    _logger.LogWarning("Bank connection {ConnectionId} not found for user {UserId}", connectionId, userId);
                    return false;
                }

                // Remove from Salt Edge
                await _saltEdgeService.RemoveConnectionAsync(connection.ConnectionId);

                // Mark as inactive in our database
                connection.Status = "inactive";
                
                // Mark all associated accounts as inactive
                var accounts = await _context.BankAccounts
                    .Where(ba => ba.BankConnectionId == connectionId)
                    .ToListAsync();

                foreach (var account in accounts)
                {
                    account.IsActive = false;
                }

                await _context.SaveChangesAsync();

                _logger.LogInformation("Disconnected bank connection {ConnectionId} for user {UserId}", connectionId, userId);
                return true;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Failed to disconnect bank connection {ConnectionId} for user {UserId}", connectionId, userId);
                return false;
            }
        }

        public async Task<List<Transaction>> GetBankTransactionsAsync(string userId, DateTime? fromDate = null, DateTime? toDate = null)
        {
            var query = _context.Transactions
                .Include(t => t.BankAccount)
                .ThenInclude(ba => ba!.BankConnection)
                .Where(t => t.IsFromBank && t.BankAccount!.BankConnection.UserId == userId);

            if (fromDate.HasValue)
                query = query.Where(t => t.Date >= fromDate.Value);

            if (toDate.HasValue)
                query = query.Where(t => t.Date <= toDate.Value);

            return await query
                .OrderByDescending(t => t.Date)
                .ToListAsync();
        }

        public async Task<decimal> GetTotalBankBalanceAsync(string userId)
        {
            var accounts = await GetUserBankAccountsAsync(userId);
            return accounts.Where(a => a.Currency == "DKK").Sum(a => a.Balance);
        }
    }
}