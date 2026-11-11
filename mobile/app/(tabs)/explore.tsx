import { useCallback, useState } from 'react';
import { View, Text, FlatList, TouchableOpacity, StyleSheet, ImageBackground } from 'react-native';
import { useFocusEffect, useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import api from '../../src/api/axios';
import { colors, shadow } from '../../src/constants/colors';
import EmptyState from '../../src/components/EmptyState';

const LEVELS = [
  { label: 'BÁSICO', color: '#4ADE80' },
  { label: 'INTERMEDIÁRIO', color: '#FBBF24' },
  { label: 'AVANÇADO', color: '#F87171' },
];

export default function ExploreScreen() {
  const router = useRouter();
  const [challenges, setChallenges] = useState<any[] | null>(null);

  useFocusEffect(useCallback(() => {
    api.get('/challenges').then(({ data }) => setChallenges(data.challenges)).catch(() => setChallenges([]));
  }, []));

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <FlatList
        data={challenges || []}
        keyExtractor={(c) => c._id}
        contentContainerStyle={{ paddingBottom: 40 }}
        ListHeaderComponent={
          <ImageBackground source={require('../../assets/hero.webp')} style={styles.header} imageStyle={{ height: 380 }} resizeMode="cover">
            <LinearGradient colors={['rgba(10,10,10,0.2)', 'rgba(10,10,10,0.75)', colors.bg]} style={StyleSheet.absoluteFill} />
            <View style={styles.headerActions}>
              <TouchableOpacity style={styles.iconBtn} onPress={() => router.push('/search')}>
                <Ionicons name="search" size={19} color="#fff" />
              </TouchableOpacity>
              <TouchableOpacity style={styles.iconBtn} onPress={() => router.push('/my-challenges')}>
                <Ionicons name="list" size={19} color="#fff" />
              </TouchableOpacity>
            </View>
            <View style={{ paddingHorizontal: 20, paddingBottom: 14 }}>
              <Text style={styles.headerKicker}>ESCOLHA SEU</Text>
              <Text style={styles.headerTitle}>DESAFIO</Text>
              <View style={styles.underline} />
            </View>
          </ImageBackground>
        }
        ListEmptyComponent={challenges !== null ? <EmptyState title="Nenhum desafio publicado ainda" /> : null}
        renderItem={({ item }) => (
          <TouchableOpacity activeOpacity={0.9} style={styles.card} onPress={() => router.push(`/challenge/${item.slug}`)}>
            <LinearGradient colors={colors.gradientFire} start={{ x: 0, y: 1 }} end={{ x: 0, y: 0 }} style={styles.stripe} />
            <View style={{ flex: 1, padding: 16 }}>
              <View style={styles.cardTop}>
                <LinearGradient colors={colors.gradient} style={styles.iconCircle}>
                  <Ionicons name={(item.icon || 'flame') as any} size={20} color="#fff" />
                </LinearGradient>
                <View style={styles.daysBadge}>
                  <Text style={styles.daysNum}>{item.durationDays}</Text>
                  <Text style={styles.daysLabel}>DIAS</Text>
                </View>
              </View>
              <Text style={styles.cardTitle}>{item.title.toUpperCase()}</Text>
              <Text style={styles.cardDesc} numberOfLines={2}>{item.description}</Text>
              <View style={styles.levelsRow}>
                {LEVELS.map((l) => (
                  <Text key={l.label} style={[styles.levelTag, { color: l.color, borderColor: l.color }]}>{l.label}</Text>
                ))}
              </View>
              <LinearGradient colors={colors.gradientCta} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }} style={styles.cta}>
                <Text style={styles.ctaText}>ACEITE O DESAFIO</Text>
                <Ionicons name="arrow-forward" size={18} color="#111" />
              </LinearGradient>
            </View>
          </TouchableOpacity>
        )}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.bg },
  header: { height: 230, justifyContent: 'space-between', marginBottom: 6, overflow: 'hidden' },
  headerActions: { flexDirection: 'row', justifyContent: 'flex-end', gap: 10, padding: 16 },
  iconBtn: { width: 38, height: 38, borderRadius: 19, backgroundColor: 'rgba(0,0,0,0.5)', alignItems: 'center', justifyContent: 'center' },
  headerKicker: { color: colors.accent, fontFamily: 'BarlowCondensed_800ExtraBold_Italic', fontSize: 20 },
  headerTitle: { color: '#fff', fontFamily: 'BarlowCondensed_900Black_Italic', fontSize: 58, lineHeight: 60, textShadowColor: 'rgba(225,29,29,0.9)', textShadowOffset: { width: 3, height: 3 }, textShadowRadius: 1 },
  underline: { height: 4, width: 110, backgroundColor: colors.red, transform: [{ skewX: '-20deg' }] },
  card: { flexDirection: 'row', backgroundColor: colors.surface, borderRadius: 14, marginHorizontal: 16, marginBottom: 16, overflow: 'hidden', borderWidth: 1, borderColor: colors.border, ...shadow.md },
  stripe: { width: 6 },
  cardTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 },
  iconCircle: { width: 42, height: 42, borderRadius: 21, alignItems: 'center', justifyContent: 'center' },
  daysBadge: { alignItems: 'center' },
  daysNum: { color: colors.accent, fontFamily: 'BarlowCondensed_900Black_Italic', fontSize: 30, lineHeight: 30 },
  daysLabel: { color: colors.textMuted, fontFamily: 'BarlowCondensed_800ExtraBold_Italic', fontSize: 12 },
  cardTitle: { fontSize: 26, lineHeight: 28, fontFamily: 'BarlowCondensed_900Black_Italic', color: colors.text, marginBottom: 6 },
  cardDesc: { color: colors.textMuted, fontSize: 13, marginBottom: 14, lineHeight: 18 },
  levelsRow: { flexDirection: 'row', gap: 6, marginBottom: 16, flexWrap: 'wrap' },
  levelTag: { fontSize: 12, fontFamily: 'BarlowCondensed_800ExtraBold_Italic', borderWidth: 1, borderRadius: 4, paddingHorizontal: 8, paddingVertical: 2 },
  cta: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, paddingVertical: 11, borderRadius: 6, transform: [{ skewX: '-8deg' }] },
  ctaText: { color: '#111', fontFamily: 'BarlowCondensed_900Black_Italic', fontSize: 19 },
});
