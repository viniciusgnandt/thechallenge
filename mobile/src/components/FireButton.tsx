import { TouchableOpacity, Text, StyleSheet, ActivityIndicator, ViewStyle } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { colors, shadow } from '../constants/colors';

// CTA principal: faixa amarelo→laranja inclinada, texto preto itálico em caixa alta.
export default function FireButton({ title, onPress, loading, disabled, style }: {
  title: string;
  onPress: () => void;
  loading?: boolean;
  disabled?: boolean;
  style?: ViewStyle;
}) {
  return (
    <TouchableOpacity onPress={onPress} disabled={disabled || loading} activeOpacity={0.85}
      style={[{ opacity: disabled ? 0.5 : 1 }, style]}>
      <LinearGradient colors={colors.gradientCta} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={styles.btn}>
        {loading
          ? <ActivityIndicator color="#111" />
          : <Text style={styles.text}>{title.toUpperCase()}</Text>}
      </LinearGradient>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  btn: {
    borderRadius: 6, paddingVertical: 14, alignItems: 'center', justifyContent: 'center',
    transform: [{ skewX: '-8deg' }], ...shadow.primary,
  },
  text: { color: '#111', fontFamily: 'BarlowCondensed_900Black_Italic', fontSize: 24, letterSpacing: 0.5 },
});
