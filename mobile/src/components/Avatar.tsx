import { View, Text, StyleSheet, Image } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { colors } from '../constants/colors';

export default function Avatar({ name, size = 40, uri }: { name?: string; size?: number; uri?: string | null }) {
  if (uri) {
    return <Image source={{ uri }} style={{ width: size, height: size, borderRadius: size / 2 }} />;
  }

  const letter = name?.trim()?.[0]?.toUpperCase() || '?';
  return (
    <LinearGradient
      colors={[colors.gradientSoft, '#FFE5EC']}
      style={[styles.circle, { width: size, height: size, borderRadius: size / 2 }]}
    >
      <Text style={{ color: colors.primary, fontWeight: '800', fontSize: size * 0.4 }}>{letter}</Text>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  circle: { alignItems: 'center', justifyContent: 'center' },
});
