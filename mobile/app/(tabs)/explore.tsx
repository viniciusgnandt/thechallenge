import { useCallback, useState } from 'react';
import { View, Text, FlatList, TouchableOpacity, StyleSheet } from 'react-native';
import { useFocusEffect, useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import api from '../../src/api/axios';
import { colors, shadow } from '../../src/constants/colors';
import EmptyState from '../../src/components/EmptyState';

export default function ExploreScreen() {
  const router = useRouter();
  const [challenges, setChallenges] = useState<any[] | null>(null);

  useFocusEffect(useCallback(() => {
    api.get('/challenges').then(({ data }) => setChallenges(data.challenges)).catch(() => setChallenges([]));
  }, []));

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.topBar}>
        <Text style={styles.title}>Explorar</Text>
        <View style={{ flexDirection: 'row', gap: 10 }}>
          <TouchableOpacity style={styles.iconBtn} onPress={() => router.push('/search')}>
            <Ionicons name="search" size={19} color={colors.text} />
          </TouchableOpacity>
          <TouchableOpacity style={styles.iconBtn} onPress={() => router.push('/my-challenges')}>
            <Ionicons name="trophy-outline" size={19} color={colors.text} />
          </TouchableOpacity>
        </View>
      </View>

      <FlatList
        data={challenges || []}
        keyExtractor={(c) => c._id}
        contentContainerStyle={{ padding: 16, paddingBottom: 40 }}
        ListEmptyComponent={challenges !== null ? <EmptyState title="Nenhum desafio publicado ainda" /> : null}
        renderItem={({ item }) => (
          <TouchableOpacity style={styles.card} onPress={() => router.push(`/challenge/${item.slug}`)}>
            <View style={styles.cardTop}>
              <View style={styles.badge}><Ionicons name="flame" size={12} color="#fff" /><Text style={styles.badgeText}>{item.durationDays} dias</Text></View>
            </View>
            <Text style={styles.cardTitle}>{item.title}</Text>
            <Text style={styles.cardDesc} numberOfLines={2}>{item.description}</Text>
            <View style={styles.levelsRow}>
              <Text style={[styles.levelTag, { color: '#059669', backgroundColor: '#ECFDF5' }]}>Básico</Text>
              <Text style={[styles.levelTag, { color: '#B45309', backgroundColor: '#FFFBEB' }]}>Intermediário</Text>
              <Text style={[styles.levelTag, { color: '#DC2626', backgroundColor: '#FEF2F2' }]}>Avançado</Text>
            </View>
            <View style={styles.cardFooter}>
              <Text style={styles.price}>a partir de {item.priceInstallments?.count}x R$ {item.priceInstallments?.value}</Text>
              <Ionicons name="arrow-forward" size={16} color={colors.primary} />
            </View>
          </TouchableOpacity>
        )}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.bg },
  topBar: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 20, paddingTop: 8, paddingBottom: 12 },
  title: { fontSize: 23, fontFamily: 'Fraunces_600SemiBold', color: colors.text },
  iconBtn: { width: 38, height: 38, borderRadius: 19, backgroundColor: colors.surface2, alignItems: 'center', justifyContent: 'center' },
  card: { backgroundColor: colors.surface, borderRadius: 18, padding: 18, marginBottom: 14, ...shadow.sm },
  cardTop: { flexDirection: 'row', marginBottom: 10 },
  badge: { flexDirection: 'row', alignItems: 'center', gap: 4, backgroundColor: colors.primary, borderRadius: 20, paddingHorizontal: 10, paddingVertical: 4 },
  badgeText: { color: '#fff', fontSize: 11, fontWeight: '800' },
  cardTitle: { fontSize: 19, fontFamily: 'Fraunces_600SemiBold', color: colors.text, marginBottom: 6 },
  cardDesc: { color: colors.textMuted, fontSize: 13, marginBottom: 14, lineHeight: 18 },
  levelsRow: { flexDirection: 'row', gap: 6, marginBottom: 16, flexWrap: 'wrap' },
  levelTag: { fontSize: 10.5, fontWeight: '800', borderRadius: 20, paddingHorizontal: 9, paddingVertical: 3, textTransform: 'uppercase' },
  cardFooter: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  price: { color: colors.primary, fontWeight: '800', fontSize: 13 },
});
