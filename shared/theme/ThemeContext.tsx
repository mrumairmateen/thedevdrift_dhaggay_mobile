import React, { createContext, useCallback, useContext, useMemo, useState } from 'react';
import { useColorScheme } from 'react-native';
import { buildTheme, themes, type ColorMode, type ColorScheme, type Theme } from './theme';

// ─── Context shape ────────────────────────────────────────────────────────────

interface ThemeContextValue {
  theme: Theme;
}

interface ThemeControlsContextValue {
  scheme: ColorScheme;
  mode: ColorMode;
  setScheme: (scheme: ColorScheme) => void;
  setMode: (mode: ColorMode) => void;
  toggleMode: () => void;
}

const ThemeContext = createContext<ThemeContextValue | null>(null);
const ThemeControlsContext = createContext<ThemeControlsContextValue | null>(null);

// ─── Provider ─────────────────────────────────────────────────────────────────

interface ThemeProviderProps {
  children: React.ReactNode;
  initialScheme?: ColorScheme;
}

export function ThemeProvider({ children, initialScheme = 'cobalt' }: ThemeProviderProps) {
  const systemColorScheme = useColorScheme();
  const [scheme, setScheme] = useState<ColorScheme>(initialScheme);
  const [modeOverride, setModeOverride] = useState<ColorMode | null>(null);

  const mode: ColorMode = modeOverride ?? (systemColorScheme === 'dark' ? 'dark' : 'light');

  const theme = useMemo(() => themes[scheme][mode], [scheme, mode]);

  const toggleMode = useCallback(() => {
    setModeOverride(prev => {
      const current = prev ?? (systemColorScheme === 'dark' ? 'dark' : 'light');
      return current === 'light' ? 'dark' : 'light';
    });
  }, [systemColorScheme]);

  const setMode = useCallback((m: ColorMode) => setModeOverride(m), []);

  const themeValue = useMemo(() => ({ theme }), [theme]);

  const controlsValue = useMemo(
    () => ({ scheme, mode, setScheme, setMode, toggleMode }),
    [scheme, mode, setScheme, setMode, toggleMode],
  );

  return (
    <ThemeControlsContext.Provider value={controlsValue}>
      <ThemeContext.Provider value={themeValue}>
        {children}
      </ThemeContext.Provider>
    </ThemeControlsContext.Provider>
  );
}

// ─── Hooks ────────────────────────────────────────────────────────────────────

export function useTheme(): Theme {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error('useTheme must be used inside <ThemeProvider>');
  return ctx.theme;
}

export function useThemeControls(): ThemeControlsContextValue {
  const ctx = useContext(ThemeControlsContext);
  if (!ctx) throw new Error('useThemeControls must be used inside <ThemeProvider>');
  return ctx;
}

// Convenience: destructure colors/typo/sp/r/elev directly
export function useThemeTokens() {
  const { colors, typo, sp, r, elev } = useTheme();
  return { colors, typo, sp, r, elev };
}
