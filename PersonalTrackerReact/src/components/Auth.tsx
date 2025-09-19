import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { personalTrackerApi } from '../services/personalTrackerApi';

interface AuthProviderProps {
  children: React.ReactNode;
}

interface AuthContextType {
  user: any | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: () => Promise<void>;
  logout: () => void;
}

const AuthContext = React.createContext<AuthContextType | null>(null);

export const useAuth = () => {
  const context = React.useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<any | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    checkAuthStatus();
  }, []);

  const checkAuthStatus = async () => {
    try {
      if (personalTrackerApi.isAuthenticated()) {
        const token = localStorage.getItem('access_token');
        if (token && token.startsWith('demo-token-')) {
          // Demo mode - set demo user
          setUser({
            id: 'demo-user',
            email: 'demo@personaltracker.com',
            name: 'Demo User',
            picture: undefined
          });
        } else {
          // Real authentication - get user from API
          const userData = await personalTrackerApi.getCurrentUser();
          setUser(userData);
        }
      }
    } catch (error) {
      console.error('Auth check failed:', error);
      personalTrackerApi.clearAccessToken();
    } finally {
      setIsLoading(false);
    }
  };

  const login = async (): Promise<void> => {
    return new Promise((resolve, reject) => {
      // Google OAuth2 configuration
      const clientId = import.meta.env.VITE_GOOGLE_CLIENT_ID;
      
      // Check if client ID is properly configured
      if (!clientId || clientId === 'your-google-client-id' || clientId.includes('your-google')) {
        alert('Google OAuth is not properly configured. Please set VITE_GOOGLE_CLIENT_ID in your .env file.');
        reject(new Error('Google OAuth not configured'));
        return;
      }
      
      const redirectUri = `${window.location.origin}/auth/callback`;
      const scope = 'openid email profile';
      
      const authUrl = `https://accounts.google.com/o/oauth2/v2/auth?` +
        `client_id=${encodeURIComponent(clientId)}&` +
        `redirect_uri=${encodeURIComponent(redirectUri)}&` +
        `response_type=token&` +
        `scope=${encodeURIComponent(scope)}&` +
        `include_granted_scopes=true&` +
        `state=${Date.now()}`;

      // Open popup window
      const popup = window.open(
        authUrl,
        'google-auth',
        'width=500,height=600,scrollbars=yes,resizable=yes'
      );

      // Listen for messages from popup
      const messageListener = (event: MessageEvent) => {
        if (event.origin !== window.location.origin) return;

        if (event.data.type === 'GOOGLE_AUTH_SUCCESS') {
          personalTrackerApi.setAccessToken(event.data.accessToken);
          checkAuthStatus().then(() => {
            window.removeEventListener('message', messageListener);
            resolve();
          });
        } else if (event.data.type === 'GOOGLE_AUTH_ERROR') {
          window.removeEventListener('message', messageListener);
          reject(new Error(event.data.error));
        }
      };

      window.addEventListener('message', messageListener);

      // Check if popup was closed manually
      const checkClosed = setInterval(() => {
        if (popup?.closed) {
          clearInterval(checkClosed);
          window.removeEventListener('message', messageListener);
          reject(new Error('Authentication cancelled'));
        }
      }, 1000);
    });
  };

  const logout = () => {
    personalTrackerApi.clearAccessToken();
    setUser(null);
  };

  const value = {
    user,
    isAuthenticated: !!user,
    isLoading,
    login,
    logout
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export const LoginScreen: React.FC = () => {
  const { login } = useAuth();
  const [isLoggingIn, setIsLoggingIn] = useState(false);

  const handleLogin = async () => {
    setIsLoggingIn(true);
    try {
      await login();
    } catch (error) {
      console.error('Login failed:', error);
      alert('Login failed. Please try again.');
    } finally {
      setIsLoggingIn(false);
    }
  };

  const handleDemoLogin = () => {
    // For development - bypass OAuth with demo user
    const demoToken = 'demo-token-' + Date.now();
    personalTrackerApi.setAccessToken(demoToken);
    
    // Trigger a page reload to update auth state
    window.location.reload();
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 to-red-50 dark:from-stone-900 dark:to-stone-800 flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="widget-card p-8 max-w-md w-full"
      >
        <div className="text-center mb-8">
          <div className="w-16 h-16 rounded-full bg-orange-500 flex items-center justify-center text-white font-bold text-2xl mx-auto mb-4">
            PT
          </div>
          <h1 className="text-3xl font-bold text-stone-800 dark:text-stone-100 mb-2">
            Personal Tracker
          </h1>
          <p className="text-stone-600 dark:text-stone-400">
            Track your wellness journey with AI insights
          </p>
        </div>

        <button
          onClick={handleLogin}
          disabled={isLoggingIn}
          className="w-full bg-white border border-stone-300 dark:border-stone-600 hover:bg-stone-50 dark:hover:bg-stone-700 disabled:opacity-50 disabled:cursor-not-allowed text-stone-700 dark:text-stone-300 font-medium py-3 px-4 rounded-lg transition-colors flex items-center justify-center space-x-3 mb-3"
        >
          {isLoggingIn ? (
            <>
              <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-stone-600"></div>
              <span>Signing in...</span>
            </>
          ) : (
            <>
              <svg className="w-5 h-5" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
              </svg>
              <span>Continue with Google</span>
            </>
          )}
        </button>

        {/* Demo Login for Development */}
        <button
          onClick={handleDemoLogin}
          className="w-full bg-orange-500 hover:bg-orange-600 text-white font-medium py-3 px-4 rounded-lg transition-colors"
        >
          Demo Login (Development Only)
        </button>

        <div className="mt-6 text-center text-sm text-stone-500 dark:text-stone-400">
          By signing in, you agree to our terms of service and privacy policy.
        </div>
      </motion.div>
    </div>
  );
};