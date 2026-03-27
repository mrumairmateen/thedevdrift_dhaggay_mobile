/**
 * Dhaggay Design System — single source of truth
 * 3 schemes (cobalt / jungle / amethyst) × 2 modes (light / dark) = 6 combinations
 */

// ─── Types ────────────────────────────────────────────────────────────────────

export type ColorScheme = 'cobalt' | 'jungle' | 'amethyst';
export type ColorMode = 'light' | 'dark';

export interface ColorTokens {
  // Backgrounds
  bg: string;
  surface: string;
  elevated: string;
  panel: string;
  inputBg: string;
  chipBg: string;
  navBg: string;
  navSolid: string;
  // Borders
  border: string;
  borderStrong: string;
  // Accent
  accent: string;
  accentMid: string;
  accentSubtle: string;
  thread: string;
  // Text
  textHigh: string;
  textMid: string;
  textLow: string;
  textOnAccent: string;
  // Logo
  logoNeedle: string;
  logoThread: string;
  // Semantic
  success: string;
  successSubtle: string;
  error: string;
  errorSubtle: string;
  warning: string;
  warningSubtle: string;
  info: string;
  infoSubtle: string;
}

export interface TypographyTokens {
  fonts: {
    display: string;
    serif: string;
    serifBold: string;
    sans: string;
    sansMed: string;
    sansBold: string;
  };
  scale: {
    hero: { fontSize: number; lineHeight: number; fontWeight: '300' };
    title1: { fontSize: number; lineHeight: number; fontWeight: '700' };
    title2: { fontSize: number; lineHeight: number; fontWeight: '700' };
    title3: { fontSize: number; lineHeight: number; fontWeight: '700' };
    subtitle: { fontSize: number; lineHeight: number; fontWeight: '400' };
    body: { fontSize: number; lineHeight: number; fontWeight: '400' };
    bodySmall: { fontSize: number; lineHeight: number; fontWeight: '400' };
    caption: { fontSize: number; lineHeight: number; fontWeight: '400'; letterSpacing: number };
    label: { fontSize: number; lineHeight: number; fontWeight: '500'; letterSpacing: number; textTransform: 'uppercase' };
    price: { fontSize: number; lineHeight: number; fontWeight: '700' };
  };
}

export interface SpacingTokens {
  px: number;
  xs: number;
  sm: number;
  md: number;
  base: number;
  lg: number;
  xl: number;
  '2xl': number;
  '3xl': number;
  '4xl': number;
  '5xl': number;
  '6xl': number;
  '7xl': number;
}

export interface RadiusTokens {
  sharp: number;
  sm: number;
  md: number;
  lg: number;
  xl: number;
  '2xl': number;
  pill: number;
}

export interface ElevationToken {
  shadowColor: string;
  shadowOffset: { width: number; height: number };
  shadowOpacity: number;
  shadowRadius: number;
  elevation: number;
}

export interface ElevationTokens {
  none: ElevationToken;
  low: ElevationToken;
  mid: ElevationToken;
  high: ElevationToken;
}

export interface Theme {
  scheme: ColorScheme;
  mode: ColorMode;
  colors: ColorTokens;
  typo: TypographyTokens;
  sp: SpacingTokens;
  r: RadiusTokens;
  elev: ElevationTokens;
}

// ─── Spacing (shared, mode-independent) ──────────────────────────────────────

const sp: SpacingTokens = {
  px: 1,
  xs: 4,
  sm: 8,
  md: 12,
  base: 16,
  lg: 20,
  xl: 24,
  '2xl': 32,
  '3xl': 40,
  '4xl': 48,
  '5xl': 64,
  '6xl': 80,
  '7xl': 96,
};

// ─── Border Radius (shared) ───────────────────────────────────────────────────

const r: RadiusTokens = {
  sharp: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  '2xl': 28,
  pill: 999,
};

// ─── Typography (shared) ─────────────────────────────────────────────────────

const typo: TypographyTokens = {
  fonts: {
    display: 'CormorantGaramond_300Light',
    serif: 'PlayfairDisplay_400Regular',
    serifBold: 'PlayfairDisplay_700Bold',
    sans: 'DMSans_400Regular',
    sansMed: 'DMSans_500Medium',
    sansBold: 'DMSans_700Bold',
  },
  scale: {
    hero:      { fontSize: 44, lineHeight: 52, fontWeight: '300' },
    title1:    { fontSize: 32, lineHeight: 40, fontWeight: '700' },
    title2:    { fontSize: 26, lineHeight: 34, fontWeight: '700' },
    title3:    { fontSize: 22, lineHeight: 30, fontWeight: '700' },
    subtitle:  { fontSize: 18, lineHeight: 26, fontWeight: '400' },
    body:      { fontSize: 16, lineHeight: 24, fontWeight: '400' },
    bodySmall: { fontSize: 14, lineHeight: 22, fontWeight: '400' },
    caption:   { fontSize: 12, lineHeight: 18, fontWeight: '400', letterSpacing: 0.3 },
    label:     { fontSize: 11, lineHeight: 16, fontWeight: '500', letterSpacing: 1.5, textTransform: 'uppercase' },
    price:     { fontSize: 18, lineHeight: 24, fontWeight: '700' },
  },
};

