import { useCallback, useState } from 'react';
import { View, Text, FlatList, TouchableOpacity, StyleSheet } from 'react-native';
import { useFocusEffect, useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import api from '../../src/api/axios';
import { useAuthStore } from '../../src/store/authStore';
import { colors, shadow } from '../../src/constants/colors';
import Avatar from '../../src/components/Avatar';
import EmptyState from '../../src/components/EmptyState';

export default function ProfileScreen() {
  const router = useRouter();
  const { user } = useAuthStore();
  const [profile, setProfile] = useState<any>(null);
  const [posts, setPosts] = useState<any[]>([]);

  useFocusEffect(useCallback(() => {
    if (!user) return;
    api.get(`/users/${user._id}`).then(({ data }) => setProfile(data)).catch(() => {});
    api.get('/posts', { params: { userId: user._id } }).then(({ data }) => setPosts(data.posts)).catch(() => {});
  }, [user]));

  if (!user) return null;

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <FlatList
        data={posts}
        keyExtractor={(p) => p._id}
        numColumns={3}
        contentContainerStyle={{ paddingBottom: 40 }}
        columnWrapperStyle={{ gap: 3 }}
        ListHeaderComponent={
          <View>
            <LinearGradient colors={colors.gradient} style={styles.header}>
              <TouchableOpacity style={styles.settingsBtn} onPress={() => router.push('/settings')}>
                <Ionicons name="settings-outline" size={20} color="#fff" />
              </TouchableOpacity>
              <View style={styles.avatarWrap}><Avatar name={user.name} uri={user.avatar} size={78} /></View>
              <Text style={styles.name}>{user.name}</Text>
              {user.city ? <Text style={styles.city}>{user.city}</Text> : null}
              {profile?.stats?.streak > 0 && (
                <View style={styles.streakPill}>
                  <Ionicons name="flame" size={13} color="#fff" />
                  <Text style={styles.streakPillText}>{profile.stats.streak} dias seguidos</Text>
                </View>
              )}
            </LinearGradient>

            <View style={styles.statsRow}>
              <Stat value={profile?.stats?.totalDays ?? '—'} label="Dias" />
              <Stat value={profile?.stats?.medals ?? '—'} label="Medalhas" onPress={() => router.push('/medals')} />
              <Stat value={profile?.stats?.followers ?? '—'} label="Seguidores" />
              <Stat value={profile?.stats?.following ?? '—'} label="Seguindo" />
            </View>

            <View style={styles.quickLinks}>
              <QuickLink icon="people-outline" label="Grupos" onPress={() => router.push('/groups')} />
              <QuickLink icon="trophy-outline" label="Meus Desafios" onPress={() => router.push('/my-challenges')} />
              <QuickLink icon="ribbon-outline" label="Medalhas" onPress={() => router.push('/medals')} />
              <QuickLink icon="watch-outline" label={user.strava?.athleteId ? 'Strava conectado' : 'Conectar Strava'} onPress={() => router.push('/settings')} highlight={!!user.strava?.athleteId} />
            </View>

            <Text style={styles.sectionTitle}>Minhas publicações</Text>
          </View>
        }
        ListEmptyComponent={<EmptyState icon="grid-outline" title="Você ainda não publicou nada" subtitle="Complete um dia de desafio para aparecer aqui" />}
        renderItem={({ item }) => (
          <TouchableOpacity style={styles.gridItem} onPress={() => router.push(`/post/${item._id}`)}>
            {item.type === 'medal' ? (
              <View style={[styles.gridInner, { backgroundColor: '#FFFBEB' }]}><Ionicons name="trophy" size={22} color={colors.gold} /></View>
            ) : (
              <View style={styles.gridInner}>
                <Ionicons name={item.type === 'checkin' ? 'checkmark-circle' : 'chatbubble-ellipses'} size={18} color={colors.primary} />
                <Text style={styles.gridText} numberOfLines={3}>{item.text || `Dia ${item.day}`}</Text>
              </View>
            )}
          </TouchableOpacity>
        )}
      />
    </SafeAreaView>
  );
}

function Stat({ value, label, onPress }: { value: any; label: string; onPress?: () => void }) {
  const Comp = onPress ? TouchableOpacity : View;
  return (
    <Comp style={styles.stat} onPress={onPress}>
      <Text style={styles.statValue}>{value}</Text>
      <Text style={styles.statLabel}>{label}</Text>
    </Comp>
  );
}

function QuickLink({ icon, label, onPress, highlight }: { icon: any; label: string; onPress: () => void; highlight?: boolean }) {
  return (
    <TouchableOpacity style={styles.quickLink} onPress={onPress}>
      <View style={[styles.quickLinkIcon, highlight && { backgroundColor: colors.successSoft }]}>
        <Ionicons name={icon} size={18} color={highlight ? colors.success : colors.primary} />
      </View>
      <Text style={styles.quickLinkText}>{label}</Text>
      <Ionicons name="chevron-forward" size={16} color={colors.textLight} />
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.bg },
  header: { alignItems: 'center', paddingTop: 20, paddingBottom: 28, borderBottomLeftRadius: 28, borderBottomRightRadius: 28 },
  settingsBtn: { position: 'absolute', top: 16, right: 16, width: 36, height: 36, borderRadius: 18, backgroundColor: 'rgba(255,255,255,0.2)', alignItems: 'center', justifyContent: 'center' },
  avatarWrap: { borderWidth: 3, borderColor: 'rgba(255,255,255,0.5)', borderRadius: 44, marginBottom: 10 },
  name: { color: '#fff', fontSize: 19, fontFamily: 'PlusJakartaSans_800ExtraBold' },
  city: { color: 'rgba(255,255,255,0.8)', fontSize: 12.5, marginTop: 2 },
  streakPill: { flexDirection: 'row', alignItems: 'center', gap: 5, backgroundColor: 'rgba(255,255,255,0.2)', borderRadius: 20, paddingHorizontal: 12, paddingVertical: 5, marginTop: 10 },
  streakPillText: { color: '#fff', fontWeight: '700', fontSize: 11.5 },
  statsRow: { flexDirection: 'row', justifyContent: 'space-around', paddingVertical: 20, backgroundColor: colors.surface, marginHorizontal: 16, marginTop: -18, borderRadius: 18, ...shadow.sm },
  stat: { alignItems: 'center' },
  statValue: { fontSize: 17, fontFamily: 'PlusJakartaSans_800ExtraBold', color: colors.text },
  statLabel: { fontSize: 11, color: colors.textMuted, marginTop: 2 },
  quickLinks: { paddingHorizontal: 16, marginTop: 16, gap: 8 },
  quickLink: { flexDirection: 'row', alignItems: 'center', backgroundColor: colors.surface, borderRadius: 14, padding: 14, gap: 12 },
  quickLinkIcon: { width: 34, height: 34, borderRadius: 17, backgroundColor: colors.gradientSoft, alignItems: 'center', justifyContent: 'center' },
  quickLinkText: { flex: 1, color: colors.text, fontWeight: '600', fontSize: 13.5 },
  sectionTitle: { fontSize: 15, fontFamily: 'PlusJakartaSans_700Bold', color: colors.text, marginTop: 24, marginBottom: 10, marginLeft: 16 },
  gridItem: { flex: 1 / 3, aspectRatio: 1, marginBottom: 3, marginLeft: 3 },
  gridInner: { flex: 1, backgroundColor: colors.surface2, alignItems: 'center', justifyContent: 'center', padding: 6, gap: 4 },
  gridText: { fontSize: 9.5, color: colors.textMuted, textAlign: 'center' },
});
