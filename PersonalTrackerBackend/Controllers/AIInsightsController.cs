using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using PersonalTrackerBackend.Data;
using PersonalTrackerBackend.Services;
using PersonalTrackerBackend.Data.Models;

namespace PersonalTrackerBackend.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class AIInsightsController : ControllerBase
    {
        private readonly AppDbContext _context;
        private readonly AIInsightsService _aiService;
        private readonly ILogger<AIInsightsController> _logger;

        public AIInsightsController(
            AppDbContext context, 
            AIInsightsService aiService,
            ILogger<AIInsightsController> logger)
        {
            _context = context;
            _aiService = aiService;
            _logger = logger;
        }

        [HttpGet]
        public async Task<ActionResult<IEnumerable<AIInsight>>> GetInsights()
        {
            try
            {
                var insights = await _context.AIInsights
                    .OrderByDescending(i => i.Priority)
                    .ThenByDescending(i => i.GeneratedAt)
                    .Take(10)
                    .ToListAsync();

                return Ok(insights);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error retrieving AI insights");
                return StatusCode(500, "Internal server error");
            }
        }

        [HttpGet("latest")]
        public async Task<ActionResult<AIInsight>> GetLatestInsight()
        {
            try
            {
                var latestInsight = await _context.AIInsights
                    .OrderByDescending(i => i.GeneratedAt)
                    .FirstOrDefaultAsync();

                if (latestInsight == null)
                {
                    return NotFound("No insights found");
                }

                return Ok(latestInsight);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error retrieving latest AI insight");
                return StatusCode(500, "Internal server error");
            }
        }

        [HttpPost("generate")]
        public async Task<ActionResult> GenerateInsights()
        {
            try
            {
                _logger.LogInformation("Starting AI insights generation");

                var insights = await _aiService.GenerateInsightsAsync();
                
                if (!insights.Any())
                {
                    return BadRequest("No insights could be generated at this time");
                }

                return Ok(new { 
                    message = $"Generated {insights.Count} insights successfully",
                    insights = insights
                });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error generating AI insights");
                return StatusCode(500, "Error generating insights: " + ex.Message);
            }
        }

        [HttpGet("priority/{priority}")]
        public async Task<ActionResult<IEnumerable<AIInsight>>> GetInsightsByPriority(int priority)
        {
            try
            {
                var insights = await _context.AIInsights
                    .Where(i => i.Priority == priority)
                    .OrderByDescending(i => i.GeneratedAt)
                    .ToListAsync();

                return Ok(insights);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error retrieving insights by priority");
                return StatusCode(500, "Internal server error");
            }
        }

        [HttpGet("type/{type}")]
        public async Task<ActionResult<IEnumerable<AIInsight>>> GetInsightsByType(string type)
        {
            try
            {
                var insights = await _context.AIInsights
                    .Where(i => i.Type == type)
                    .OrderByDescending(i => i.GeneratedAt)
                    .ToListAsync();

                return Ok(insights);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error retrieving insights by type");
                return StatusCode(500, "Internal server error");
            }
        }

        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteInsight(int id)
        {
            try
            {
                var insight = await _context.AIInsights.FindAsync(id);
                
                if (insight == null)
                {
                    return NotFound();
                }

                _context.AIInsights.Remove(insight);
                await _context.SaveChangesAsync();

                return NoContent();
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error deleting AI insight");
                return StatusCode(500, "Internal server error");
            }
        }

        [HttpPost("refresh")]
        public async Task<ActionResult> RefreshInsights()
        {
            try
            {
                // Remove old insights (keep last 7 days)
                var cutoffDate = DateTime.UtcNow.AddDays(-7);
                var oldInsights = await _context.AIInsights
                    .Where(i => i.GeneratedAt < cutoffDate)
                    .ToListAsync();

                _context.AIInsights.RemoveRange(oldInsights);
                await _context.SaveChangesAsync();

                // Generate fresh insights
                var newInsights = await _aiService.GenerateInsightsAsync();

                return Ok(new { 
                    message = "Insights refreshed successfully",
                    removed = oldInsights.Count,
                    generated = newInsights.Count
                });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error refreshing AI insights");
                return StatusCode(500, "Error refreshing insights: " + ex.Message);
            }
        }
    }
}