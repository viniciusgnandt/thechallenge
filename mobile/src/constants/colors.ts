export const colors = {
  bg: '#F8F8FA',
  surface: '#FFFFFF',
  surface2: '#F3F3F6',
  border: '#ECECEF',
  borderStrong: '#D8D9DE',
  text: '#12131A',
  textMuted: '#6B7280',
  textLight: '#9CA3AF',
  primary: '#FF5722',
  primaryDark: '#E64A19',
  primaryLight: '#FF8A50',
  gradient: ['#FF5722', '#FF2D6F'] as const,
  gradientDark: ['#1a1d29', '#2d1b2e'] as const,
  gradientSoft: '#FFF1EB',
  success: '#10B981',
  successSoft: '#ECFDF5',
  danger: '#EF4444',
  dangerSoft: '#FEF2F2',
  warning: '#F59E0B',
  warningSoft: '#FFFBEB',
  gold: '#EAB308',
  silver: '#94A3B8',
  bronze: '#C2703D',
  white: '#FFFFFF',
};

export const radius = { sm: 10, md: 16, lg: 22, xl: 28, pill: 9999 };

export const fonts = {
  display: 'Fraunces_600SemiBold',
  displayBold: 'Fraunces_700Bold',
  displayMedium: 'Fraunces_500Medium',
  body: 'PlusJakartaSans_400Regular',
  medium: 'PlusJakartaSans_500Medium',
  bold: 'PlusJakartaSans_700Bold',
  extraBold: 'PlusJakartaSans_800ExtraBold',
};

export const shadow = {
  sm: { shadowColor: '#14141E', shadowOpacity: 0.06, shadowRadius: 10, shadowOffset: { width: 0, height: 2 }, elevation: 2 },
  md: { shadowColor: '#14141E', shadowOpacity: 0.10, shadowRadius: 18, shadowOffset: { width: 0, height: 6 }, elevation: 5 },
  primary: { shadowColor: '#FF5722', shadowOpacity: 0.3, shadowRadius: 14, shadowOffset: { width: 0, height: 6 }, elevation: 6 },
};
