import { useCallback, useState } from 'react';
import { View, Text, FlatList, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import { useFocusEffect, useLocalSearchParams, useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import Toast from 'react-native-toast-message';
import api from '../../src/api/axios';
import { colors, shadow } from '../../src/constants/colors';
import Avatar from '../../src/components/Avatar';
import EmptyState from '../../src/components/EmptyState';

export default function PublicProfileScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const [profile, setProfile] = useState<any>(null);
  const [posts, setPosts] = useState<any[]>([]);
  const [followLoading, setFollowLoading] = useState(false);

  const load = useCallback(() => {
    api.get(`/users/${id}`).then(({ data }) => setProfile(data)).catch(() => {});
    api.get('/posts', { params: { userId: id } }).then(({ data }) => setPosts(data.posts)).catch(() => {});
  }, [id]);

  useFocusEffect(useCallback(() => { load(); }, [load]));

  const toggleFollow = async () => {
    setFollowLoading(true);
    try {
      const { data } = await api.post(`/users/${id}/follow`);
      setProfile((p: any) => ({
        ...p,
        isFollowing: data.following,
        stats: { ...p.stats, followers: p.stats.followers + (data.following ? 1 : -1) },
      }));
    } catch (err: any) {
      Toast.show({ type: 'error', text1: err.response?.data?.error || 'Erro' });
    } finally {
      setFollowLoading(false);
    }
  };

  const blockUser = async () => {
    try {
      const { data } = await api.post(`/users/${id}/block`);
      setProfile((p: any) => ({ ...p, isBlocked: data.blocked }));
      Toast.show({ type: 'success', text1: data.blocked ? 'Usuário bloqueado' : 'Usuário desbloqueado' });
    } catch (err: any) {
      Toast.show({ type: 'error', text1: err.response?.data?.error || 'Erro' });
    }
  };

  const reportUser = () => {
    Alert.prompt?.('Denunciar usuário', 'Descreva o motivo', async (reason?: string) => {
      if (!reason) return;
      try {
        await api.post(`/users/${id}/report`, { reason });
        Toast.show({ type: 'success', text1: 'Denúncia enviada' });
      } catch (err: any) {
        Toast.show({ type: 'error', text1: err.response?.data?.error || 'Erro' });
      }
    });
  };

  const openMenu = () => {
    Alert.alert('Opções', undefined, [
      { text: profile.isBlocked ? 'Desbloquear' : 'Bloquear', style: 'destructive', onPress: blockUser },
      { text: 'Denunciar', onPress: reportUser },
      { text: 'Cancelar', style: 'cancel' },
    ]);
  };

  if (!profile) return null;

  return (
    <View style={styles.container}>
      <FlatList
        data={posts}
        keyExtractor={(p) => p._id}
        contentContainerStyle={{ padding: 16, paddingBottom: 40 }}
        ListHeaderComponent={
          <View>
            <LinearGradient colors={colors.gradient} style={styles.header}>
              {!profile.isMe && (
                <TouchableOpacity style={styles.menuBtn} onPress={openMenu}>
                  <Ionicons name="ellipsis-horizontal" size={18} color="#fff" />
                </TouchableOpacity>
              )}
              <Avatar name={profile.user.name} uri={profile.user.avatar} size={78} />
              <Text style={styles.name}>{profile.user.name}</Text>
              {profile.user.city ? <Text style={styles.city}>{profile.user.city}</Text> : null}
            </LinearGradient>

            <View style={styles.statsRow}>
              <Stat value={profile.stats.totalDays} label="Dias" />
              <Stat value={profile.stats.medals} label="Medalhas" />
              <Stat value={profile.stats.followers} label="Seguidores" />
              <Stat value={profile.stats.following} label="Seguindo" />
            </View>

            {!profile.isMe && (
              <TouchableOpacity
                style={[styles.followBtn, profile.isFollowing && styles.followingBtn]}
                onPress={toggleFollow}
                disabled={followLoading}
              >
                <Ionicons name={profile.isFollowing ? 'checkmark' : 'person-add-outline'} size={16} color={profile.isFollowing ? colors.text : '#fff'} />
                <Text style={[styles.followBtnText, profile.isFollowing && { color: colors.text }]}>
                  {profile.isFollowing ? 'Seguindo' : 'Seguir'}
                </Text>
              </TouchableOpacity>
            )}

            {profile.medals?.length > 0 && (
              <View style={styles.medalsRow}>
                {profile.medals.map((m: any) => (
                  <View key={m._id} style={styles.medalChip}>
                    <Ionicons name="trophy" size={13} color={colors.gold} />
                    <Text style={styles.medalChipText} numberOfLines={1}>{m.challenge?.title}</Text>
                  </View>
                ))}
              </View>
            )}

            <Text style={styles.sectionTitle}>Publicações</Text>
          </View>
        }
        ListEmptyComponent={<EmptyState icon="albums-outline" title="Nenhuma publicação ainda" />}
        renderItem={({ item }) => (
          <TouchableOpacity style={styles.postRow} onPress={() => router.push(`/post/${item._id}`)}>
            <Ionicons name={item.type === 'medal' ? 'trophy' : item.type === 'checkin' ? 'checkmark-circle' : 'chatbubble-ellipses'} size={16} color={colors.primary} />
            <Text style={styles.postText} numberOfLines={2}>{item.text || `Dia ${item.day}`}</Text>
          </TouchableOpacity>
        )}
      />
    </View>
  );
}

function Stat({ value, label }: { value: any; label: string }) {
  return (
    <View style={styles.stat}>
      <Text style={styles.statValue}>{value}</Text>
      <Text style={styles.statLabel}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.bg },
  header: { alignItems: 'center', paddingVertical: 28, borderBottomLeftRadius: 28, borderBottomRightRadius: 28, position: 'relative' },
  menuBtn: { position: 'absolute', top: 14, right: 14, width: 34, height: 34, borderRadius: 17, backgroundColor: 'rgba(255,255,255,0.2)', alignItems: 'center', justifyContent: 'center' },
  name: { color: '#fff', fontSize: 20, fontFamily: 'Fraunces_600SemiBold', marginTop: 10 },
  city: { color: 'rgba(255,255,255,0.8)', fontSize: 12.5, marginTop: 2 },
  statsRow: { flexDirection: 'row', justifyContent: 'space-around', paddingVertical: 20, backgroundColor: colors.surface, marginTop: -18, borderRadius: 18, ...shadow.sm },
  stat: { alignItems: 'center' },
  statValue: { fontSize: 17, fontFamily: 'PlusJakartaSans_800ExtraBold', color: colors.text },
  statLabel: { fontSize: 11, color: colors.textMuted, marginTop: 2 },
  followBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, backgroundColor: colors.primary, borderRadius: 9999, padding: 13, marginTop: 16, ...shadow.primary },
  followingBtn: { backgroundColor: colors.surface2, shadowOpacity: 0 },
  followBtnText: { color: '#fff', fontWeight: '800', fontSize: 14 },
  medalsRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginTop: 16 },
  medalChip: { flexDirection: 'row', alignItems: 'center', gap: 5, backgroundColor: '#FFFBEB', borderRadius: 20, paddingHorizontal: 10, paddingVertical: 5, maxWidth: 180 },
  medalChipText: { fontSize: 11, color: '#78350F', fontWeight: '700' },
  sectionTitle: { fontSize: 15, fontFamily: 'PlusJakartaSans_700Bold', color: colors.text, marginTop: 24, marginBottom: 10 },
  postRow: { flexDirection: 'row', alignItems: 'center', gap: 10, backgroundColor: colors.surface, borderRadius: 12, padding: 12, marginBottom: 8 },
  postText: { flex: 1, color: colors.text, fontSize: 13 },
});
