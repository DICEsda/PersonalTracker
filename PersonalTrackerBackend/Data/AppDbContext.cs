using Microsoft.EntityFrameworkCore;
using PersonalTrackerBackend.Data.Models;

namespace PersonalTrackerBackend.Data
{
    public class AppDbContext : DbContext
    {
        public AppDbContext(DbContextOptions<AppDbContext> options) : base(options)
        {
        }

        public DbSet<Account> Accounts { get; set; }
        public DbSet<AccountBalance> AccountBalances { get; set; }
        public DbSet<Transaction> Transactions { get; set; }
        public DbSet<RequestLog> RequestLogs { get; set; }
        
        // Bank integration entities
        public DbSet<BankConnection> BankConnections { get; set; }
        public DbSet<BankAccount> BankAccounts { get; set; }
        
        // AI insights entities
        public DbSet<AIInsight> AIInsights { get; set; }

        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            base.OnModelCreating(modelBuilder);

            // Configure Account entity
            modelBuilder.Entity<Account>(entity =>
            {
                entity.HasKey(e => e.Id);
                entity.Property(e => e.AccountId).IsRequired().HasMaxLength(100);
                entity.Property(e => e.Name).HasMaxLength(200);
                entity.Property(e => e.OwnerName).HasMaxLength(200);
                entity.Property(e => e.Currency).HasMaxLength(10);
                entity.Property(e => e.Type).HasMaxLength(50);
                entity.Property(e => e.Status).HasMaxLength(50);
                entity.Property(e => e.BankId).HasMaxLength(100);
                entity.Property(e => e.RequisitionId).HasMaxLength(100);
                
                // Create unique index on AccountId
                entity.HasIndex(e => e.AccountId).IsUnique();
            });

            // Configure AccountBalance entity
            modelBuilder.Entity<AccountBalance>(entity =>
            {
                entity.HasKey(e => e.Id);
                entity.Property(e => e.AccountId).IsRequired().HasMaxLength(100);
                entity.Property(e => e.Currency).HasMaxLength(10);
                entity.Property(e => e.Type).HasMaxLength(50);
                
                // Create index on AccountId and Date for efficient queries
                entity.HasIndex(e => new { e.AccountId, e.Date });
            });

            // Configure Transaction entity
            modelBuilder.Entity<Transaction>(entity =>
            {
                entity.HasKey(e => e.Id);
                entity.Property(e => e.TransactionId).IsRequired().HasMaxLength(100);
                entity.Property(e => e.AccountId).IsRequired().HasMaxLength(100);
                entity.Property(e => e.Currency).HasMaxLength(10);
                entity.Property(e => e.Description).HasMaxLength(500);
                entity.Property(e => e.MerchantName).HasMaxLength(200);
                entity.Property(e => e.Category).HasMaxLength(100);
                entity.Property(e => e.Status).HasMaxLength(50);
                entity.Property(e => e.ExternalTransactionId).HasMaxLength(255);
                entity.Property(e => e.TransactionType).HasMaxLength(100);
                entity.Property(e => e.ExtraData).HasMaxLength(500);
                
                // Create unique index on TransactionId
                entity.HasIndex(e => e.TransactionId).IsUnique();
                
                // Create index on AccountId and Date for efficient queries
                entity.HasIndex(e => new { e.AccountId, e.Date });
                
                // Create index on ExternalTransactionId for bank transactions
                entity.HasIndex(e => e.ExternalTransactionId);
                
                // Foreign key relationship with BankAccount
                entity.HasOne(e => e.BankAccount)
                      .WithMany(b => b.Transactions)
                      .HasForeignKey(e => e.BankAccountId)
                      .OnDelete(DeleteBehavior.SetNull);
            });

            // Configure RequestLog entity
            modelBuilder.Entity<RequestLog>(entity =>
            {
                entity.HasKey(e => e.Id);
                entity.Property(e => e.AccountId).IsRequired().HasMaxLength(100);
                entity.Property(e => e.Endpoint).IsRequired().HasMaxLength(100);
                entity.Property(e => e.Status).HasMaxLength(50);
                entity.Property(e => e.ErrorMessage).HasMaxLength(1000);
                
                // Create index on AccountId and Date for efficient queries
                entity.HasIndex(e => new { e.AccountId, e.Date });
            });

            // Configure BankConnection entity
            modelBuilder.Entity<BankConnection>(entity =>
            {
                entity.HasKey(e => e.Id);
                entity.Property(e => e.UserId).IsRequired();
                entity.Property(e => e.ConnectionId).IsRequired().HasMaxLength(255);
                entity.Property(e => e.BankName).IsRequired().HasMaxLength(255);
                entity.Property(e => e.BankCode).IsRequired().HasMaxLength(100);
                entity.Property(e => e.Status).IsRequired().HasMaxLength(50);
                entity.Property(e => e.StatusMessage).HasMaxLength(500);
                
                // Create unique index on ConnectionId
                entity.HasIndex(e => e.ConnectionId).IsUnique();
                
                // Create index on UserId for efficient user queries
                entity.HasIndex(e => e.UserId);
            });

            // Configure BankAccount entity
            modelBuilder.Entity<BankAccount>(entity =>
            {
                entity.HasKey(e => e.Id);
                entity.Property(e => e.AccountId).IsRequired().HasMaxLength(255);
                entity.Property(e => e.AccountName).IsRequired().HasMaxLength(255);
                entity.Property(e => e.AccountType).IsRequired().HasMaxLength(100);
                entity.Property(e => e.Currency).IsRequired().HasMaxLength(10);
                entity.Property(e => e.Iban).HasMaxLength(34);
                entity.Property(e => e.AccountNumber).HasMaxLength(20);
                entity.Property(e => e.SwiftCode).HasMaxLength(11);
                
                // Create unique index on AccountId within a connection
                entity.HasIndex(e => new { e.BankConnectionId, e.AccountId }).IsUnique();
                
                // Foreign key relationship with BankConnection
                entity.HasOne(e => e.BankConnection)
                      .WithMany(b => b.BankAccounts)
                      .HasForeignKey(e => e.BankConnectionId)
                      .OnDelete(DeleteBehavior.Cascade);
            });
        }
    }
} 