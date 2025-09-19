using PersonalTrackerBackend.Models;
using System.Text;
using System.Text.Json;

namespace PersonalTrackerBackend.Services
{
    public interface ISaltEdgeService
    {
        Task<string> CreateConnectSessionAsync(string userId, string returnUrl, string[]? providerCodes = null);
        Task<SaltEdgeConnection?> GetConnectionAsync(string connectionId);
        Task<List<SaltEdgeConnection>> GetConnectionsAsync(string customerId);
        Task<List<SaltEdgeAccount>> GetAccountsAsync(string connectionId);
        Task<List<SaltEdgeTransaction>> GetTransactionsAsync(string accountId, DateTime? fromDate = null, DateTime? toDate = null);
        Task<bool> RefreshConnectionAsync(string connectionId);
        Task<bool> RemoveConnectionAsync(string connectionId);
    }

    public class SaltEdgeService : ISaltEdgeService
    {
        private readonly HttpClient _httpClient;
        private readonly ILogger<SaltEdgeService> _logger;
        private readonly string _appId;
        private readonly string _secret;
        private readonly string _baseUrl;

        public SaltEdgeService(HttpClient httpClient, IConfiguration configuration, ILogger<SaltEdgeService> logger)
        {
            _httpClient = httpClient;
            _logger = logger;
            _appId = configuration["SaltEdge:AppId"] ?? throw new InvalidOperationException("SaltEdge:AppId is not configured");
            _secret = configuration["SaltEdge:Secret"] ?? throw new InvalidOperationException("SaltEdge:Secret is not configured");
            _baseUrl = configuration["SaltEdge:BaseUrl"] ?? "https://www.saltedge.com/api/v5";

            // Configure HTTP client
            _httpClient.BaseAddress = new Uri(_baseUrl);
            _httpClient.DefaultRequestHeaders.Add("Accept", "application/json");
            _httpClient.DefaultRequestHeaders.Add("Content-Type", "application/json");
        }

        public async Task<string> CreateConnectSessionAsync(string userId, string returnUrl, string[]? providerCodes = null)
        {
            try
            {
                var request = new CreateConnectSessionRequest
                {
                    Data = new ConnectSessionData
                    {
                        CustomerId = userId,
                        ReturnUrl = returnUrl,
                        CountryCode = "DK",
                        ProviderCodes = providerCodes
                    }
                };

                var json = JsonSerializer.Serialize(request);
                var content = new StringContent(json, Encoding.UTF8, "application/json");

                // Add authentication headers
                AddAuthenticationHeaders(content, "POST", "/connect_sessions");

                var response = await _httpClient.PostAsync("/connect_sessions", content);

                if (response.IsSuccessStatusCode)
                {
                    var responseJson = await response.Content.ReadAsStringAsync();
                    var sessionResponse = JsonSerializer.Deserialize<SaltEdgeResponse<ConnectSessionResponse>>(responseJson);
                    return sessionResponse?.Data?.ConnectUrl ?? throw new InvalidOperationException("Invalid response from Salt Edge");
                }
                else
                {
                    var errorJson = await response.Content.ReadAsStringAsync();
                    _logger.LogError("Salt Edge API error: {StatusCode} - {Error}", response.StatusCode, errorJson);
                    throw new HttpRequestException($"Salt Edge API error: {response.StatusCode}");
                }
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error creating Salt Edge connect session for user {UserId}", userId);
                throw;
            }
        }

        public async Task<SaltEdgeConnection?> GetConnectionAsync(string connectionId)
        {
            try
            {
                AddAuthenticationHeaders(null, "GET", $"/connections/{connectionId}");
                var response = await _httpClient.GetAsync($"/connections/{connectionId}");

                if (response.IsSuccessStatusCode)
                {
                    var responseJson = await response.Content.ReadAsStringAsync();
                    var connectionResponse = JsonSerializer.Deserialize<SaltEdgeResponse<SaltEdgeConnection>>(responseJson);
                    return connectionResponse?.Data;
                }
                else if (response.StatusCode == System.Net.HttpStatusCode.NotFound)
                {
                    return null;
                }
                else
                {
                    var errorJson = await response.Content.ReadAsStringAsync();
                    _logger.LogError("Salt Edge API error: {StatusCode} - {Error}", response.StatusCode, errorJson);
                    throw new HttpRequestException($"Salt Edge API error: {response.StatusCode}");
                }
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting Salt Edge connection {ConnectionId}", connectionId);
                throw;
            }
        }

        public async Task<List<SaltEdgeConnection>> GetConnectionsAsync(string customerId)
        {
            try
            {
                AddAuthenticationHeaders(null, "GET", $"/connections?customer_id={customerId}");
                var response = await _httpClient.GetAsync($"/connections?customer_id={customerId}");

                if (response.IsSuccessStatusCode)
                {
                    var responseJson = await response.Content.ReadAsStringAsync();
                    var connectionsResponse = JsonSerializer.Deserialize<SaltEdgeResponse<List<SaltEdgeConnection>>>(responseJson);
                    return connectionsResponse?.Data ?? new List<SaltEdgeConnection>();
                }
                else
                {
                    var errorJson = await response.Content.ReadAsStringAsync();
                    _logger.LogError("Salt Edge API error: {StatusCode} - {Error}", response.StatusCode, errorJson);
                    throw new HttpRequestException($"Salt Edge API error: {response.StatusCode}");
                }
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting Salt Edge connections for customer {CustomerId}", customerId);
                throw;
            }
        }

