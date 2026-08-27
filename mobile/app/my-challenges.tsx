import { useEffect, useState } from 'react';
import { View, Text, FlatList, TouchableOpacity, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import api from '../src/api/axios';
import { colors, shadow } from '../src/constants/colors';
import EmptyState from '../src/components/EmptyState';

export default function MyChallengesScreen() {
  const [enrollments, setEnrollments] = useState<any[] | null>(null);
  const router = useRouter();

  useEffect(() => {
    api.get('/enrollments/me').then(({ data }) => setEnrollments(data.enrollments)).catch(() => setEnrollments([]));
  }, []);

  return (
    <FlatList
      style={{ backgroundColor: colors.bg }}
      data={enrollments || []}
      keyExtractor={(e) => e._id}
      contentContainerStyle={{ padding: 16 }}
      ListEmptyComponent={enrollments !== null ? <EmptyState icon="flame-outline" title="Você ainda não está em nenhum desafio" /> : null}
      renderItem={({ item }) => {
        const total = item.challenge?.durationDays || 100;
        const pct = Math.min(100, Math.round((item.completedDays / total) * 100));
        return (
          <TouchableOpacity style={styles.card} onPress={() => router.push(`/enrollment/${item._id}`)}>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
              <Text style={styles.cardTitle}>{item.challenge?.title}</Text>
              {item.status === 'completed' && <Ionicons name="trophy" size={20} color={colors.gold} />}
            </View>
            <View style={styles.levelTag}><Text style={styles.levelTagText}>{item.level}</Text></View>
            <View style={styles.progressBar}><View style={[styles.progressFill, { width: `${pct}%` }]} /></View>
            <Text style={styles.progressText}>{item.completedDays} / {total} dias</Text>
          </TouchableOpacity>
        );
      }}
    />
  );
}

const styles = StyleSheet.create({
  card: { backgroundColor: colors.surface, borderRadius: 16, padding: 16, marginBottom: 12, ...shadow.sm },
  cardTitle: { color: colors.text, fontSize: 17, fontFamily: 'Fraunces_600SemiBold' },
  levelTag: { alignSelf: 'flex-start', backgroundColor: colors.gradientSoft, borderRadius: 20, paddingHorizontal: 10, paddingVertical: 3, marginTop: 6, marginBottom: 12 },
  levelTagText: { color: colors.primary, fontSize: 10.5, fontWeight: '800', textTransform: 'uppercase' },
  progressBar: { height: 8, backgroundColor: colors.surface2, borderRadius: 999, overflow: 'hidden' },
  progressFill: { height: '100%', backgroundColor: colors.primary },
  progressText: { color: colors.textMuted, fontSize: 12.5, marginTop: 6 },
});
