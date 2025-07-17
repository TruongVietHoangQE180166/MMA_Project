import React, { createContext, useContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

export interface ThemeColors {
  // Background colors
  background: string;
  surface: string;
  surfaceVariant: string;
  card: string;
  
  // Text colors
  text: string;
  textSecondary: string;
  textMuted: string;
  onPrimary: string;
  onSurface: string;
  onSurfaceVariant: string;
  
 // Border colors
  border: string;
  divider: string;
  outline: string;
  
  // Status colors
  primary: string;
  success: string;
  warning: string;
  error: string;
  
  // Input colors
  inputBackground: string;
  inputBorder: string;
  placeholder: string;
  
  // Shadow colors
  shadowColor: string;
  shadow: string;
  overlay: string;
}

export interface Theme {
  colors: ThemeColors;
  isDark: boolean;
}

interface ThemeContextType {
  theme: Theme;
  isDark: boolean;
  toggleTheme: () => void;
  setTheme: (isDark: boolean) => void;
}

const lightTheme: ThemeColors = {
  background: '#F4F6FA',
  surface: '#FFFFFF',
  surfaceVariant: '#F1F3F7',
  card: '#F9FAFB',

  text: '#222B45',
  textSecondary: '#6B7280',
  textMuted: '#A0AEC0',
  onPrimary: '#FFFFFF',
  onSurface: '#222B45',
  onSurfaceVariant: '#4B5563',

  border: '#E5E7EB',
  divider: '#E5E7EB',
  outline: '#D1D5DB',

  primary: '#2563EB',
  success: '#10B981',
  warning: '#F59E0B',
  error: '#EF4444',

  inputBackground: '#FFFFFF',
  inputBorder: '#E5E7EB',
  placeholder: '#A0AEC0',

  shadowColor: '#000000',
  shadow: 'rgba(0, 0, 0, 0.08)',
  overlay: 'rgba(0, 0, 0, 0.4)',
};

const darkTheme: ThemeColors = {
  background: '#181A20',
  surface: '#232634',
  surfaceVariant: '#232634',
  card: '#232634',

  text: '#F3F6FC',
  textSecondary: '#A0AEC0',
  textMuted: '#6B7280',
  onPrimary: '#FFFFFF',
  onSurface: '#F3F6FC',
  onSurfaceVariant: '#A0AEC0',

  border: '#2D3142',
  divider: '#232634',
  outline: '#3B4252',

  primary: '#60A5FA',
  success: '#34D399',
  warning: '#FBBF24',
  error: '#F87171',

  inputBackground: '#232634',
  inputBorder: '#2D3142',
  placeholder: '#A0AEC0',

  shadowColor: '#000000',
  shadow: 'rgba(0, 0, 0, 0.25)',
  overlay: 'rgba(0, 0, 0, 0.7)',
};

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

const THEME_STORAGE_KEY = '@theme_preference';

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isDark, setIsDark] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  const theme: Theme = {
    colors: isDark ? darkTheme : lightTheme,
    isDark,
  };

  useEffect(() => {
    loadThemePreference();
  }, []);

  const loadThemePreference = async () => {
    try {
      const savedTheme = await AsyncStorage.getItem(THEME_STORAGE_KEY);
      if (savedTheme !== null) {
        setIsDark(savedTheme === 'dark');
      }
    } catch (error) {
      console.error('Failed to load theme preference:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const saveThemePreference = async (isDarkMode: boolean) => {
    try {
      await AsyncStorage.setItem(THEME_STORAGE_KEY, isDarkMode ? 'dark' : 'light');
    } catch (error) {
      console.error('Failed to save theme preference:', error);
    }
  };

  const toggleTheme = () => {
    const newTheme = !isDark;
    setIsDark(newTheme);
    saveThemePreference(newTheme);
  };

  const setTheme = (isDarkMode: boolean) => {
    setIsDark(isDarkMode);
    saveThemePreference(isDarkMode);
  };

  if (isLoading) {
    return null; // or a loading spinner
  }

  return (
    <ThemeContext.Provider 
      value={{ 
        theme, 
        isDark, 
        toggleTheme, 
        setTheme 
      }}
    >
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = (): ThemeContextType => {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};
