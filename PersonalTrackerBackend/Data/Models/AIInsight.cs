using System.ComponentModel.DataAnnotations;

namespace PersonalTrackerBackend.Data.Models
{
    public class AIInsight
    {
        [Key]
        public int Id { get; set; }
        
        public string UserId { get; set; } = string.Empty;
        
        [Required]
        public string Content { get; set; } = string.Empty;
        
        [Required]
        public string Type { get; set; } = string.Empty; // "comprehensive", "spending", "savings", etc.
        
        [Required]
        public int Priority { get; set; } = 1; // 1=low, 2=medium, 3=high
        
        public DateTime GeneratedAt { get; set; }
        
        public bool IsRead { get; set; } = false;
        
        public string? ActionTaken { get; set; }
    }
}