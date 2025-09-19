namespace PersonalTrackerBackend.Models
{
    public class AuthenticationResponse
    {
        public bool Success { get; set; }
        public string? AccessToken { get; set; }
        public string? RefreshToken { get; set; }
        public string? Error { get; set; }
        public bool RequiresAppPassword { get; set; }
        public string? AuthUrl { get; set; }
    }

    public class AuthenticationRequest
    {
        public string Email { get; set; } = string.Empty;
        public string? Password { get; set; }
        public string? AppPassword { get; set; }
        public string AuthType { get; set; } = "credentials"; // "credentials", "app_password", "oauth"
    }

    public class RefreshTokenRequest
    {
        public string RefreshToken { get; set; } = string.Empty;
    }
}