// ─── Elevation ────────────────────────────────────────────────────────────────

function buildElevation(dark: boolean): ElevationTokens {
  const shadowColor = dark ? '#000' : '#1A1A2E';
  return {
    none: { shadowColor, shadowOffset: { width: 0, height: 0 }, shadowOpacity: 0, shadowRadius: 0, elevation: 0 },
    low:  { shadowColor, shadowOffset: { width: 0, height: 1 }, shadowOpacity: dark ? 0.4 : 0.08, shadowRadius: 4, elevation: 2 },
    mid:  { shadowColor, shadowOffset: { width: 0, height: 4 }, shadowOpacity: dark ? 0.5 : 0.12, shadowRadius: 12, elevation: 8 },
    high: { shadowColor, shadowOffset: { width: 0, height: 8 }, shadowOpacity: dark ? 0.6 : 0.16, shadowRadius: 24, elevation: 16 },
  };
}

// ─── Color Palettes ───────────────────────────────────────────────────────────

type RawPalette = Omit<ColorTokens, 'accentMid' | 'accentSubtle'> & { accent: string };

function withDerivedAccent(raw: RawPalette): ColorTokens {
  return {
    ...raw,
    accentMid: raw.accent + '99',     // ~60% opacity
    accentSubtle: raw.accent + '1A',  // ~10% opacity tint
  };
}

// Cobalt ──────────────────────────────────────────────────────────────────────
const cobaltLight: RawPalette = {
  bg: '#F2F5FB',
  surface: '#FFFFFF',
  elevated: '#EDF1F9',
  panel: '#E2E8F5',
  inputBg: '#EDF1F9',
  chipBg: '#DDE4F0',
  navBg: 'rgba(242,245,251,0.85)',
  navSolid: '#F2F5FB',
  border: '#C8D4EC',
  borderStrong: '#A3B6D8',
  accent: '#1E4FCC',
  thread: '#1E4FCC',
  textHigh: '#0D1B3E',
  textMid: '#3D5378',
  textLow: '#8298BE',
  textOnAccent: '#FFFFFF',
  logoNeedle: '#1E4FCC',
  logoThread: '#5C9CE6',
  success: '#16A34A',
  successSubtle: '#DCFCE7',
  error: '#DC2626',
  errorSubtle: '#FEE2E2',
  warning: '#D97706',
  warningSubtle: '#FEF3C7',
  info: '#0284C7',
  infoSubtle: '#E0F2FE',
};

const cobaltDark: RawPalette = {
  bg: '#060912',
  surface: '#0D1225',
  elevated: '#111930',
  panel: '#172040',
  inputBg: '#0D1225',
  chipBg: '#172040',
  navBg: 'rgba(6,9,18,0.90)',
  navSolid: '#0D1225',
  border: '#1E2D50',
  borderStrong: '#2A3E6E',
  accent: '#5B8DEF',
  thread: '#5B8DEF',
  textHigh: '#E8EEFF',
  textMid: '#97AFDB',
  textLow: '#4D6490',
  textOnAccent: '#FFFFFF',
  logoNeedle: '#5B8DEF',
  logoThread: '#1E4FCC',
  success: '#4ADE80',
  successSubtle: '#14532D',
  error: '#F87171',
  errorSubtle: '#7F1D1D',
  warning: '#FCD34D',
  warningSubtle: '#78350F',
  info: '#38BDF8',
  infoSubtle: '#0C4A6E',
};

// Jungle ──────────────────────────────────────────────────────────────────────
const jungleLight: RawPalette = {
  bg: '#F4F7F2',
  surface: '#FFFFFF',
  elevated: '#EDF2EA',
  panel: '#E3EBE0',
  inputBg: '#EDF2EA',
  chipBg: '#D8E5D4',
  navBg: 'rgba(244,247,242,0.85)',
  navSolid: '#F4F7F2',
  border: '#C2D4BB',
  borderStrong: '#9CB890',
  accent: '#1A6B3C',
  thread: '#1A6B3C',
  textHigh: '#0D1F12',
  textMid: '#3A5E41',
  textLow: '#7D9E82',
  textOnAccent: '#FFFFFF',
  logoNeedle: '#1A6B3C',
  logoThread: '#3D9A60',
  success: '#16A34A',
  successSubtle: '#DCFCE7',
  error: '#DC2626',
  errorSubtle: '#FEE2E2',
  warning: '#D97706',
  warningSubtle: '#FEF3C7',
  info: '#0284C7',
  infoSubtle: '#E0F2FE',
};

