using Microsoft.AspNetCore.Mvc;
using PersonalTrackerBackend.Services;
using System.Security.Claims;

namespace PersonalTrackerBackend.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class BankingController : ControllerBase
    {
        private readonly IBankingService _bankingService;
        private readonly ILogger<BankingController> _logger;

        public BankingController(IBankingService bankingService, ILogger<BankingController> logger)
        {
            _bankingService = bankingService;
            _logger = logger;
        }

        private string GetUserId()
        {
            return User.FindFirst(ClaimTypes.NameIdentifier)?.Value 
                ?? User.FindFirst("sub")?.Value 
                ?? "demo-user"; // Fallback for development
        }

        [HttpPost("connect")]
        public async Task<IActionResult> InitiateBankConnection()
        {
            try
            {
                var userId = GetUserId();
                var returnUrl = $"{Request.Scheme}://{Request.Host}/banking/callback";
                
                var connectUrl = await _bankingService.InitiateBankConnectionAsync(userId, returnUrl);
                
                return Ok(new { connectUrl });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Failed to initiate bank connection");
                return StatusCode(500, new { error = "Failed to initiate bank connection" });
            }
        }

        [HttpPost("callback")]
        public async Task<IActionResult> HandleConnectionCallback([FromBody] ConnectionCallbackRequest request)
        {
            try
            {
                var userId = GetUserId();
                
                var connection = await _bankingService.ProcessBankConnectionCallbackAsync(request.ConnectionId, userId);
                
                if (connection == null)
                {
                    return BadRequest(new { error = "Invalid connection" });
                }

                return Ok(new 
                { 
                    success = true,
                    connection = new
                    {
                        id = connection.Id,
                        bankName = connection.BankName,
                        status = connection.Status,
                        createdAt = connection.CreatedAt
                    }
                });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Failed to process connection callback");
                return StatusCode(500, new { error = "Failed to process connection callback" });
            }
        }

        [HttpGet("connections")]
        public async Task<IActionResult> GetBankConnections()
        {
            try
            {
                var userId = GetUserId();
                var connections = await _bankingService.GetUserBankConnectionsAsync(userId);
                
                var result = connections.Select(c => new
                {
                    id = c.Id,
                    bankName = c.BankName,
                    bankCode = c.BankCode,
                    status = c.Status,
                    accountCount = c.BankAccounts.Count,
                    createdAt = c.CreatedAt,
                    lastSyncAt = c.LastSyncAt,
                    consentExpiresAt = c.ConsentExpiresAt
                });

                return Ok(result);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Failed to get bank connections");
                return StatusCode(500, new { error = "Failed to get bank connections" });
            }
        }

        [HttpGet("accounts")]
        public async Task<IActionResult> GetBankAccounts()
        {
            try
            {
                var userId = GetUserId();
                var accounts = await _bankingService.GetUserBankAccountsAsync(userId);
                
                var result = accounts.Select(a => new
                {
                    id = a.Id,
                    accountId = a.AccountId,
                    accountName = a.AccountName,
                    accountType = a.AccountType,
                    currency = a.Currency,
                    balance = a.Balance,
                    availableBalance = a.AvailableBalance,
                    iban = a.Iban,
                    bankName = a.BankConnection.BankName,
                    updatedAt = a.UpdatedAt
                });

                return Ok(result);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Failed to get bank accounts");
                return StatusCode(500, new { error = "Failed to get bank accounts" });
            }
        }

        [HttpPost("sync")]
        public async Task<IActionResult> SyncBankData()
        {
            try
            {
                var userId = GetUserId();
                var success = await _bankingService.SyncBankDataAsync(userId);
                
                if (success)
                {
                    return Ok(new { success = true, message = "Bank data synced successfully" });
                }
                else
                {
                    return StatusCode(500, new { error = "Failed to sync bank data" });
                }
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Failed to sync bank data");
                return StatusCode(500, new { error = "Failed to sync bank data" });
            }
        }

        [HttpPost("accounts/{accountId}/sync-transactions")]
        public async Task<IActionResult> SyncAccountTransactions(int accountId)
        {
            try
            {
                var success = await _bankingService.SyncAccountTransactionsAsync(accountId);
                
                if (success)
                {
                    return Ok(new { success = true, message = "Transactions synced successfully" });
                }
                else
                {
                    return StatusCode(500, new { error = "Failed to sync transactions" });
                }
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Failed to sync account transactions");
                return StatusCode(500, new { error = "Failed to sync account transactions" });
            }
        }

        [HttpDelete("connections/{connectionId}")]
        public async Task<IActionResult> DisconnectBank(int connectionId)
        {
            try
            {
                var userId = GetUserId();
                var success = await _bankingService.DisconnectBankAsync(userId, connectionId);
                
                if (success)
                {
                    return Ok(new { success = true, message = "Bank disconnected successfully" });
                }
                else
                {
                    return NotFound(new { error = "Bank connection not found" });
                }
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Failed to disconnect bank");
                return StatusCode(500, new { error = "Failed to disconnect bank" });
            }
        }

        [HttpGet("transactions")]
        public async Task<IActionResult> GetBankTransactions([FromQuery] DateTime? fromDate, [FromQuery] DateTime? toDate)
        {
            try
            {
                var userId = GetUserId();
                var transactions = await _bankingService.GetBankTransactionsAsync(userId, fromDate, toDate);
                
                var result = transactions.Select(t => new
                {
                    id = t.Id,
                    amount = t.Amount,
                    currency = t.Currency,
                    description = t.Description,
                    merchantName = t.MerchantName,
                    category = t.Category,
                    transactionType = t.TransactionType,
                    date = t.Date,
                    status = t.Status,
                    runningBalance = t.RunningBalance,
                    bankAccount = new
                    {
                        id = t.BankAccount?.Id,
                        name = t.BankAccount?.AccountName,
                        bankName = t.BankAccount?.BankConnection.BankName
                    }
                });

                return Ok(result);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Failed to get bank transactions");
                return StatusCode(500, new { error = "Failed to get bank transactions" });
            }
        }

        [HttpGet("balance")]
        public async Task<IActionResult> GetTotalBankBalance()
        {
            try
            {
                var userId = GetUserId();
                var totalBalance = await _bankingService.GetTotalBankBalanceAsync(userId);
                
                return Ok(new { totalBalance, currency = "DKK" });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Failed to get total bank balance");
                return StatusCode(500, new { error = "Failed to get total bank balance" });
            }
        }
    }

    public class ConnectionCallbackRequest
    {
        public string ConnectionId { get; set; } = string.Empty;
        public string Status { get; set; } = string.Empty;
    }
}