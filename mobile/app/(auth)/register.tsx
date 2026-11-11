import { useState } from 'react';
import { View, Text, TextInput, StyleSheet, KeyboardAvoidingView, Platform, ScrollView } from 'react-native';
import { Link } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import Toast from 'react-native-toast-message';
import { useAuthStore } from '../../src/store/authStore';
import { colors } from '../../src/constants/colors';
import PosterHero from '../../src/components/PosterHero';
import FireButton from '../../src/components/FireButton';

export default function RegisterScreen() {
  const register = useAuthStore((s) => s.register);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleRegister = async () => {
    setLoading(true);
    try {
      await register(name, email, password);
    } catch (err: any) {
      Toast.show({ type: 'error', text1: err.response?.data?.error || 'Erro ao criar conta' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView style={{ flex: 1, backgroundColor: colors.bg }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <ScrollView contentContainerStyle={{ paddingBottom: 40 }} keyboardShouldPersistTaps="handled">
        <PosterHero compact />

        <View style={styles.form}>
          <Text style={styles.title}>CRIE SUA CONTA</Text>
          {[
            { icon: 'person-outline', placeholder: 'Nome', value: name, set: setName, props: {} },
            { icon: 'mail-outline', placeholder: 'E-mail', value: email, set: setEmail, props: { autoCapitalize: 'none', keyboardType: 'email-address' } },
            { icon: 'lock-closed-outline', placeholder: 'Senha (mín. 6 caracteres)', value: password, set: setPassword, props: { secureTextEntry: true } },
          ].map((f) => (
            <View key={f.placeholder} style={styles.inputWrap}>
              <Ionicons name={f.icon as any} size={18} color={colors.primary} />
              <TextInput style={styles.input} placeholder={f.placeholder} placeholderTextColor={colors.textLight}
                value={f.value} onChangeText={f.set} {...(f.props as any)} />
            </View>
          ))}

          <FireButton title="Aceite o desafio!" onPress={handleRegister} loading={loading} style={{ marginTop: 10 }} />

          <Link href="/(auth)/login" style={styles.link}>
            <Text style={{ color: colors.textMuted }}>Já tem conta? <Text style={{ color: colors.accent, fontWeight: '800' }}>Entrar</Text></Text>
          </Link>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  form: { paddingHorizontal: 22, paddingTop: 10 },
  title: { color: colors.text, fontFamily: 'BarlowCondensed_900Black_Italic', fontSize: 28, marginBottom: 14 },
  inputWrap: { flexDirection: 'row', alignItems: 'center', gap: 10, backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.border, borderRadius: 12, paddingHorizontal: 14, marginBottom: 12 },
  input: { flex: 1, color: colors.text, paddingVertical: 14, fontSize: 15 },
  link: { marginTop: 22, textAlign: 'center' },
});
