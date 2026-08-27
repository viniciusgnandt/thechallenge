import { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, KeyboardAvoidingView, Platform } from 'react-native';
import { Link } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import Toast from 'react-native-toast-message';
import { useAuthStore } from '../../src/store/authStore';
import { colors, shadow } from '../../src/constants/colors';

export default function LoginScreen() {
  const login = useAuthStore((s) => s.login);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    setLoading(true);
    try {
      await login(email, password);
    } catch (err: any) {
      Toast.show({ type: 'error', text1: err.response?.data?.error || 'Erro ao entrar' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <LinearGradient colors={colors.gradientDark} style={styles.container}>
        <View style={styles.logoWrap}>
          <LinearGradient colors={colors.gradient} style={styles.logoIcon}><Ionicons name="flame" size={22} color="#fff" /></LinearGradient>
          <Text style={styles.brand}>TheChallenge</Text>
        </View>

        <View style={styles.card}>
          <Text style={styles.title}>Entrar</Text>
          <Text style={styles.subtitle}>Acesse sua conta para continuar</Text>

          <View style={styles.inputWrap}>
            <Ionicons name="mail-outline" size={17} color={colors.textLight} />
            <TextInput style={styles.input} placeholder="E-mail" placeholderTextColor={colors.textLight}
              autoCapitalize="none" keyboardType="email-address" value={email} onChangeText={setEmail} />
          </View>
          <View style={styles.inputWrap}>
            <Ionicons name="lock-closed-outline" size={17} color={colors.textLight} />
            <TextInput style={styles.input} placeholder="Senha" placeholderTextColor={colors.textLight}
              secureTextEntry value={password} onChangeText={setPassword} />
          </View>

          <TouchableOpacity style={styles.button} onPress={handleLogin} disabled={loading}>
            <Text style={styles.buttonText}>{loading ? 'Entrando...' : 'Entrar'}</Text>
            {!loading && <Ionicons name="arrow-forward" size={17} color="#fff" />}
          </TouchableOpacity>

          <Link href="/(auth)/register" style={styles.link}>
            <Text style={{ color: colors.textMuted }}>Não tem conta? <Text style={{ color: colors.primary, fontWeight: '700' }}>Criar conta</Text></Text>
          </Link>
        </View>
      </LinearGradient>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', padding: 24 },
  logoWrap: { alignItems: 'center', marginBottom: 32 },
  logoIcon: { width: 52, height: 52, borderRadius: 16, alignItems: 'center', justifyContent: 'center', marginBottom: 10, ...shadow.primary },
  brand: { color: '#fff', fontSize: 20, fontFamily: 'PlusJakartaSans_800ExtraBold' },
  card: { backgroundColor: colors.surface, borderRadius: 24, padding: 26, ...shadow.md },
  title: { fontSize: 22, fontFamily: 'PlusJakartaSans_800ExtraBold', color: colors.text, marginBottom: 4 },
  subtitle: { color: colors.textMuted, fontSize: 13, marginBottom: 22 },
  inputWrap: { flexDirection: 'row', alignItems: 'center', gap: 10, backgroundColor: colors.surface2, borderRadius: 12, paddingHorizontal: 14, marginBottom: 12 },
  input: { flex: 1, color: colors.text, paddingVertical: 14, fontSize: 15 },
  button: { flexDirection: 'row', gap: 8, backgroundColor: colors.primary, borderRadius: 9999, padding: 16, alignItems: 'center', justifyContent: 'center', marginTop: 8, ...shadow.primary },
  buttonText: { color: '#fff', fontWeight: '800', fontSize: 15.5 },
  link: { marginTop: 20, alignItems: 'center' },
});
