import { useCallback, useState } from 'react';
import { View, Text, FlatList, TextInput, TouchableOpacity, StyleSheet, KeyboardAvoidingView, Platform } from 'react-native';
import { useFocusEffect, useLocalSearchParams, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import api from '../../src/api/axios';
import { useAuthStore } from '../../src/store/authStore';
import { colors } from '../../src/constants/colors';
import Avatar from '../../src/components/Avatar';
import PostCard from '../../src/components/PostCard';
import { timeAgo } from '../../src/utils/timeAgo';

export default function PostDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const { user } = useAuthStore();
  const [post, setPost] = useState<any>(null);
  const [comments, setComments] = useState<any[]>([]);
  const [text, setText] = useState('');
  const [sending, setSending] = useState(false);

  const load = useCallback(async () => {
    const { data } = await api.get(`/posts/${id}`);
    setPost(data.post);
    const { data: commentsData } = await api.get(`/posts/${id}/comments`);
    setComments(commentsData.comments);
  }, [id]);

  useFocusEffect(useCallback(() => { load(); }, [load]));

  const toggleLike = async (postId: string) => {
    setPost((p: any) => ({ ...p, liked: !p.liked, likesCount: p.likesCount + (p.liked ? -1 : 1) }));
    try { await api.post(`/posts/${postId}/like`); } catch { load(); }
  };

  const sendComment = async () => {
    if (!text.trim()) return;
    setSending(true);
    try {
      const { data } = await api.post(`/posts/${id}/comments`, { text });
      setComments((c) => [...c, data.comment]);
      setText('');
    } catch {}
    setSending(false);
  };

  if (!post) return null;

  return (
    <KeyboardAvoidingView style={{ flex: 1, backgroundColor: colors.bg }} behavior={Platform.OS === 'ios' ? 'padding' : undefined} keyboardVerticalOffset={90}>
      <FlatList
        data={comments}
        keyExtractor={(c) => c._id}
        contentContainerStyle={{ padding: 16 }}
        ListHeaderComponent={
          <View style={{ marginBottom: 8 }}>
            <PostCard post={post} onLike={toggleLike} onOpen={() => {}} onOpenUser={(uid) => router.push(`/user/${uid}`)} />
            <Text style={styles.commentsTitle}>Comentários</Text>
          </View>
        }
        renderItem={({ item }) => (
          <View style={styles.commentRow}>
            <Avatar name={item.user?.name} uri={item.user?.avatar} size={32} />
            <View style={{ flex: 1, marginLeft: 10 }}>
              <View style={styles.commentBubble}>
                <Text style={styles.commentName}>{item.user?.name}</Text>
                <Text style={styles.commentText}>{item.text}</Text>
              </View>
              <Text style={styles.commentTime}>{timeAgo(item.createdAt)}</Text>
            </View>
          </View>
        )}
        ListEmptyComponent={<Text style={{ color: colors.textLight, fontSize: 13, marginTop: 4 }}>Seja o primeiro a comentar.</Text>}
      />
      <View style={styles.inputBar}>
        <Avatar name={user?.name} uri={user?.avatar} size={32} />
        <TextInput
          style={styles.input}
          placeholder="Escreva um comentário..."
          placeholderTextColor={colors.textLight}
          value={text}
          onChangeText={setText}
        />
        <TouchableOpacity onPress={sendComment} disabled={sending || !text.trim()}>
          <Ionicons name="send" size={20} color={text.trim() ? colors.primary : colors.textLight} />
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  commentsTitle: { fontSize: 14, fontFamily: 'PlusJakartaSans_700Bold', color: colors.text, marginTop: 4, marginBottom: 8 },
  commentRow: { flexDirection: 'row', marginBottom: 14 },
  commentBubble: { backgroundColor: colors.surface, borderRadius: 14, padding: 10 },
  commentName: { fontSize: 12.5, fontWeight: '700', color: colors.text, marginBottom: 2 },
  commentText: { fontSize: 13.5, color: colors.text, lineHeight: 18 },
  commentTime: { fontSize: 10.5, color: colors.textLight, marginTop: 4, marginLeft: 4 },
  inputBar: { flexDirection: 'row', alignItems: 'center', gap: 10, padding: 12, borderTopWidth: 1, borderTopColor: colors.border, backgroundColor: colors.surface },
  input: { flex: 1, backgroundColor: colors.surface2, borderRadius: 20, paddingHorizontal: 14, paddingVertical: 9, color: colors.text, fontSize: 13.5 },
});
