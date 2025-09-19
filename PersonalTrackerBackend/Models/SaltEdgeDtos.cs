using System.Text.Json.Serialization;

namespace PersonalTrackerBackend.Models
{
    // Salt Edge API Request DTOs
    public class CreateConnectSessionRequest
    {
        [JsonPropertyName("data")]
        public ConnectSessionData Data { get; set; } = new();
    }

    public class ConnectSessionData
    {
        [JsonPropertyName("customer_id")]
        public string CustomerId { get; set; } = string.Empty;

        [JsonPropertyName("return_url")]
        public string ReturnUrl { get; set; } = string.Empty;

        [JsonPropertyName("country_code")]
        public string CountryCode { get; set; } = "DK";

        [JsonPropertyName("provider_codes")]
        public string[]? ProviderCodes { get; set; }
    }

    // Salt Edge API Response DTOs
    public class SaltEdgeResponse<T>
    {
        [JsonPropertyName("data")]
        public T Data { get; set; } = default!;
    }

    public class ConnectSessionResponse
    {
        [JsonPropertyName("connect_url")]
        public string ConnectUrl { get; set; } = string.Empty;

        [JsonPropertyName("expires_at")]
        public DateTime ExpiresAt { get; set; }
    }

    public class SaltEdgeConnection
    {
        [JsonPropertyName("id")]
        public string Id { get; set; } = string.Empty;

        [JsonPropertyName("customer_id")]
        public string CustomerId { get; set; } = string.Empty;

        [JsonPropertyName("provider_id")]
        public string ProviderId { get; set; } = string.Empty;

        [JsonPropertyName("provider_code")]
        public string ProviderCode { get; set; } = string.Empty;

        [JsonPropertyName("provider_name")]
        public string ProviderName { get; set; } = string.Empty;

        [JsonPropertyName("status")]
        public string Status { get; set; } = string.Empty;

        [JsonPropertyName("categorization")]
        public string Categorization { get; set; } = string.Empty;

        [JsonPropertyName("created_at")]
        public DateTime CreatedAt { get; set; }

        [JsonPropertyName("updated_at")]
        public DateTime UpdatedAt { get; set; }

        [JsonPropertyName("consent_given_at")]
        public DateTime? ConsentGivenAt { get; set; }

        [JsonPropertyName("consent_expires_at")]
        public DateTime? ConsentExpiresAt { get; set; }
    }

    public class SaltEdgeAccount
    {
        [JsonPropertyName("id")]
        public string Id { get; set; } = string.Empty;

        [JsonPropertyName("connection_id")]
        public string ConnectionId { get; set; } = string.Empty;

        [JsonPropertyName("name")]
        public string Name { get; set; } = string.Empty;

        [JsonPropertyName("nature")]
        public string Nature { get; set; } = string.Empty; // account type

        [JsonPropertyName("balance")]
        public decimal Balance { get; set; }

        [JsonPropertyName("currency_code")]
        public string CurrencyCode { get; set; } = string.Empty;

        [JsonPropertyName("extra")]
        public SaltEdgeAccountExtra? Extra { get; set; }

        [JsonPropertyName("created_at")]
        public DateTime CreatedAt { get; set; }

        [JsonPropertyName("updated_at")]
        public DateTime UpdatedAt { get; set; }
    }

    public class SaltEdgeAccountExtra
    {
        [JsonPropertyName("iban")]
        public string? Iban { get; set; }

        [JsonPropertyName("account_number")]
        public string? AccountNumber { get; set; }

        [JsonPropertyName("swift")]
        public string? Swift { get; set; }

        [JsonPropertyName("available_amount")]
        public decimal? AvailableAmount { get; set; }
    }

    public class SaltEdgeTransaction
    {
        [JsonPropertyName("id")]
        public string Id { get; set; } = string.Empty;

        [JsonPropertyName("account_id")]
        public string AccountId { get; set; } = string.Empty;

        [JsonPropertyName("duplicated")]
        public bool Duplicated { get; set; }

        [JsonPropertyName("mode")]
        public string Mode { get; set; } = string.Empty; // normal, fee, transfer

        [JsonPropertyName("status")]
        public string Status { get; set; } = string.Empty;

        [JsonPropertyName("made_on")]
        public DateTime MadeOn { get; set; }

        [JsonPropertyName("amount")]
        public decimal Amount { get; set; }

        [JsonPropertyName("currency_code")]
        public string CurrencyCode { get; set; } = string.Empty;

        [JsonPropertyName("description")]
        public string Description { get; set; } = string.Empty;

        [JsonPropertyName("category")]
        public string Category { get; set; } = string.Empty;

        [JsonPropertyName("extra")]
        public SaltEdgeTransactionExtra? Extra { get; set; }

        [JsonPropertyName("created_at")]
        public DateTime CreatedAt { get; set; }

        [JsonPropertyName("updated_at")]
        public DateTime UpdatedAt { get; set; }
    }

    public class SaltEdgeTransactionExtra
    {
        [JsonPropertyName("merchant")]
        public string? Merchant { get; set; }

        [JsonPropertyName("original_amount")]
        public decimal? OriginalAmount { get; set; }

        [JsonPropertyName("original_currency_code")]
        public string? OriginalCurrencyCode { get; set; }

        [JsonPropertyName("running_balance")]
        public decimal? RunningBalance { get; set; }
    }

    public class SaltEdgeError
    {
        [JsonPropertyName("class")]
        public string ErrorClass { get; set; } = string.Empty;

        [JsonPropertyName("message")]
        public string Message { get; set; } = string.Empty;

        [JsonPropertyName("documentation_url")]
        public string? DocumentationUrl { get; set; }
    }

    public class SaltEdgeErrorResponse
    {
        [JsonPropertyName("error")]
        public SaltEdgeError Error { get; set; } = new();
    }
}