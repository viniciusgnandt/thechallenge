import { useState } from 'react';
import { View, Text, TouchableOpacity, TextInput, StyleSheet, Linking } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import Toast from 'react-native-toast-message';
import { useAuthStore } from '../src/store/authStore';
import api from '../src/api/axios';
import { colors, shadow } from '../src/constants/colors';
import Avatar from '../src/components/Avatar';
import { pickAndUploadImage } from '../src/utils/upload';

export default function SettingsScreen() {
  const { user, logout, loadUser } = useAuthStore();
  const router = useRouter();
  const [editing, setEditing] = useState(false);
  const [name, setName] = useState(user?.name || '');
  const [city, setCity] = useState(user?.city || '');
  const [saving, setSaving] = useState(false);
  const [connecting, setConnecting] = useState(false);
  const [uploadingAvatar, setUploadingAvatar] = useState(false);

  const changeAvatar = async () => {
    setUploadingAvatar(true);
    try {
      const url = await pickAndUploadImage();
      if (!url) return;
      await api.put('/auth/me', { avatar: url });
      Toast.show({ type: 'success', text1: 'Foto atualizada' });
      loadUser();
    } catch (err: any) {
      Toast.show({ type: 'error', text1: err.message || 'Erro ao enviar foto' });
    } finally {
      setUploadingAvatar(false);
    }
  };

  const saveProfile = async () => {
    setSaving(true);
    try {
      await api.put('/auth/me', { name, city });
      Toast.show({ type: 'success', text1: 'Perfil atualizado' });
      setEditing(false);
      loadUser();
    } catch (err: any) {
      Toast.show({ type: 'error', text1: err.response?.data?.error || 'Erro' });
    } finally {
      setSaving(false);
    }
  };

  const connectStrava = async () => {
    setConnecting(true);
    try {
      const { data } = await api.get('/strava/connect-url');
      Linking.openURL(data.url);
    } catch {
      Toast.show({ type: 'error', text1: 'Configure as credenciais do Strava no backend' });
    } finally {
      setConnecting(false);
    }
  };

  const disconnectStrava = async () => {
    await api.post('/strava/disconnect');
    Toast.show({ type: 'success', text1: 'Strava desconectado' });
    loadUser();
  };

  if (!user) return null;

  return (
    <View style={styles.container}>
      <View style={[styles.card, { alignItems: 'center' }]}>
        <TouchableOpacity onPress={changeAvatar} disabled={uploadingAvatar} style={styles.avatarWrap}>
          <Avatar name={user.name} uri={user.avatar} size={80} />
          <View style={styles.avatarEditBadge}>
            <Ionicons name={uploadingAvatar ? 'hourglass-outline' : 'camera'} size={14} color="#fff" />
          </View>
        </TouchableOpacity>
        <Text style={styles.avatarHint}>Toque para trocar a foto</Text>
      </View>

      <View style={styles.card}>
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: editing ? 16 : 0 }}>
          <Text style={styles.sectionTitle}>Perfil</Text>
          <TouchableOpacity onPress={() => editing ? saveProfile() : setEditing(true)} disabled={saving}>
            <Ionicons name={editing ? 'checkmark-circle' : 'create-outline'} size={22} color={colors.primary} />
          </TouchableOpacity>
        </View>
        {editing ? (
          <View style={{ gap: 12 }}>
            <TextInput style={styles.input} value={name} onChangeText={setName} placeholder="Nome" placeholderTextColor={colors.textLight} />
            <TextInput style={styles.input} value={city} onChangeText={setCity} placeholder="Cidade" placeholderTextColor={colors.textLight} />
          </View>
        ) : (
          <View style={{ marginTop: 10 }}>
            <Text style={styles.label}>Nome</Text>
            <Text style={styles.value}>{user.name}</Text>
            <Text style={[styles.label, { marginTop: 10 }]}>E-mail</Text>
            <Text style={styles.value}>{user.email}</Text>
          </View>
        )}
      </View>

      <View style={styles.card}>
        <Text style={styles.sectionTitle}>Assinatura</Text>
        {user.subscription?.status === 'active' ? (
          <Text style={styles.connected}>Ativa {user.subscription.plan ? `(${user.subscription.plan === 'avista' ? 'à vista' : 'parcelado'})` : ''} ✓</Text>
        ) : (
          <>
            <Text style={styles.hint}>Assine para se inscrever em qualquer desafio da plataforma.</Text>
            <TouchableOpacity style={styles.primaryBtn} onPress={() => router.push('/subscribe')}>
              <Text style={styles.primaryBtnText}>Assinar agora</Text>
            </TouchableOpacity>
          </>
        )}
      </View>

      <View style={styles.card}>
        <Text style={styles.sectionTitle}>Strava</Text>
        {user.strava?.athleteId ? (
          <>
            <Text style={styles.connected}>Conta conectada ✓</Text>
            <TouchableOpacity style={styles.outlineBtn} onPress={disconnectStrava}>
              <Text style={styles.outlineBtnText}>Desconectar</Text>
            </TouchableOpacity>
          </>
        ) : (
          <>
            <Text style={styles.hint}>Conecte para validar automaticamente caminhada, corrida e bike.</Text>
            <TouchableOpacity style={styles.primaryBtn} onPress={connectStrava} disabled={connecting}>
              <Text style={styles.primaryBtnText}>{connecting ? 'Abrindo...' : 'Conectar com Strava'}</Text>
            </TouchableOpacity>
          </>
        )}
      </View>

      <TouchableOpacity style={styles.logoutBtn} onPress={async () => { await logout(); router.replace('/(auth)/login'); }}>
        <Ionicons name="log-out-outline" size={18} color={colors.danger} />
        <Text style={styles.logoutText}>Sair da conta</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.bg, padding: 16, gap: 14 },
  card: { backgroundColor: colors.surface, borderRadius: 16, padding: 18, ...shadow.sm },
  sectionTitle: { fontSize: 15, fontFamily: 'PlusJakartaSans_700Bold', color: colors.text },
  label: { fontSize: 11.5, color: colors.textLight, fontWeight: '700', textTransform: 'uppercase' },
  value: { fontSize: 14.5, color: colors.text, marginTop: 2 },
  input: { backgroundColor: colors.surface2, borderRadius: 10, padding: 12, color: colors.text, fontSize: 14.5 },
  connected: { color: colors.success, fontWeight: '700', marginVertical: 10, fontSize: 13.5 },
  hint: { color: colors.textMuted, fontSize: 13, marginVertical: 10, lineHeight: 18 },
  primaryBtn: { backgroundColor: colors.primary, borderRadius: 9999, padding: 13, alignItems: 'center', ...shadow.primary },
  primaryBtnText: { color: '#fff', fontWeight: '800', fontSize: 13.5 },
  outlineBtn: { borderWidth: 1.5, borderColor: colors.border, borderRadius: 9999, padding: 13, alignItems: 'center' },
  outlineBtnText: { color: colors.text, fontWeight: '700', fontSize: 13.5 },
  logoutBtn: { flexDirection: 'row', gap: 8, alignItems: 'center', justifyContent: 'center', padding: 14 },
  logoutText: { color: colors.danger, fontWeight: '700', fontSize: 14 },
  avatarWrap: { position: 'relative' },
  avatarEditBadge: { position: 'absolute', bottom: -2, right: -2, width: 26, height: 26, borderRadius: 13, backgroundColor: colors.primary, alignItems: 'center', justifyContent: 'center', borderWidth: 2, borderColor: colors.surface },
  avatarHint: { color: colors.textMuted, fontSize: 12, marginTop: 10 },
});
