import { useEffect, useState } from 'react';
import { View, Text, FlatList, TouchableOpacity, StyleSheet } from 'react-native';
import { useLocalSearchParams } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import api from '../../../src/api/axios';
import { colors, shadow } from '../../../src/constants/colors';
import Avatar from '../../../src/components/Avatar';
import EmptyState from '../../../src/components/EmptyState';

const LEVELS = [
  { value: '', label: 'Todos' },
  { value: 'basico', label: 'Básico' },
  { value: 'intermediario', label: 'Intermediário' },
  { value: 'avancado', label: 'Avançado' },
];

export default function RankingScreen() {
  const { slug } = useLocalSearchParams<{ slug: string }>();
  const [challenge, setChallenge] = useState<any>(null);
  const [ranking, setRanking] = useState<any[] | null>(null);
  const [level, setLevel] = useState('');

  useEffect(() => {
    api.get(`/challenges/${slug}`).then(({ data }) => setChallenge(data.challenge)).catch(() => {});
  }, [slug]);

  useEffect(() => {
    if (!challenge) return;
    setRanking(null);
    api.get(`/rankings/${challenge._id}`, { params: level ? { level } : {} })
      .then(({ data }) => setRanking(data.ranking)).catch(() => setRanking([]));
  }, [challenge, level]);

  const medalColor = (i: number) => (i === 0 ? colors.gold : i === 1 ? colors.silver : i === 2 ? colors.bronze : colors.textLight);

  return (
    <FlatList
      style={{ backgroundColor: colors.bg }}
      data={ranking || []}
      keyExtractor={(r) => r._id}
      contentContainerStyle={{ padding: 16 }}
      ListHeaderComponent={
        <View style={{ flexDirection: 'row', gap: 8, marginBottom: 16 }}>
          {LEVELS.map((l) => (
            <TouchableOpacity key={l.value} style={[styles.filterBtn, level === l.value && styles.filterBtnActive]} onPress={() => setLevel(l.value)}>
              <Text style={[styles.filterText, level === l.value && { color: '#fff' }]}>{l.label}</Text>
            </TouchableOpacity>
          ))}
        </View>
      }
      ListEmptyComponent={ranking !== null ? <EmptyState icon="trophy-outline" title="Ninguém no ranking ainda" /> : null}
      renderItem={({ item, index }) => (
        <View style={styles.row}>
          <View style={[styles.posCircle, index < 3 && { backgroundColor: medalColor(index) }]}>
            <Text style={[styles.posText, index < 3 && { color: '#fff' }]}>{index + 1}</Text>
          </View>
          <Avatar name={item.user?.name} uri={item.user?.avatar} size={38} />
          <Text style={styles.name} numberOfLines={1}>{item.user?.name}</Text>
          <Text style={styles.days}>{item.completedDays}d</Text>
        </View>
      )}
    />
  );
}

const styles = StyleSheet.create({
  filterBtn: { borderWidth: 1.5, borderColor: colors.border, borderRadius: 20, paddingHorizontal: 14, paddingVertical: 7 },
  filterBtnActive: { backgroundColor: colors.primary, borderColor: colors.primary },
  filterText: { fontSize: 12, fontWeight: '700', color: colors.text },
  row: { flexDirection: 'row', alignItems: 'center', gap: 10, backgroundColor: colors.surface, borderRadius: 14, padding: 12, marginBottom: 8, ...shadow.sm },
  posCircle: { width: 26, height: 26, borderRadius: 13, backgroundColor: colors.surface2, alignItems: 'center', justifyContent: 'center' },
  posText: { fontSize: 11, fontWeight: '800', color: colors.textMuted },
  name: { flex: 1, color: colors.text, fontWeight: '700', fontSize: 13.5 },
  days: { color: colors.primary, fontWeight: '800', fontSize: 12.5 },
});
