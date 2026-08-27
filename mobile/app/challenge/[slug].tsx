import { useEffect, useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import Toast from 'react-native-toast-message';
import api from '../../src/api/axios';
import { useAuthStore } from '../../src/store/authStore';
import { colors, shadow } from '../../src/constants/colors';

const LEVELS = ['basico', 'intermediario', 'avancado'];
const LABEL: Record<string, string> = { basico: 'Básico', intermediario: 'Intermediário', avancado: 'Avançado' };
const TASK_ICON: Record<string, any> = { strava: 'watch-outline', video_link: 'videocam-outline', checkin: 'checkmark-circle-outline' };

export default function ChallengeDetailScreen() {
  const { slug } = useLocalSearchParams<{ slug: string }>();
  const router = useRouter();
  const { user } = useAuthStore();
  const [challenge, setChallenge] = useState<any>(null);
  const [level, setLevel] = useState('basico');
  const [enrolling, setEnrolling] = useState(false);

  const isSubscribed = user?.subscription?.status === 'active' || user?.role === 'admin';

  useEffect(() => {
    api.get(`/challenges/${slug}`).then(({ data }) => setChallenge(data.challenge)).catch(() => {});
  }, [slug]);

  const handleEnroll = async () => {
    if (!isSubscribed) return router.push('/subscribe');
    setEnrolling(true);
    try {
      const { data } = await api.post('/enrollments', { challengeId: challenge._id, level });
      Toast.show({ type: 'success', text1: 'Inscrição realizada!' });
      router.replace(`/enrollment/${data.enrollment._id}`);
    } catch (err: any) {
      if (err.response?.data?.code === 'SUBSCRIPTION_REQUIRED') return router.push('/subscribe');
      Toast.show({ type: 'error', text1: err.response?.data?.error || 'Erro ao se inscrever' });
    } finally {
      setEnrolling(false);
    }
  };

  if (!challenge) return null;
  const levelData = challenge.levels?.find((l: any) => l.name === level);
  const preview = levelData?.tasks?.slice(0, 5) || [];

  return (
    <ScrollView style={styles.container} contentContainerStyle={{ padding: 16, paddingBottom: 100 }}>
      <View style={styles.durationBadge}><Ionicons name="flame" size={12} color="#fff" /><Text style={styles.durationBadgeText}>{challenge.durationDays} dias</Text></View>
      <Text style={styles.title}>{challenge.title}</Text>
      <Text style={styles.desc}>{challenge.description}</Text>

      <Text style={styles.sectionTitle}>Escolha seu nível</Text>
      <View style={{ flexDirection: 'row', gap: 8, marginBottom: 20 }}>
        {LEVELS.map((l) => (
          <TouchableOpacity key={l} style={[styles.levelBtn, level === l && styles.levelBtnActive]} onPress={() => setLevel(l)}>
            <Text style={[styles.levelBtnText, level === l && { color: colors.primary }]}>{LABEL[l]}</Text>
          </TouchableOpacity>
        ))}
      </View>

      <View style={styles.card}>
        <Text style={styles.sectionTitle}>Primeiros dias</Text>
        {preview.map((task: any) => (
          <View key={task.day} style={styles.taskRow}>
            <View style={styles.taskIcon}><Ionicons name={TASK_ICON[task.validationType]} size={16} color={colors.primary} /></View>
            <View style={{ flex: 1 }}>
              <Text style={styles.taskTitle}>{task.title}</Text>
              <Text style={styles.taskDesc} numberOfLines={2}>{task.description}</Text>
            </View>
          </View>
        ))}
      </View>

      <View style={[styles.card, { marginTop: 16 }]}>
        {isSubscribed ? (
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 16 }}>
            <Ionicons name="checkmark-circle" size={16} color={colors.success} />
            <Text style={{ color: colors.success, fontWeight: '700', fontSize: 13 }}>Sua assinatura está ativa</Text>
          </View>
        ) : (
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 16 }}>
            <Ionicons name="lock-closed-outline" size={16} color={colors.textMuted} />
            <Text style={{ color: colors.textMuted, fontWeight: '600', fontSize: 13 }}>Disponível para assinantes</Text>
          </View>
        )}
        <TouchableOpacity style={styles.enrollBtn} onPress={handleEnroll} disabled={enrolling}>
          <Text style={styles.enrollBtnText}>{enrolling ? 'Inscrevendo...' : isSubscribed ? 'Quero me desafiar' : 'Assinar o TheChallenge'}</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.rankingLink} onPress={() => router.push(`/challenge/${slug}/ranking`)}>
          <Ionicons name="trophy-outline" size={16} color={colors.text} />
          <Text style={styles.rankingLinkText}>Ver ranking</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.bg },
  durationBadge: { flexDirection: 'row', alignItems: 'center', gap: 4, alignSelf: 'flex-start', backgroundColor: colors.primary, borderRadius: 20, paddingHorizontal: 10, paddingVertical: 4, marginBottom: 10 },
  durationBadgeText: { color: '#fff', fontSize: 11, fontWeight: '800' },
  title: { fontSize: 24, fontFamily: 'Fraunces_600SemiBold', color: colors.text, marginBottom: 8 },
  desc: { color: colors.textMuted, marginBottom: 20, lineHeight: 20 },
  sectionTitle: { fontSize: 15, fontFamily: 'PlusJakartaSans_700Bold', color: colors.text, marginBottom: 12 },
  levelBtn: { flex: 1, borderWidth: 1.5, borderColor: colors.border, borderRadius: 14, paddingVertical: 12, alignItems: 'center' },
  levelBtnActive: { borderColor: colors.primary, backgroundColor: colors.gradientSoft },
  levelBtnText: { fontWeight: '700', fontSize: 12.5, color: colors.text },
  card: { backgroundColor: colors.surface, borderRadius: 16, padding: 16, ...shadow.sm },
  taskRow: { flexDirection: 'row', gap: 10, paddingVertical: 10, borderBottomWidth: 1, borderBottomColor: colors.border },
  taskIcon: { width: 34, height: 34, borderRadius: 17, backgroundColor: colors.gradientSoft, alignItems: 'center', justifyContent: 'center' },
  taskTitle: { color: colors.text, fontWeight: '700', fontSize: 13 },
  taskDesc: { color: colors.textMuted, fontSize: 11.5, marginTop: 2 },
  priceLabel: { color: colors.textMuted, fontSize: 11.5 },
  price: { color: colors.text, fontSize: 19, fontFamily: 'PlusJakartaSans_800ExtraBold' },
  enrollBtn: { backgroundColor: colors.primary, borderRadius: 9999, padding: 15, alignItems: 'center', ...shadow.primary },
  enrollBtnText: { color: '#fff', fontWeight: '800', fontSize: 14.5 },
  rankingLink: { flexDirection: 'row', gap: 8, alignItems: 'center', justifyContent: 'center', padding: 12, marginTop: 8 },
  rankingLinkText: { color: colors.text, fontWeight: '700', fontSize: 13.5 },
});
