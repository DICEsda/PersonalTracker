using Microsoft.AspNetCore.Mvc;
using PersonalTrackerBackend.Services;
using PersonalTrackerBackend.Models;

namespace PersonalTrackerBackend.Controllers;

[ApiController]
[Route("api/[controller]")]
public class GoogleCalendarController : ControllerBase
{
    private readonly IGoogleCalendarService _calendarService;

    public GoogleCalendarController(IGoogleCalendarService calendarService)
    {
        _calendarService = calendarService;
    }

    [HttpPost("authenticate")]
    public async Task<ActionResult<AuthenticationResponse>> Authenticate([FromBody] AuthenticationRequest request)
    {
        try
        {
            switch (request.AuthType.ToLower())
            {
                case "credentials":
                    return await AuthenticateWithCredentials(request.Email, request.Password ?? "");
                
                case "app_password":
                    return await AuthenticateWithAppPassword(request.Email, request.AppPassword ?? "");
                
                case "oauth":
                    return await InitiateOAuthFlow();
                
                default:
                    return BadRequest(new AuthenticationResponse 
                    { 
                        Success = false, 
                        Error = "Invalid authentication type" 
                    });
            }
        }
        catch (Exception ex)
        {
            return StatusCode(500, new AuthenticationResponse 
            { 
                Success = false, 
                Error = $"Authentication error: {ex.Message}" 
            });
        }
    }

    [HttpPost("refresh")]
    public async Task<ActionResult<AuthenticationResponse>> RefreshToken([FromBody] RefreshTokenRequest request)
    {
        try
        {
            var result = await _calendarService.RefreshAccessTokenAsync(request.RefreshToken);
            return Ok(result);
        }
        catch (Exception ex)
        {
            return StatusCode(500, new AuthenticationResponse 
            { 
                Success = false, 
                Error = $"Token refresh error: {ex.Message}" 
            });
        }
    }

    [HttpPost("oauth/init")]
    public async Task<ActionResult<AuthenticationResponse>> InitiateOAuth()
    {
        try
        {
            var result = await InitiateOAuthFlow();
            return Ok(result);
        }
        catch (Exception ex)
        {
            return StatusCode(500, new AuthenticationResponse 
            { 
                Success = false, 
                Error = $"OAuth initialization error: {ex.Message}" 
            });
        }
    }

    private Task<AuthenticationResponse> AuthenticateWithCredentials(string email, string password)
    {
        // Note: Direct password authentication is not supported by Google for security reasons
        // This would typically redirect to OAuth or require app-specific passwords
        
        try
        {
            // For demonstration, we'll return a response indicating app password is needed
            // In a real implementation, you might try OAuth or other methods
            
            return Task.FromResult(new AuthenticationResponse
            {
                Success = false,
                RequiresAppPassword = true,
                Error = "Google requires app-specific passwords for email/password authentication. Please enable 2FA and generate an app password, or use OAuth."
            });
        }
        catch (Exception ex)
        {
            return Task.FromResult(new AuthenticationResponse 
            { 
                Success = false, 
                Error = $"Credentials authentication failed: {ex.Message}" 
            });
        }
    }

    private async Task<AuthenticationResponse> AuthenticateWithAppPassword(string email, string appPassword)
    {
        try
        {
            // Attempt to authenticate using app-specific password
            var result = await _calendarService.AuthenticateWithAppPasswordAsync(email, appPassword);
            return result;
        }
        catch (Exception ex)
        {
            return new AuthenticationResponse 
            { 
                Success = false, 
                Error = $"App password authentication failed: {ex.Message}" 
            };
        }
    }

    private Task<AuthenticationResponse> InitiateOAuthFlow()
    {
        try
        {
            var authUrl = _calendarService.GetOAuthUrlAsync().Result;
            return Task.FromResult(new AuthenticationResponse
            {
                Success = true,
                AuthUrl = authUrl
            });
        }
        catch (Exception ex)
        {
            return Task.FromResult(new AuthenticationResponse 
            { 
                Success = false, 
                Error = $"OAuth flow initiation failed: {ex.Message}" 
            });
        }
    }

