import { useState } from 'react';
import { View, Text, TextInput, StyleSheet, KeyboardAvoidingView, Platform, ScrollView } from 'react-native';
import { Link } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import Toast from 'react-native-toast-message';
import { useAuthStore } from '../../src/store/authStore';
import { colors } from '../../src/constants/colors';
import PosterHero from '../../src/components/PosterHero';
import FireButton from '../../src/components/FireButton';

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
    <KeyboardAvoidingView style={{ flex: 1, backgroundColor: colors.bg }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <ScrollView contentContainerStyle={{ paddingBottom: 40 }} keyboardShouldPersistTaps="handled">
        <PosterHero />

        <View style={styles.form}>
          <View style={styles.inputWrap}>
            <Ionicons name="mail-outline" size={18} color={colors.primary} />
            <TextInput style={styles.input} placeholder="E-mail" placeholderTextColor={colors.textLight}
              autoCapitalize="none" keyboardType="email-address" value={email} onChangeText={setEmail} />
          </View>
          <View style={styles.inputWrap}>
            <Ionicons name="lock-closed-outline" size={18} color={colors.primary} />
            <TextInput style={styles.input} placeholder="Senha" placeholderTextColor={colors.textLight}
              secureTextEntry value={password} onChangeText={setPassword} />
          </View>

          <FireButton title="Aceite o desafio!" onPress={handleLogin} loading={loading} style={{ marginTop: 10 }} />

          <Link href="/(auth)/register" style={styles.link}>
            <Text style={{ color: colors.textMuted }}>Ainda não tem conta? <Text style={{ color: colors.accent, fontWeight: '800' }}>Criar conta</Text></Text>
          </Link>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  form: { paddingHorizontal: 22, paddingTop: 10 },
  inputWrap: { flexDirection: 'row', alignItems: 'center', gap: 10, backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.border, borderRadius: 12, paddingHorizontal: 14, marginBottom: 12 },
  input: { flex: 1, color: colors.text, paddingVertical: 14, fontSize: 15 },
  link: { marginTop: 22, textAlign: 'center' },
});
