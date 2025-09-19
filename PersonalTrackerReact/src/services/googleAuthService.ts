import axios from 'axios';

interface GoogleAuthCredentials {
  email: string;
  appPassword?: string; // For users with 2FA
  accessToken?: string;
}

interface AuthenticationResponse {
  success: boolean;
  accessToken?: string;
  refreshToken?: string;
  error?: string;
  requiresAppPassword?: boolean;
}

class GoogleAuthService {
  private credentials: GoogleAuthCredentials | null = null;
  private accessToken: string | null = null;

  // Simplified authentication using backend proxy
  async authenticateWithCredentials(email: string, password: string): Promise<AuthenticationResponse> {
    try {
      // Call backend to handle Google authentication
      const response = await axios.post('http://localhost:5000/api/GoogleCalendar/authenticate', {
        email,
        password,
        authType: 'credentials'
      });

      if (response.data.success) {
        this.accessToken = response.data.accessToken;
        this.credentials = { email, accessToken: response.data.accessToken };
        
        // Store in localStorage for persistence
        localStorage.setItem('google_auth', JSON.stringify({
          email,
          accessToken: response.data.accessToken,
          refreshToken: response.data.refreshToken,
          timestamp: Date.now()
        }));

        return response.data;
      }

      return response.data;
    } catch (error: any) {
      console.error('Authentication error:', error);
      
      // Handle specific Google auth errors
      if (error.response?.status === 401) {
        return {
          success: false,
          error: 'Invalid email or password. If you have 2FA enabled, please use an app-specific password.',
          requiresAppPassword: true
        };
      }

      return {
        success: false,
        error: error.response?.data?.message || 'Authentication failed. Please try again.'
      };
    }
  }

  // Authenticate with app-specific password (for 2FA users)
  async authenticateWithAppPassword(email: string, appPassword: string): Promise<AuthenticationResponse> {
    try {
      const response = await axios.post('http://localhost:5000/api/GoogleCalendar/authenticate', {
        email,
        appPassword,
        authType: 'app_password'
      });

      if (response.data.success) {
        this.accessToken = response.data.accessToken;
        this.credentials = { email, appPassword, accessToken: response.data.accessToken };
        
        localStorage.setItem('google_auth', JSON.stringify({
          email,
          accessToken: response.data.accessToken,
          refreshToken: response.data.refreshToken,
          timestamp: Date.now()
        }));

        return response.data;
      }

      return response.data;
    } catch (error: any) {
      console.error('App password authentication error:', error);
      return {
        success: false,
        error: error.response?.data?.message || 'Authentication with app password failed.'
      };
    }
  }

  // Simplified OAuth flow as fallback
  async authenticateWithOAuth(): Promise<AuthenticationResponse> {
    try {
      // Use backend OAuth endpoint for simplified flow
      const response = await axios.post('http://localhost:5000/api/GoogleCalendar/oauth/init');
      
      if (response.data.authUrl) {
        // Open popup for OAuth
        return new Promise((resolve) => {
          const popup = window.open(
            response.data.authUrl,
            'google-oauth',
            'width=500,height=600,scrollbars=yes,resizable=yes'
          );

          const checkClosed = setInterval(() => {
            if (popup?.closed) {
              clearInterval(checkClosed);
              // Check if auth was successful
              this.checkAuthStatus().then(resolve);
            }
          }, 1000);

          // Listen for success message
          window.addEventListener('message', (event) => {
            if (event.data.type === 'GOOGLE_AUTH_SUCCESS') {
              clearInterval(checkClosed);
              popup?.close();
              
              this.accessToken = event.data.accessToken;
              localStorage.setItem('google_auth', JSON.stringify({
                accessToken: event.data.accessToken,
                refreshToken: event.data.refreshToken,
                timestamp: Date.now()
              }));

              resolve({
                success: true,
                accessToken: event.data.accessToken,
                refreshToken: event.data.refreshToken
              });
            }
          });
        });
      }

      return { success: false, error: 'Failed to initialize OAuth flow' };
    } catch (error: any) {
      console.error('OAuth authentication error:', error);
      return {
        success: false,
        error: 'OAuth authentication failed'
      };
    }
  }

  // Check current authentication status
  async checkAuthStatus(): Promise<AuthenticationResponse> {
    const stored = localStorage.getItem('google_auth');
    if (stored) {
      try {
        const auth = JSON.parse(stored);
        
        // Check if token is still valid (less than 1 hour old)
        if (Date.now() - auth.timestamp < 3600000) {
          this.accessToken = auth.accessToken;
          return { success: true, accessToken: auth.accessToken };
        }
        
        // Try to refresh token
        if (auth.refreshToken) {
          return await this.refreshAccessToken(auth.refreshToken);
        }
      } catch (error) {
        console.error('Error parsing stored auth:', error);
      }
    }

    return { success: false, error: 'No valid authentication found' };
  }

  // Refresh access token
  async refreshAccessToken(refreshToken: string): Promise<AuthenticationResponse> {
    try {
      const response = await axios.post('http://localhost:5000/api/GoogleCalendar/refresh', {
        refreshToken
      });

      if (response.data.success) {
        this.accessToken = response.data.accessToken;
        
        // Update localStorage
        const stored = localStorage.getItem('google_auth');
        if (stored) {
          const auth = JSON.parse(stored);
          auth.accessToken = response.data.accessToken;
          auth.timestamp = Date.now();
          localStorage.setItem('google_auth', JSON.stringify(auth));
        }

        return response.data;
      }

      return response.data;
    } catch (error: any) {
      console.error('Token refresh error:', error);
      this.logout();
      return { success: false, error: 'Failed to refresh access token' };
    }
  }

  // Get current access token
  getAccessToken(): string | null {
    return this.accessToken;
  }

  // Check if user is authenticated
  isAuthenticated(): boolean {
    return !!this.accessToken;
  }

  // Logout
  logout(): void {
    this.accessToken = null;
    this.credentials = null;
    localStorage.removeItem('google_auth');
  }

  // Get user info
  getCredentials(): GoogleAuthCredentials | null {
    return this.credentials;
  }
}

export const googleAuthService = new GoogleAuthService();