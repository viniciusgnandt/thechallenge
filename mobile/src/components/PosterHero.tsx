import { View, Text, StyleSheet, ImageBackground } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../constants/colors';

const FEATURES: { icon: any; label: string }[] = [
  { icon: 'calendar', label: 'DESAFIOS\nDIÁRIOS' },
  { icon: 'trending-up', label: 'EVOLUA SEU\nDESEMPENHO' },
  { icon: 'trophy', label: 'CONQUISTE\nMEDALHAS' },
  { icon: 'podium', label: 'COMPITA NO\nRANKING' },
];

// Cabeçalho estilo pôster: atletas em chamas, título gigante e os 4 pilares do app.
export default function PosterHero({ compact = false }: { compact?: boolean }) {
  return (
    <ImageBackground
      source={require('../../assets/hero.webp')}
      style={[styles.hero, compact && { height: 300 }]}
      imageStyle={{ top: 0, height: compact ? 420 : 560 }}
      resizeMode="cover"
    >
      <LinearGradient
        colors={['rgba(10,10,10,0)', 'rgba(10,10,10,0.35)', 'rgba(10,10,10,0.95)', colors.bg]}
        locations={[0, 0.45, 0.85, 1]}
        style={StyleSheet.absoluteFill}
      />
      <View style={styles.content}>
        <Text style={styles.brand}>THE CHALLENGE</Text>
        <Text style={styles.title}>DESAFIO</Text>
        <View style={styles.underline} />
        <Text style={styles.tagline}>
          FAÇA EXERCÍCIOS FÍSICOS,{'\n'}
          <Text style={{ color: colors.accent }}>SUPERE</Text> SEUS LIMITES!
        </Text>
        {!compact && (
          <View style={styles.features}>
            {FEATURES.map((f, i) => (
              <View key={f.label} style={[styles.feature, i > 0 && styles.featureDivider]}>
                <Ionicons name={f.icon} size={22} color={colors.accent} />
                <Text style={styles.featureText}>{f.label}</Text>
              </View>
            ))}
          </View>
        )}
      </View>
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  hero: { height: 470, justifyContent: 'flex-end', overflow: 'hidden' },
  content: { paddingHorizontal: 22, paddingBottom: 18 },
  brand: { color: colors.accent, fontFamily: 'BarlowCondensed_800ExtraBold_Italic', fontSize: 15, letterSpacing: 3 },
  title: {
    color: '#F4F4F5', fontFamily: 'BarlowCondensed_900Black_Italic', fontSize: 78, lineHeight: 80,
    textShadowColor: 'rgba(225,29,29,0.9)', textShadowOffset: { width: 3, height: 3 }, textShadowRadius: 1,
  },
  underline: { height: 5, width: 150, backgroundColor: colors.red, transform: [{ skewX: '-20deg' }], marginTop: 2, marginBottom: 10 },
  tagline: { color: '#fff', fontFamily: 'BarlowCondensed_800ExtraBold_Italic', fontSize: 24, lineHeight: 26 },
  features: { flexDirection: 'row', marginTop: 18 },
  feature: { flex: 1, alignItems: 'center', gap: 6, paddingHorizontal: 2 },
  featureDivider: { borderLeftWidth: 1, borderLeftColor: 'rgba(255,107,0,0.5)' },
  featureText: { color: '#fff', fontFamily: 'BarlowCondensed_800ExtraBold_Italic', fontSize: 12, textAlign: 'center', lineHeight: 13 },
});
