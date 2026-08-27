import { useEffect, useState } from 'react';
import { View, Text, FlatList, TouchableOpacity, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import api from '../src/api/axios';
import { colors, shadow } from '../src/constants/colors';
import EmptyState from '../src/components/EmptyState';

export default function MedalsScreen() {
  const router = useRouter();
  const [enrollments, setEnrollments] = useState<any[] | null>(null);

  useEffect(() => {
    api.get('/enrollments/me').then(({ data }) => setEnrollments(data.enrollments.filter((e: any) => e.medalIssued))).catch(() => setEnrollments([]));
  }, []);

  return (
    <FlatList
      style={{ backgroundColor: colors.bg }}
      data={enrollments || []}
      keyExtractor={(e) => e._id}
      numColumns={2}
      columnWrapperStyle={{ gap: 14 }}
      contentContainerStyle={{ padding: 16, gap: 14 }}
      ListEmptyComponent={enrollments !== null ? (
        <EmptyState icon="ribbon-outline" title="Nenhuma medalha ainda" subtitle="Complete um desafio de 100 dias para conquistar sua primeira medalha" />
      ) : null}
      renderItem={({ item }) => (
        <TouchableOpacity style={styles.card} onPress={() => router.push(`/enrollment/${item._id}/certificate`)}>
          <LinearGradient colors={['#FDE68A', '#F59E0B']} style={styles.medalCircle}>
            <Ionicons name="trophy" size={26} color="#78350F" />
          </LinearGradient>
          <Text style={styles.title} numberOfLines={2}>{item.challenge?.title}</Text>
          <View style={styles.levelTag}><Text style={styles.levelTagText}>{item.level}</Text></View>
        </TouchableOpacity>
      )}
    />
  );
}

const styles = StyleSheet.create({
  card: { flex: 1, backgroundColor: colors.surface, borderRadius: 18, padding: 18, alignItems: 'center', ...shadow.sm },
  medalCircle: { width: 56, height: 56, borderRadius: 28, alignItems: 'center', justifyContent: 'center', marginBottom: 10 },
  title: { color: colors.text, fontWeight: '700', fontSize: 13, textAlign: 'center', marginBottom: 8 },
  levelTag: { backgroundColor: colors.gradientSoft, borderRadius: 20, paddingHorizontal: 10, paddingVertical: 3 },
  levelTagText: { color: colors.primary, fontSize: 10.5, fontWeight: '800', textTransform: 'uppercase' },
});
