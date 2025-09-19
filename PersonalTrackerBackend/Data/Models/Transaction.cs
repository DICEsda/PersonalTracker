using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace PersonalTrackerBackend.Data.Models
{
    public class Transaction
    {
        public int Id { get; set; }
        
        [Required]
        [MaxLength(100)]
        public string TransactionId { get; set; } = string.Empty;
        
        [Required]
        [MaxLength(100)]
        public string AccountId { get; set; } = string.Empty;
        
        public decimal Amount { get; set; }
        
        [MaxLength(10)]
        public string? Currency { get; set; }
        
        [MaxLength(500)]
        public string? Description { get; set; }
        
        [MaxLength(200)]
        public string? MerchantName { get; set; }
        
        [MaxLength(100)]
        public string? Category { get; set; }
        
        [MaxLength(50)]
        public string? Status { get; set; }
        
        public DateTime Date { get; set; }
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
        
        // Bank integration fields
        public int? BankAccountId { get; set; }
        
        [MaxLength(255)]
        public string? ExternalTransactionId { get; set; } // Salt Edge transaction ID
        
        public bool IsFromBank { get; set; } = false;
        
        [MaxLength(100)]
        public string? TransactionType { get; set; } // debit, credit, fee, etc.
        
        [Column(TypeName = "decimal(18,2)")]
        public decimal? RunningBalance { get; set; }
        
        [MaxLength(500)]
        public string? ExtraData { get; set; } // JSON for additional bank data
        
        // Navigation properties
        public virtual Account Account { get; set; } = null!;
        
        [ForeignKey("BankAccountId")]
        public virtual BankAccount? BankAccount { get; set; }
    }
} 