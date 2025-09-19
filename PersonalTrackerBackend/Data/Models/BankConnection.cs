using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace PersonalTrackerBackend.Data.Models
{
    public class BankConnection
    {
        [Key]
        public int Id { get; set; }

        [Required]
        public string UserId { get; set; } = string.Empty;

        [Required]
        [MaxLength(255)]
        public string ConnectionId { get; set; } = string.Empty; // Salt Edge connection ID

        [Required]
        [MaxLength(255)]
        public string BankName { get; set; } = string.Empty;

        [Required]
        [MaxLength(100)]
        public string BankCode { get; set; } = string.Empty; // e.g., "nordea_dk", "lunar_dk"

        [Required]
        [MaxLength(50)]
        public string Status { get; set; } = string.Empty; // active, inactive, error, etc.

        [MaxLength(500)]
        public string? StatusMessage { get; set; }

        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

        public DateTime? LastSyncAt { get; set; }

        public DateTime? ConsentExpiresAt { get; set; } // PSD2 consent expiration

        // Navigation properties
        public virtual ICollection<BankAccount> BankAccounts { get; set; } = new List<BankAccount>();
    }
}