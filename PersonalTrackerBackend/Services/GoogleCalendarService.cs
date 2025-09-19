using Google.Apis.Calendar.v3;
using Google.Apis.Calendar.v3.Data;
using Google.Apis.Auth.OAuth2;
using Google.Apis.Services;
using PersonalTrackerBackend.Models;
using Microsoft.Extensions.Configuration;

namespace PersonalTrackerBackend.Services;

public interface IGoogleCalendarService
{
    Task<CalendarListResponse> GetCalendarsAsync(string accessToken);
    Task<EventsResponse> GetEventsAsync(string calendarId, DateTime? startDate = null, DateTime? endDate = null, string? pageToken = null);
    Task<GoogleCalendarEvent> CreateEventAsync(string calendarId, CreateEventRequest request, string accessToken);
    Task<GoogleCalendarEvent> UpdateEventAsync(string calendarId, UpdateEventRequest request, string accessToken);
    Task DeleteEventAsync(string calendarId, string eventId, string accessToken);
    
    // New authentication methods
    Task<AuthenticationResponse> AuthenticateWithAppPasswordAsync(string email, string appPassword);
    Task<AuthenticationResponse> RefreshAccessTokenAsync(string refreshToken);
    Task<string> GetOAuthUrlAsync();
}

public class GoogleCalendarService : IGoogleCalendarService
{
    private readonly IConfiguration _configuration;

    public GoogleCalendarService(IConfiguration configuration)
    {
        _configuration = configuration;
    }

    private CalendarService CreateCalendarService(string accessToken)
    {
        var credential = GoogleCredential.FromAccessToken(accessToken);
        
        return new CalendarService(new BaseClientService.Initializer
        {
            HttpClientInitializer = credential,
            ApplicationName = _configuration["GoogleCalendar:ApplicationName"]
        });
    }

    public async Task<CalendarListResponse> GetCalendarsAsync(string accessToken)
    {
        var service = CreateCalendarService(accessToken);
        var calendarList = await service.CalendarList.List().ExecuteAsync();

        var calendars = calendarList.Items?.Select(c => new CalendarInfo
        {
            Id = c.Id,
            Summary = c.Summary,
            Description = c.Description ?? string.Empty,
            Primary = c.Primary ?? false,
            AccessRole = c.AccessRole
        }).ToList() ?? new List<CalendarInfo>();

        return new CalendarListResponse { Calendars = calendars };
    }

    public async Task<EventsResponse> GetEventsAsync(string calendarId, DateTime? startDate = null, DateTime? endDate = null, string? pageToken = null)
    {
        var service = CreateCalendarService(""); // We'll need to handle auth differently
        var request = service.Events.List(calendarId);
        
        if (startDate.HasValue)
            request.TimeMinDateTimeOffset = startDate.Value;
        if (endDate.HasValue)
            request.TimeMaxDateTimeOffset = endDate.Value;
        if (!string.IsNullOrEmpty(pageToken))
            request.PageToken = pageToken;

        request.OrderBy = EventsResource.ListRequest.OrderByEnum.StartTime;
        request.SingleEvents = true;

        var events = await request.ExecuteAsync();

        var calendarEvents = events.Items?.Select(e => new GoogleCalendarEvent
        {
            Id = e.Id,
            Summary = e.Summary ?? string.Empty,
            Description = e.Description ?? string.Empty,
            Start = e.Start.DateTimeDateTimeOffset?.UtcDateTime ?? DateTime.MinValue,
            End = e.End.DateTimeDateTimeOffset?.UtcDateTime ?? DateTime.MinValue,
            Location = e.Location ?? string.Empty,
            IsAllDay = e.Start.DateTimeDateTimeOffset == null,
            ColorId = e.ColorId ?? string.Empty
        }).ToList() ?? new List<GoogleCalendarEvent>();

        return new EventsResponse
        {
            Events = calendarEvents,
            NextPageToken = events.NextPageToken ?? string.Empty
        };
    }

    public async Task<GoogleCalendarEvent> CreateEventAsync(string calendarId, CreateEventRequest request, string accessToken)
    {
        var service = CreateCalendarService(accessToken);
        
        var calendarEvent = new Event
        {
            Summary = request.Summary,
            Description = request.Description,
            Location = request.Location,
            ColorId = request.ColorId
        };

        if (request.IsAllDay)
        {
            calendarEvent.Start = new EventDateTime { Date = request.Start.Date.ToString("yyyy-MM-dd") };
            calendarEvent.End = new EventDateTime { Date = request.End.Date.ToString("yyyy-MM-dd") };
        }
        else
        {
            calendarEvent.Start = new EventDateTime { DateTimeDateTimeOffset = request.Start };
            calendarEvent.End = new EventDateTime { DateTimeDateTimeOffset = request.End };
        }

        var createdEvent = await service.Events.Insert(calendarEvent, calendarId).ExecuteAsync();

        return new GoogleCalendarEvent
        {
            Id = createdEvent.Id,
            Summary = createdEvent.Summary ?? string.Empty,
            Description = createdEvent.Description ?? string.Empty,
            Start = createdEvent.Start.DateTimeDateTimeOffset?.UtcDateTime ?? DateTime.MinValue,
            End = createdEvent.End.DateTimeDateTimeOffset?.UtcDateTime ?? DateTime.MinValue,
            Location = createdEvent.Location ?? string.Empty,
            IsAllDay = createdEvent.Start.DateTimeDateTimeOffset == null,
            ColorId = createdEvent.ColorId ?? string.Empty
        };
    }

