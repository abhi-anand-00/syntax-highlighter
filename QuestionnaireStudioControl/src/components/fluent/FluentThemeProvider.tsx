/**
 * Fluent UI Provider Configuration
 * 
 * This module provides the FluentProvider wrapper with custom theme
 * that aligns with the existing design system tokens.
 */

import * as React from 'react';
import {
  FluentProvider,
  webLightTheme,
  webDarkTheme,
  createLightTheme,
  createDarkTheme,
  type BrandVariants,
  type Theme,
} from '@fluentui/react-components';

// ============================================================================
// Brand Colors (matching existing design tokens)
// ============================================================================

/**
 * Custom brand colors based on the project's primary color
 * Generates a full palette from the base brand color
 */
const customBrand: BrandVariants = {
  10: '#050205',
  20: '#1f1021',
  30: '#35153a',
  40: '#48194f',
  50: '#5b1c64',
  60: '#6f1f7a',
  70: '#832291',
  80: '#9725a8', // Primary
  90: '#a83db5',
  100: '#b855c2',
  110: '#c86ccf',
  120: '#d884db',
  130: '#e79ce7',
  140: '#f4b5f2',
  150: '#ffd0fc',
  160: '#ffe8fd',
};

// ============================================================================
// Custom Themes
// ============================================================================

/**
 * Light theme with custom brand colors
 */
export const customLightTheme: Theme = {
  ...createLightTheme(customBrand),
};

/**
 * Dark theme with custom brand colors
 */
export const customDarkTheme: Theme = {
  ...createDarkTheme(customBrand),
};

// Override specific tokens to match existing design system
customLightTheme.colorNeutralBackground1 = 'hsl(0, 0%, 100%)';
customLightTheme.colorNeutralBackground2 = 'hsl(0, 0%, 98%)';
customLightTheme.colorNeutralBackground3 = 'hsl(0, 0%, 96%)';
customLightTheme.colorNeutralForeground1 = 'hsl(240, 10%, 3.9%)';
customLightTheme.colorNeutralForeground2 = 'hsl(240, 5.9%, 10%)';
customLightTheme.colorNeutralStroke1 = 'hsl(240, 5.9%, 90%)';

customDarkTheme.colorNeutralBackground1 = 'hsl(240, 10%, 3.9%)';
customDarkTheme.colorNeutralBackground2 = 'hsl(240, 3.7%, 10%)';
customDarkTheme.colorNeutralBackground3 = 'hsl(240, 3.7%, 15%)';
customDarkTheme.colorNeutralForeground1 = 'hsl(0, 0%, 98%)';
customDarkTheme.colorNeutralForeground2 = 'hsl(240, 5%, 84%)';
customDarkTheme.colorNeutralStroke1 = 'hsl(240, 3.7%, 20%)';

// ============================================================================
// Provider Component
// ============================================================================

interface FluentThemeProviderProps {
  children: React.ReactNode;
  /** Use dark theme */
  dark?: boolean;
  /** Use web default theme instead of custom */
  useDefaultTheme?: boolean;
}

/**
 * Fluent UI Theme Provider
 * 
 * Wraps the application with FluentProvider and applies custom theme.
 * Supports both light and dark modes.
 * 
 * @example
 * ```tsx
 * <FluentThemeProvider dark={isDarkMode}>
 *   <App />
 * </FluentThemeProvider>
 * ```
 */
export const FluentThemeProvider: React.FC<FluentThemeProviderProps> = ({
  children,
  dark = false,
  useDefaultTheme = false,
}) => {
  const theme = React.useMemo(() => {
    if (useDefaultTheme) {
      return dark ? webDarkTheme : webLightTheme;
    }
    return dark ? customDarkTheme : customLightTheme;
  }, [dark, useDefaultTheme]);

  return (
    <FluentProvider theme={theme} style={{ background: 'transparent' }}>
      {children}
    </FluentProvider>
  );
};

// ============================================================================
// Theme Hook
// ============================================================================

/**
 * Hook to detect system dark mode preference
 */
export const useSystemDarkMode = (): boolean => {
  const [isDark, setIsDark] = React.useState(() => {
    if (typeof window === 'undefined') return false;
    return window.matchMedia('(prefers-color-scheme: dark)').matches;
  });

  React.useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    const handler = (e: MediaQueryListEvent) => setIsDark(e.matches);
    
    mediaQuery.addEventListener('change', handler);
    return () => mediaQuery.removeEventListener('change', handler);
  }, []);

  return isDark;
};

export default FluentThemeProvider;
