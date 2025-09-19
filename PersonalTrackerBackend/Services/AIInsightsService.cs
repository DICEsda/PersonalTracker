using System.Text.Json;
using Microsoft.EntityFrameworkCore;
using PersonalTrackerBackend.Data;
using PersonalTrackerBackend.Data.Models;

namespace PersonalTrackerBackend.Services
{
    public class AIInsightsService
    {
        private readonly HttpClient _httpClient;
        private readonly IConfiguration _configuration;
        private readonly ILogger<AIInsightsService> _logger;
        private readonly AppDbContext _context;
        private readonly string _openAiApiKey;

        public AIInsightsService(
            HttpClient httpClient, 
            IConfiguration configuration, 
            ILogger<AIInsightsService> logger,
            AppDbContext context)
        {
            _httpClient = httpClient;
            _configuration = configuration;
            _logger = logger;
            _context = context;
            _openAiApiKey = _configuration["OpenAI:ApiKey"] ?? "your-openai-api-key-here";
            
            if (_httpClient.DefaultRequestHeaders.Authorization == null)
            {
                _httpClient.DefaultRequestHeaders.Add("Authorization", $"Bearer {_openAiApiKey}");
            }
        }

        public async Task<List<AIInsight>> GenerateInsightsAsync()
        {
            try
            {
                // Gather user data for analysis
                var userData = await GatherUserDataAsync();
                
                // Generate insights using OpenAI (or fallback to mock)
                var insights = await CallOpenAIAsync(userData);
                
                // Save to database
                var aiInsights = new List<AIInsight>();
                
                foreach (var insight in insights)
                {
                    var aiInsight = new AIInsight
                    {
                        Content = insight.Content,
                        Type = insight.Type,
                        Priority = insight.Priority,
                        GeneratedAt = DateTime.UtcNow,
                        UserId = "default" // Would be actual user ID in production
                    };
                    
                    _context.AIInsights.Add(aiInsight);
                    aiInsights.Add(aiInsight);
                }
                
                await _context.SaveChangesAsync();
                return aiInsights;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error generating AI insights");
                // Return mock insights if everything fails
                return await GenerateMockInsights();
            }
        }

        public async Task<List<AIInsight>> GetRecentInsightsAsync(int limit = 5)
        {
            return await _context.AIInsights
                .OrderByDescending(i => i.GeneratedAt)
                .Take(limit)
                .ToListAsync();
        }

        private async Task<FinancialDataSummary> GatherUserDataAsync()
        {
            // Get recent transactions
            var recentTransactions = await _context.Transactions
                .OrderByDescending(t => t.CreatedAt)
                .Take(50)
                .ToListAsync();

            // Get account balances
            var accounts = await _context.Accounts.ToListAsync();
            var accountBalances = await _context.AccountBalances
                .OrderByDescending(ab => ab.Date)
                .Take(30)
                .ToListAsync();

            // Calculate financial metrics
            var totalBalance = accountBalances.LastOrDefault()?.Balance ?? 0;
            var monthlyIncome = recentTransactions
                .Where(t => t.Amount > 0 && t.CreatedAt >= DateTime.Now.AddDays(-30))
                .Sum(t => t.Amount);
            var monthlyExpenses = Math.Abs(recentTransactions
                .Where(t => t.Amount < 0 && t.CreatedAt >= DateTime.Now.AddDays(-30))
                .Sum(t => t.Amount));

            return new FinancialDataSummary
            {
                TotalBalance = totalBalance,
                MonthlyIncome = monthlyIncome,
                MonthlyExpenses = monthlyExpenses,
                NetSavings = monthlyIncome - monthlyExpenses,
                TransactionCount = recentTransactions.Count(),
                AccountCount = accounts.Count(),
                LargestExpense = recentTransactions
                    .Where(t => t.Amount < 0)
                    .OrderBy(t => t.Amount)
                    .FirstOrDefault()?.Amount ?? 0,
                AverageTransactionAmount = recentTransactions.Any() ? 
                    recentTransactions.Average(t => Math.Abs(t.Amount)) : 0
            };
        }