    public async Task<GoogleCalendarEvent> UpdateEventAsync(string calendarId, UpdateEventRequest request, string accessToken)
    {
        var service = CreateCalendarService(accessToken);
        
        var calendarEvent = new Event
        {
            Summary = request.Summary,
            Description = request.Description,
            Location = request.Location,
            ColorId = request.ColorId
        };

        if (request.IsAllDay)
        {
            calendarEvent.Start = new EventDateTime { Date = request.Start.Date.ToString("yyyy-MM-dd") };
            calendarEvent.End = new EventDateTime { Date = request.End.Date.ToString("yyyy-MM-dd") };
        }
        else
        {
            calendarEvent.Start = new EventDateTime { DateTimeDateTimeOffset = request.Start };
            calendarEvent.End = new EventDateTime { DateTimeDateTimeOffset = request.End };
        }

        var updatedEvent = await service.Events.Update(calendarEvent, calendarId, request.Id).ExecuteAsync();

        return new GoogleCalendarEvent
        {
            Id = updatedEvent.Id,
            Summary = updatedEvent.Summary ?? string.Empty,
            Description = updatedEvent.Description ?? string.Empty,
            Start = updatedEvent.Start.DateTimeDateTimeOffset?.UtcDateTime ?? DateTime.MinValue,
            End = updatedEvent.End.DateTimeDateTimeOffset?.UtcDateTime ?? DateTime.MinValue,
            Location = updatedEvent.Location ?? string.Empty,
            IsAllDay = updatedEvent.Start.DateTimeDateTimeOffset == null,
            ColorId = updatedEvent.ColorId ?? string.Empty
        };
    }

    public async Task DeleteEventAsync(string calendarId, string eventId, string accessToken)
    {
        var service = CreateCalendarService(accessToken);
        await service.Events.Delete(calendarId, eventId).ExecuteAsync();
    }

    public Task<AuthenticationResponse> AuthenticateWithAppPasswordAsync(string email, string appPassword)
    {
        try
        {
            // Note: Google Calendar API doesn't support direct app password authentication
            // App passwords are primarily for IMAP/SMTP and other legacy protocols
            // We'll need to guide users to OAuth instead
            
            return Task.FromResult(new AuthenticationResponse
            {
                Success = false,
                Error = "Google Calendar API requires OAuth authentication. App passwords are not supported for Calendar access. Please use the OAuth option.",
                RequiresAppPassword = false
            });
        }
        catch (Exception ex)
        {
            return Task.FromResult(new AuthenticationResponse
            {
                Success = false,
                Error = $"App password authentication failed: {ex.Message}"
            });
        }
    }

    public async Task<AuthenticationResponse> RefreshAccessTokenAsync(string refreshToken)
    {
        try
        {
            // Implementation for refreshing OAuth tokens
            // This would typically involve calling Google's token refresh endpoint
            
            var clientId = _configuration["GoogleCalendar:ClientId"];
            var clientSecret = _configuration["GoogleCalendar:ClientSecret"];
            
            if (string.IsNullOrEmpty(clientId) || string.IsNullOrEmpty(clientSecret))
            {
                throw new InvalidOperationException("Google OAuth credentials not configured");
            }

            using var httpClient = new HttpClient();
            var requestBody = new Dictionary<string, string>
            {
                {"client_id", clientId},
                {"client_secret", clientSecret},
                {"refresh_token", refreshToken},
                {"grant_type", "refresh_token"}
            };

            var content = new FormUrlEncodedContent(requestBody);
            var response = await httpClient.PostAsync("https://oauth2.googleapis.com/token", content);
            
            if (response.IsSuccessStatusCode)
            {
                var responseBody = await response.Content.ReadAsStringAsync();
                var tokenResponse = System.Text.Json.JsonSerializer.Deserialize<TokenResponse>(responseBody);
                
                return new AuthenticationResponse
                {
                    Success = true,
                    AccessToken = tokenResponse?.access_token,
                    RefreshToken = tokenResponse?.refresh_token ?? refreshToken // Use new refresh token if provided
                };
            }
            else
            {
                var errorBody = await response.Content.ReadAsStringAsync();
                return new AuthenticationResponse
                {
                    Success = false,
                    Error = $"Token refresh failed: {errorBody}"
                };
            }
        }
        catch (Exception ex)
        {
            return new AuthenticationResponse
            {
                Success = false,
                Error = $"Token refresh failed: {ex.Message}"
            };
        }
    }

    public Task<string> GetOAuthUrlAsync()
    {
        try
        {
            var clientId = _configuration["GoogleCalendar:ClientId"];
            var redirectUri = _configuration["GoogleCalendar:RedirectUri"];
            
            if (string.IsNullOrEmpty(clientId) || string.IsNullOrEmpty(redirectUri))
            {
                throw new InvalidOperationException("Google OAuth configuration missing");
            }

            var scopes = "https://www.googleapis.com/auth/calendar";
            var state = Guid.NewGuid().ToString(); // For security
            
            var authUrl = $"https://accounts.google.com/o/oauth2/v2/auth?" +
                         $"client_id={Uri.EscapeDataString(clientId)}&" +
                         $"redirect_uri={Uri.EscapeDataString(redirectUri)}&" +
                         $"scope={Uri.EscapeDataString(scopes)}&" +
                         $"response_type=code&" +
                         $"access_type=offline&" +
                         $"prompt=consent&" +
                         $"state={state}";

            return Task.FromResult(authUrl);
        }
        catch (Exception ex)
        {
            throw new InvalidOperationException($"Failed to generate OAuth URL: {ex.Message}");
        }
    }

    // Helper class for token response parsing
    private class TokenResponse
    {
        public string? access_token { get; set; }
        public string? refresh_token { get; set; }
        public int expires_in { get; set; }
        public string? token_type { get; set; }
    }
} 