import React, { createContext, useContext } from 'react';

type Theme = 'light' | 'dark';

interface ThemeContextType {
  theme: Theme;
  setTheme: (theme: Theme) => void;
  toggleTheme: () => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};

interface ThemeProviderProps {
  children: React.ReactNode;
}

export const ThemeProvider: React.FC<ThemeProviderProps> = ({ children }) => {
  // Dark-only: provide a fixed context to keep consumers from breaking
  const value: ThemeContextType = {
    theme: 'dark',
    setTheme: () => {},
    toggleTheme: () => {}
  };
  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
};