        private async Task<List<InsightData>> CallOpenAIAsync(FinancialDataSummary data)
        {
            try
            {
                // If no API key is configured, return basic insights
                if (_openAiApiKey == "your-openai-api-key-here")
                {
                    _logger.LogInformation("No OpenAI API key configured, generating basic insights");
                    return GenerateBasicInsights(data);
                }

                var prompt = BuildPrompt(data);
                
                var requestBody = new
                {
                    model = "gpt-4",
                    messages = new[]
                    {
                        new { role = "system", content = "You are a financial advisor AI. Provide concise, actionable insights." },
                        new { role = "user", content = prompt }
                    },
                    max_tokens = 500,
                    temperature = 0.7
                };

                var json = JsonSerializer.Serialize(requestBody);
                var content = new StringContent(json, System.Text.Encoding.UTF8, "application/json");

                var response = await _httpClient.PostAsync("https://api.openai.com/v1/chat/completions", content);
                
                if (response.IsSuccessStatusCode)
                {
                    var responseJson = await response.Content.ReadAsStringAsync();
                    var result = JsonSerializer.Deserialize<OpenAIResponse>(responseJson);
                    
                    var insightText = result?.Choices?[0]?.Message?.Content ?? "No insights generated";
                    return ParseInsights(insightText);
                }
                else
                {
                    _logger.LogWarning("OpenAI API call failed with status: {StatusCode}", response.StatusCode);
                    return GenerateBasicInsights(data);
                }
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error calling OpenAI API");
                return GenerateBasicInsights(data);
            }
        }

        private string BuildPrompt(FinancialDataSummary data)
        {
            return $@"
Analyze this financial data and provide 3-5 specific insights:

Financial Summary:
- Total Balance: ${data.TotalBalance:F2}
- Monthly Income: ${data.MonthlyIncome:F2}
- Monthly Expenses: ${data.MonthlyExpenses:F2}
- Net Savings: ${data.NetSavings:F2}
- Transaction Count: {data.TransactionCount}
- Largest Expense: ${Math.Abs(data.LargestExpense):F2}
- Average Transaction: ${data.AverageTransactionAmount:F2}

Please provide insights in this format:
1. [HIGH/MEDIUM/LOW] [TYPE]: [Insight text]
2. [HIGH/MEDIUM/LOW] [TYPE]: [Insight text]

Types: SPENDING, SAVING, TREND, ALERT, BUDGET
Priority: HIGH for urgent issues, MEDIUM for important patterns, LOW for general advice.
";
        }

        private List<InsightData> ParseInsights(string insightText)
        {
            var insights = new List<InsightData>();
            var lines = insightText.Split('\n', StringSplitOptions.RemoveEmptyEntries);

            foreach (var line in lines)
            {
                if (line.Contains('[') && line.Contains(']'))
                {
                    try
                    {
                        var parts = line.Split(new[] { '[', ']' }, StringSplitOptions.RemoveEmptyEntries);
                        if (parts.Length >= 3)
                        {
                            var priority = parts[0].Trim().ToUpper() switch
                            {
                                "HIGH" => 3,
                                "MEDIUM" => 2,
                                "LOW" => 1,
                                _ => 2
                            };

                            var type = parts[1].Trim();
                            var content = string.Join(" ", parts.Skip(2)).Trim();

                            insights.Add(new InsightData
                            {
                                Content = content,
                                Type = type,
                                Priority = priority
                            });
                        }
                    }
                    catch
                    {
                        // Skip malformed lines
                    }
                }
            }

            return insights.Any() ? insights : GenerateBasicInsights(null);
        }