const jungleDark: RawPalette = {
  bg: '#080F0A',
  surface: '#0E1A11',
  elevated: '#132118',
  panel: '#1A2D20',
  inputBg: '#0E1A11',
  chipBg: '#1A2D20',
  navBg: 'rgba(8,15,10,0.90)',
  navSolid: '#0E1A11',
  border: '#1C3323',
  borderStrong: '#274D31',
  accent: '#3D9A60',
  thread: '#3D9A60',
  textHigh: '#E8F5EC',
  textMid: '#8FBA99',
  textLow: '#4A7055',
  textOnAccent: '#FFFFFF',
  logoNeedle: '#3D9A60',
  logoThread: '#1A6B3C',
  success: '#4ADE80',
  successSubtle: '#14532D',
  error: '#F87171',
  errorSubtle: '#7F1D1D',
  warning: '#FCD34D',
  warningSubtle: '#78350F',
  info: '#38BDF8',
  infoSubtle: '#0C4A6E',
};

// Amethyst ────────────────────────────────────────────────────────────────────
const amethystLight: RawPalette = {
  bg: '#F9F7FF',
  surface: '#FFFFFF',
  elevated: '#F3F0FF',
  panel: '#EAE6FF',
  inputBg: '#F3F0FF',
  chipBg: '#DDD6FE',
  navBg: 'rgba(249,247,255,0.85)',
  navSolid: '#F9F7FF',
  border: '#C4B5FD',
  borderStrong: '#A78BFA',
  accent: '#6D28D9',
  thread: '#6D28D9',
  textHigh: '#1E0A47',
  textMid: '#4C2889',
  textLow: '#9275C4',
  textOnAccent: '#FFFFFF',
  logoNeedle: '#6D28D9',
  logoThread: '#8B5CF6',
  success: '#16A34A',
  successSubtle: '#DCFCE7',
  error: '#DC2626',
  errorSubtle: '#FEE2E2',
  warning: '#D97706',
  warningSubtle: '#FEF3C7',
  info: '#0284C7',
  infoSubtle: '#E0F2FE',
};

const amethystDark: RawPalette = {
  bg: '#0A0614',
  surface: '#120A24',
  elevated: '#1A0F35',
  panel: '#231545',
  inputBg: '#120A24',
  chipBg: '#231545',
  navBg: 'rgba(10,6,20,0.90)',
  navSolid: '#120A24',
  border: '#2D1B5E',
  borderStrong: '#3D2780',
  accent: '#8B5CF6',
  thread: '#8B5CF6',
  textHigh: '#EDE9FF',
  textMid: '#A78BFA',
  textLow: '#5B3F9E',
  textOnAccent: '#FFFFFF',
  logoNeedle: '#8B5CF6',
  logoThread: '#6D28D9',
  success: '#4ADE80',
  successSubtle: '#14532D',
  error: '#F87171',
  errorSubtle: '#7F1D1D',
  warning: '#FCD34D',
  warningSubtle: '#78350F',
  info: '#38BDF8',
  infoSubtle: '#0C4A6E',
};

// ─── Theme Builder ────────────────────────────────────────────────────────────

const palettes: Record<ColorScheme, Record<ColorMode, RawPalette>> = {
  cobalt:    { light: cobaltLight,    dark: cobaltDark },
  jungle:    { light: jungleLight,    dark: jungleDark },
  amethyst:  { light: amethystLight,  dark: amethystDark },
};

export function buildTheme(scheme: ColorScheme, mode: ColorMode): Theme {
  const raw = palettes[scheme][mode];
  return {
    scheme,
    mode,
    colors: withDerivedAccent(raw),
    typo,
    sp,
    r,
    elev: buildElevation(mode === 'dark'),
  };
}

// ─── Prebuilt themes map ──────────────────────────────────────────────────────

export const themes: Record<ColorScheme, Record<ColorMode, Theme>> = {
  cobalt:   { light: buildTheme('cobalt',   'light'), dark: buildTheme('cobalt',   'dark') },
  jungle:   { light: buildTheme('jungle',   'light'), dark: buildTheme('jungle',   'dark') },
  amethyst: { light: buildTheme('amethyst', 'light'), dark: buildTheme('amethyst', 'dark') },
};
