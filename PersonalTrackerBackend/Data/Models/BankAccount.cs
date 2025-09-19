using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace PersonalTrackerBackend.Data.Models
{
    public class BankAccount
    {
        [Key]
        public int Id { get; set; }

        [Required]
        public int BankConnectionId { get; set; }

        [Required]
        [MaxLength(255)]
        public string AccountId { get; set; } = string.Empty; // Salt Edge account ID

        [Required]
        [MaxLength(255)]
        public string AccountName { get; set; } = string.Empty;

        [Required]
        [MaxLength(100)]
        public string AccountType { get; set; } = string.Empty; // checking, savings, credit_card, etc.

        [Required]
        [MaxLength(10)]
        public string Currency { get; set; } = string.Empty; // DKK, EUR, USD, etc.

        [Column(TypeName = "decimal(18,2)")]
        public decimal Balance { get; set; }

        [Column(TypeName = "decimal(18,2)")]
        public decimal? AvailableBalance { get; set; }

        [MaxLength(34)]
        public string? Iban { get; set; }

        [MaxLength(20)]
        public string? AccountNumber { get; set; }

        [MaxLength(11)]
        public string? SwiftCode { get; set; }

        public bool IsActive { get; set; } = true;

        public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;

        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

        // Navigation properties
        [ForeignKey("BankConnectionId")]
        public virtual BankConnection BankConnection { get; set; } = null!;

        public virtual ICollection<Transaction> Transactions { get; set; } = new List<Transaction>();
    }
}