        public async Task<List<SaltEdgeAccount>> GetAccountsAsync(string connectionId)
        {
            try
            {
                AddAuthenticationHeaders(null, "GET", $"/accounts?connection_id={connectionId}");
                var response = await _httpClient.GetAsync($"/accounts?connection_id={connectionId}");

                if (response.IsSuccessStatusCode)
                {
                    var responseJson = await response.Content.ReadAsStringAsync();
                    var accountsResponse = JsonSerializer.Deserialize<SaltEdgeResponse<List<SaltEdgeAccount>>>(responseJson);
                    return accountsResponse?.Data ?? new List<SaltEdgeAccount>();
                }
                else
                {
                    var errorJson = await response.Content.ReadAsStringAsync();
                    _logger.LogError("Salt Edge API error: {StatusCode} - {Error}", response.StatusCode, errorJson);
                    throw new HttpRequestException($"Salt Edge API error: {response.StatusCode}");
                }
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting Salt Edge accounts for connection {ConnectionId}", connectionId);
                throw;
            }
        }

        public async Task<List<SaltEdgeTransaction>> GetTransactionsAsync(string accountId, DateTime? fromDate = null, DateTime? toDate = null)
        {
            try
            {
                var queryParams = new List<string> { $"account_id={accountId}" };
                
                if (fromDate.HasValue)
                    queryParams.Add($"from_date={fromDate.Value:yyyy-MM-dd}");
                
                if (toDate.HasValue)
                    queryParams.Add($"to_date={toDate.Value:yyyy-MM-dd}");

                var queryString = string.Join("&", queryParams);
                var endpoint = $"/transactions?{queryString}";

                AddAuthenticationHeaders(null, "GET", endpoint);
                var response = await _httpClient.GetAsync(endpoint);

                if (response.IsSuccessStatusCode)
                {
                    var responseJson = await response.Content.ReadAsStringAsync();
                    var transactionsResponse = JsonSerializer.Deserialize<SaltEdgeResponse<List<SaltEdgeTransaction>>>(responseJson);
                    return transactionsResponse?.Data ?? new List<SaltEdgeTransaction>();
                }
                else
                {
                    var errorJson = await response.Content.ReadAsStringAsync();
                    _logger.LogError("Salt Edge API error: {StatusCode} - {Error}", response.StatusCode, errorJson);
                    throw new HttpRequestException($"Salt Edge API error: {response.StatusCode}");
                }
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting Salt Edge transactions for account {AccountId}", accountId);
                throw;
            }
        }

        public async Task<bool> RefreshConnectionAsync(string connectionId)
        {
            try
            {
                var content = new StringContent("{}", Encoding.UTF8, "application/json");
                AddAuthenticationHeaders(content, "PUT", $"/connections/{connectionId}/refresh");
                
                var response = await _httpClient.PutAsync($"/connections/{connectionId}/refresh", content);
                return response.IsSuccessStatusCode;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error refreshing Salt Edge connection {ConnectionId}", connectionId);
                return false;
            }
        }

        public async Task<bool> RemoveConnectionAsync(string connectionId)
        {
            try
            {
                AddAuthenticationHeaders(null, "DELETE", $"/connections/{connectionId}");
                var response = await _httpClient.DeleteAsync($"/connections/{connectionId}");
                return response.IsSuccessStatusCode;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error removing Salt Edge connection {ConnectionId}", connectionId);
                return false;
            }
        }

        private void AddAuthenticationHeaders(HttpContent? content, string method, string url)
        {
            var timestamp = DateTimeOffset.UtcNow.ToUnixTimeSeconds().ToString();
            var nonce = Guid.NewGuid().ToString();

            // Create signature
            var payloadHash = "";
            if (content != null)
            {
                var payloadBytes = content.ReadAsByteArrayAsync().Result;
                payloadHash = Convert.ToBase64String(System.Security.Cryptography.SHA256.HashData(payloadBytes));
            }

            var stringToSign = $"{timestamp}|{nonce}|{method}|{url}|{payloadHash}";
            var signature = CreateSignature(stringToSign, _secret);

            // Clear existing auth headers
            _httpClient.DefaultRequestHeaders.Remove("App-id");
            _httpClient.DefaultRequestHeaders.Remove("Timestamp");
            _httpClient.DefaultRequestHeaders.Remove("Nonce");
            _httpClient.DefaultRequestHeaders.Remove("Signature");

            // Add new auth headers
            _httpClient.DefaultRequestHeaders.Add("App-id", _appId);
            _httpClient.DefaultRequestHeaders.Add("Timestamp", timestamp);
            _httpClient.DefaultRequestHeaders.Add("Nonce", nonce);
            _httpClient.DefaultRequestHeaders.Add("Signature", signature);
        }

        private static string CreateSignature(string stringToSign, string secret)
        {
            var keyBytes = Encoding.UTF8.GetBytes(secret);
            var messageBytes = Encoding.UTF8.GetBytes(stringToSign);
            
            using var hmac = new System.Security.Cryptography.HMACSHA256(keyBytes);
            var hash = hmac.ComputeHash(messageBytes);
            return Convert.ToBase64String(hash);
        }
    }
}