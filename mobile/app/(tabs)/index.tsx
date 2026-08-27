import { useCallback, useState } from 'react';
import { View, Text, FlatList, TouchableOpacity, StyleSheet, RefreshControl, ActivityIndicator } from 'react-native';
import { useFocusEffect, useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import api from '../../src/api/axios';
import { useAuthStore } from '../../src/store/authStore';
import { colors } from '../../src/constants/colors';
import PostCard from '../../src/components/PostCard';
import EmptyState from '../../src/components/EmptyState';

export default function FeedScreen() {
  const router = useRouter();
  const { user } = useAuthStore();
  const [posts, setPosts] = useState<any[] | null>(null);
  const [nextCursor, setNextCursor] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [streak, setStreak] = useState(0);

  const load = useCallback(async () => {
    try {
      const { data } = await api.get('/posts');
      setPosts(data.posts);
      setNextCursor(data.nextCursor);
    } catch {
      setPosts([]);
    }
    if (user?._id) {
      api.get(`/users/${user._id}`).then(({ data }) => setStreak(data.stats?.streak || 0)).catch(() => {});
    }
  }, [user?._id]);

  useFocusEffect(useCallback(() => { load(); }, [load]));

  const onRefresh = async () => {
    setRefreshing(true);
    await load();
    setRefreshing(false);
  };

  const loadMore = async () => {
    if (!nextCursor || loadingMore) return;
    setLoadingMore(true);
    try {
      const { data } = await api.get('/posts', { params: { cursor: nextCursor } });
      setPosts((prev) => [...(prev || []), ...data.posts]);
      setNextCursor(data.nextCursor);
    } catch {}
    setLoadingMore(false);
  };

  const toggleLike = async (id: string) => {
    setPosts((prev) => prev?.map((p) => p._id === id
      ? { ...p, liked: !p.liked, likesCount: p.likesCount + (p.liked ? -1 : 1) }
      : p) || []);
    try {
      await api.post(`/posts/${id}/like`);
    } catch {
      load();
    }
  };

  const removePost = (id: string) => setPosts((prev) => prev?.filter((p) => p._id !== id) || []);

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <LinearGradient colors={colors.gradient} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={styles.header}>
        <View>
          <Text style={styles.headerTitle}>TheChallenge</Text>
          <Text style={styles.headerSubtitle}>Veja o que a comunidade está fazendo</Text>
        </View>
        <View style={{ flexDirection: 'row', gap: 8 }}>
          {streak > 0 && (
            <View style={styles.streakBadge}>
              <Ionicons name="flame" size={14} color="#fff" />
              <Text style={styles.streakText}>{streak}</Text>
            </View>
          )}
          <TouchableOpacity style={styles.searchBtn} onPress={() => router.push('/search')}>
            <Ionicons name="search" size={20} color="#fff" />
          </TouchableOpacity>
        </View>
      </LinearGradient>

      <FlatList
        data={posts || []}
        keyExtractor={(p) => p._id}
        contentContainerStyle={{ padding: 16, paddingBottom: 40 }}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.primary} />}
        onEndReachedThreshold={0.4}
        onEndReached={loadMore}
        ListFooterComponent={loadingMore ? <ActivityIndicator color={colors.primary} style={{ marginTop: 10 }} /> : null}
        ListEmptyComponent={posts !== null ? (
          <EmptyState icon="flame-outline" title="Nenhuma atividade ainda"
            subtitle="Complete um dia de desafio ou publique algo para começar o feed." />
        ) : null}
        renderItem={({ item }) => (
          <PostCard
            post={item}
            onLike={toggleLike}
            onOpen={(id) => router.push(`/post/${id}`)}
            onOpenUser={(id) => router.push(`/user/${id}`)}
            onRemoved={removePost}
          />
        )}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.bg },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: 20, paddingBottom: 24, borderBottomLeftRadius: 24, borderBottomRightRadius: 24 },
  headerTitle: { color: '#fff', fontSize: 23, fontFamily: 'Fraunces_600SemiBold' },
  headerSubtitle: { color: 'rgba(255,255,255,0.8)', fontSize: 12.5, marginTop: 2 },
  searchBtn: { width: 40, height: 40, borderRadius: 20, backgroundColor: 'rgba(255,255,255,0.2)', alignItems: 'center', justifyContent: 'center' },
  streakBadge: { flexDirection: 'row', alignItems: 'center', gap: 4, backgroundColor: 'rgba(255,255,255,0.2)', borderRadius: 20, paddingHorizontal: 10, height: 40 },
  streakText: { color: '#fff', fontWeight: '800', fontSize: 13 },
});