        private List<InsightData> GenerateBasicInsights(FinancialDataSummary? data)
        {
            var insights = new List<InsightData>();

            if (data != null)
            {
                if (data.NetSavings < 0)
                {
                    insights.Add(new InsightData
                    {
                        Content = $"You're spending ${Math.Abs(data.NetSavings):F2} more than you earn this month. Consider reviewing your expenses.",
                        Type = "ALERT",
                        Priority = 3
                    });
                }
                else if (data.NetSavings > data.MonthlyIncome * 0.2m)
                {
                    insights.Add(new InsightData
                    {
                        Content = $"Great job! You're saving ${data.NetSavings:F2} this month, which is over 20% of your income.",
                        Type = "SAVING",
                        Priority = 1
                    });
                }

                if (Math.Abs(data.LargestExpense) > data.MonthlyIncome * 0.3m && data.MonthlyIncome > 0)
                {
                    insights.Add(new InsightData
                    {
                        Content = $"Your largest expense of ${Math.Abs(data.LargestExpense):F2} is quite significant compared to your income.",
                        Type = "SPENDING",
                        Priority = 2
                    });
                }

                if (data.TransactionCount > 100)
                {
                    insights.Add(new InsightData
                    {
                        Content = $"You made {data.TransactionCount} transactions this month. Consider consolidating purchases to track spending better.",
                        Type = "BUDGET",
                        Priority = 1
                    });
                }
            }

            // Add default insights if none generated
            if (!insights.Any())
            {
                insights.AddRange(new[]
                {
                    new InsightData
                    {
                        Content = "Track your expenses regularly to identify spending patterns and opportunities for savings.",
                        Type = "BUDGET",
                        Priority = 1
                    },
                    new InsightData
                    {
                        Content = "Consider setting up automated savings to build your emergency fund gradually.",
                        Type = "SAVING",
                        Priority = 2
                    },
                    new InsightData
                    {
                        Content = "Review your monthly subscriptions and cancel any services you're not actively using.",
                        Type = "SPENDING",
                        Priority = 2
                    }
                });
            }

            return insights;
        }

        private async Task<List<AIInsight>> GenerateMockInsights()
        {
            var mockInsights = new List<AIInsight>
            {
                new AIInsight
                {
                    Content = "Your spending has increased by 15% compared to last month. Consider reviewing your recent purchases to identify areas for optimization.",
                    Type = "SPENDING",
                    Priority = 2,
                    GeneratedAt = DateTime.UtcNow,
                    UserId = "default"
                },
                new AIInsight
                {
                    Content = "You're on track to meet your savings goal this month! Keep up the good work with your current financial habits.",
                    Type = "SAVING",
                    Priority = 1,
                    GeneratedAt = DateTime.UtcNow,
                    UserId = "default"
                },
                new AIInsight
                {
                    Content = "Consider setting up automated transfers to your savings account to build consistency in your saving habits.",
                    Type = "BUDGET",
                    Priority = 1,
                    GeneratedAt = DateTime.UtcNow,
                    UserId = "default"
                }
            };

            _context.AIInsights.AddRange(mockInsights);
            await _context.SaveChangesAsync();
            return mockInsights;
        }

        // Helper classes
        private class FinancialDataSummary
        {
            public decimal TotalBalance { get; set; }
            public decimal MonthlyIncome { get; set; }
            public decimal MonthlyExpenses { get; set; }
            public decimal NetSavings { get; set; }
            public int TransactionCount { get; set; }
            public int AccountCount { get; set; }
            public decimal LargestExpense { get; set; }
            public decimal AverageTransactionAmount { get; set; }
        }

        private class InsightData
        {
            public string Content { get; set; } = string.Empty;
            public string Type { get; set; } = string.Empty;
            public int Priority { get; set; }
        }

        private class OpenAIResponse
        {
            public Choice[]? Choices { get; set; }
        }

        private class Choice
        {
            public Message? Message { get; set; }
        }

        private class Message
        {
            public string? Content { get; set; }
        }
    }
}