    [HttpGet("calendars")]
    public async Task<ActionResult<CalendarListResponse>> GetCalendars([FromHeader(Name = "Authorization")] string authorization)
    {
        try
        {
            var accessToken = ExtractAccessToken(authorization);
            if (string.IsNullOrEmpty(accessToken))
                return Unauthorized("Access token is required");

            var calendars = await _calendarService.GetCalendarsAsync(accessToken);
            return Ok(calendars);
        }
        catch (Exception ex)
        {
            return StatusCode(500, $"Internal server error: {ex.Message}");
        }
    }

    [HttpGet("calendars/{calendarId}/events")]
    public async Task<ActionResult<EventsResponse>> GetEvents(
        string calendarId,
        [FromQuery] DateTime? startDate,
        [FromQuery] DateTime? endDate,
        [FromQuery] string? pageToken,
        [FromHeader(Name = "Authorization")] string authorization)
    {
        try
        {
            var accessToken = ExtractAccessToken(authorization);
            if (string.IsNullOrEmpty(accessToken))
                return Unauthorized("Access token is required");

            var events = await _calendarService.GetEventsAsync(calendarId, startDate, endDate, pageToken);
            return Ok(events);
        }
        catch (Exception ex)
        {
            return StatusCode(500, $"Internal server error: {ex.Message}");
        }
    }

    [HttpPost("calendars/{calendarId}/events")]
    public async Task<ActionResult<GoogleCalendarEvent>> CreateEvent(
        string calendarId,
        [FromBody] CreateEventRequest request,
        [FromHeader(Name = "Authorization")] string authorization)
    {
        try
        {
            var accessToken = ExtractAccessToken(authorization);
            if (string.IsNullOrEmpty(accessToken))
                return Unauthorized("Access token is required");

            var createdEvent = await _calendarService.CreateEventAsync(calendarId, request, accessToken);
            return CreatedAtAction(nameof(GetEvents), new { calendarId }, createdEvent);
        }
        catch (Exception ex)
        {
            return StatusCode(500, $"Internal server error: {ex.Message}");
        }
    }

    [HttpPut("calendars/{calendarId}/events/{eventId}")]
    public async Task<ActionResult<GoogleCalendarEvent>> UpdateEvent(
        string calendarId,
        string eventId,
        [FromBody] UpdateEventRequest request,
        [FromHeader(Name = "Authorization")] string authorization)
    {
        try
        {
            var accessToken = ExtractAccessToken(authorization);
            if (string.IsNullOrEmpty(accessToken))
                return Unauthorized("Access token is required");

            request.Id = eventId;
            var updatedEvent = await _calendarService.UpdateEventAsync(calendarId, request, accessToken);
            return Ok(updatedEvent);
        }
        catch (Exception ex)
        {
            return StatusCode(500, $"Internal server error: {ex.Message}");
        }
    }

    [HttpDelete("calendars/{calendarId}/events/{eventId}")]
    public async Task<ActionResult> DeleteEvent(
        string calendarId,
        string eventId,
        [FromHeader(Name = "Authorization")] string authorization)
    {
        try
        {
            var accessToken = ExtractAccessToken(authorization);
            if (string.IsNullOrEmpty(accessToken))
                return Unauthorized("Access token is required");

            await _calendarService.DeleteEventAsync(calendarId, eventId, accessToken);
            return NoContent();
        }
        catch (Exception ex)
        {
            return StatusCode(500, $"Internal server error: {ex.Message}");
        }
    }

    private static string ExtractAccessToken(string authorization)
    {
        if (string.IsNullOrEmpty(authorization) || !authorization.StartsWith("Bearer "))
            return string.Empty;

        return authorization.Substring("Bearer ".Length);
    }
} 