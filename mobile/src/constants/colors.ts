// Identidade "fogo": fundo preto, laranja/vermelho de chama e amarelo de destaque.
export const colors = {
  bg: '#0A0A0A',
  surface: '#151515',
  surface2: '#1F1F1F',
  border: '#2A2A2A',
  borderStrong: '#3A3A3A',
  text: '#FFFFFF',
  textMuted: '#A1A1AA',
  textLight: '#71717A',
  primary: '#FF6B00',
  primaryDark: '#E04A00',
  primaryLight: '#FF8A33',
  accent: '#FFB800',
  red: '#E11D1D',
  gradient: ['#E11D1D', '#FF6B00'] as const,
  gradientFire: ['#E11D1D', '#FF6B00', '#FFB800'] as const,
  gradientCta: ['#FFB800', '#FF8A00'] as const,
  gradientDark: ['#0A0A0A', '#1A0A05'] as const,
  gradientSoft: 'rgba(255,107,0,0.14)',
  success: '#22C55E',
  successSoft: 'rgba(34,197,94,0.14)',
  danger: '#EF4444',
  dangerSoft: 'rgba(239,68,68,0.14)',
  warning: '#F59E0B',
  warningSoft: 'rgba(245,158,11,0.14)',
  gold: '#FFB800',
  silver: '#CBD5E1',
  bronze: '#D97736',
  white: '#FFFFFF',
};

export const radius = { sm: 10, md: 16, lg: 22, xl: 28, pill: 9999 };

export const fonts = {
  display: 'BarlowCondensed_800ExtraBold_Italic',
  displayBlack: 'BarlowCondensed_900Black_Italic',
  displayBold: 'BarlowCondensed_700Bold_Italic',
  body: 'PlusJakartaSans_400Regular',
  medium: 'PlusJakartaSans_500Medium',
  bold: 'PlusJakartaSans_700Bold',
  extraBold: 'PlusJakartaSans_800ExtraBold',
};

export const shadow = {
  sm: { shadowColor: '#000', shadowOpacity: 0.4, shadowRadius: 10, shadowOffset: { width: 0, height: 2 }, elevation: 2 },
  md: { shadowColor: '#000', shadowOpacity: 0.5, shadowRadius: 18, shadowOffset: { width: 0, height: 6 }, elevation: 5 },
  primary: { shadowColor: '#FF6B00', shadowOpacity: 0.45, shadowRadius: 16, shadowOffset: { width: 0, height: 6 }, elevation: 6 },
};
