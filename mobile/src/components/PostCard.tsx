import { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Image, Alert, Share } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import Toast from 'react-native-toast-message';
import Avatar from './Avatar';
import { colors } from '../constants/colors';
import { timeAgo } from '../utils/timeAgo';
import api from '../api/axios';
import { useAuthStore } from '../store/authStore';

const TYPE_META: Record<string, { icon: any; label: (p: any) => string; color: string }> = {
  checkin: { icon: 'checkmark-circle', label: (p) => `Concluiu o dia ${p.day}`, color: colors.success },
  medal: { icon: 'trophy', label: () => 'Concluiu o desafio!', color: colors.gold },
  free: { icon: 'chatbubble-ellipses', label: () => '', color: colors.primary },
};

export default function PostCard({ post, onLike, onOpen, onOpenUser, onRemoved }: {
  post: any;
  onLike: (id: string) => void;
  onOpen: (id: string) => void;
  onOpenUser?: (id: string) => void;
  onRemoved?: (id: string) => void;
}) {
  const router = useRouter();
  const { user } = useAuthStore();
  const meta = TYPE_META[post.type] || TYPE_META.free;
  const isMine = String(post.user?._id) === String(user?._id);

  const share = async () => {
    try {
      await Share.share({ message: post.text || 'Confira minha conquista no TheChallenge! 🔥' });
    } catch {}
  };

  const report = () => {
    Alert.prompt?.(
      'Denunciar publicação',
      'Descreva o motivo da denúncia',
      async (reason?: string) => {
        if (!reason) return;
        try {
          await api.post(`/posts/${post._id}/report`, { reason });
          Toast.show({ type: 'success', text1: 'Denúncia enviada' });
        } catch (err: any) {
          Toast.show({ type: 'error', text1: err.response?.data?.error || 'Erro' });
        }
      }
    ) ?? Alert.alert('Denunciar', 'Recurso disponível apenas no iOS por enquanto.');
  };

  const remove = () => {
    Alert.alert('Excluir publicação', 'Tem certeza?', [
      { text: 'Cancelar', style: 'cancel' },
      { text: 'Excluir', style: 'destructive', onPress: async () => {
        try {
          await api.delete(`/posts/${post._id}`);
          onRemoved?.(post._id);
        } catch (err: any) {
          Toast.show({ type: 'error', text1: err.response?.data?.error || 'Erro' });
        }
      } },
    ]);
  };

  const openMenu = () => {
    const options = isMine ? ['Excluir', 'Cancelar'] : ['Denunciar', 'Cancelar'];
    Alert.alert('Opções', undefined, [
      ...(isMine
        ? [{ text: 'Excluir', style: 'destructive' as const, onPress: remove }]
        : [{ text: 'Denunciar', style: 'destructive' as const, onPress: report }]),
      { text: 'Cancelar', style: 'cancel' as const },
    ]);
  };

  return (
    <View style={styles.card}>
      <View style={styles.header}>
        <TouchableOpacity style={{ flexDirection: 'row', alignItems: 'center', flex: 1 }} onPress={() => (onOpenUser ? onOpenUser(post.user._id) : router.push(`/user/${post.user._id}`))}>
          <Avatar name={post.user?.name} uri={post.user?.avatar} size={42} />
          <View style={{ flex: 1, marginLeft: 10 }}>
            <Text style={styles.name}>{post.user?.name}</Text>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
              {post.type !== 'free' && <Ionicons name={meta.icon} size={12} color={meta.color} />}
              <Text style={styles.meta}>
                {post.type !== 'free' ? meta.label(post) + ' · ' : ''}{timeAgo(post.createdAt)}
              </Text>
            </View>
          </View>
        </TouchableOpacity>
        {post.challenge && (
          <View style={styles.challengePill}>
            <Text style={styles.challengePillText} numberOfLines={1}>{post.challenge.title}</Text>
          </View>
        )}
        <TouchableOpacity onPress={openMenu} style={{ padding: 4 }}>
          <Ionicons name="ellipsis-horizontal" size={16} color={colors.textLight} />
        </TouchableOpacity>
      </View>

      {post.text ? <Text style={styles.text}>{post.text}</Text> : null}

      {post.imageUrl ? (
        <Image source={{ uri: post.imageUrl }} style={styles.image} />
      ) : null}

      {post.videoUrl ? (
        <View style={styles.mediaChip}>
          <Ionicons name="play-circle" size={16} color={colors.primary} />
          <Text style={styles.mediaChipText} numberOfLines={1}>{post.videoUrl}</Text>
        </View>
      ) : null}

      <View style={styles.actions}>
        <TouchableOpacity style={styles.actionBtn} onPress={() => onLike(post._id)}>
          <Ionicons name={post.liked ? 'heart' : 'heart-outline'} size={20} color={post.liked ? colors.primary : colors.textMuted} />
          <Text style={[styles.actionText, post.liked && { color: colors.primary }]}>{post.likesCount || 0}</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.actionBtn} onPress={() => onOpen(post._id)}>
          <Ionicons name="chatbubble-outline" size={18} color={colors.textMuted} />
          <Text style={styles.actionText}>{post.commentsCount || 0}</Text>
        </TouchableOpacity>
        {post.type === 'medal' && (
          <TouchableOpacity style={styles.actionBtn} onPress={share}>
            <Ionicons name="share-outline" size={18} color={colors.textMuted} />
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: { backgroundColor: colors.surface, borderRadius: 16, padding: 16, marginBottom: 12, borderWidth: 1, borderColor: colors.border },
  header: { flexDirection: 'row', alignItems: 'center' },
  name: { color: colors.text, fontWeight: '700', fontSize: 14.5 },
  meta: { color: colors.textLight, fontSize: 12, marginTop: 2 },
  challengePill: { backgroundColor: colors.gradientSoft, borderRadius: 20, paddingHorizontal: 10, paddingVertical: 4, maxWidth: 110, marginRight: 6 },
  challengePillText: { color: colors.primary, fontSize: 10.5, fontWeight: '700' },
  text: { color: colors.text, fontSize: 14, marginTop: 12, lineHeight: 20 },
  image: { width: '100%', height: 200, borderRadius: 12, marginTop: 10 },
  mediaChip: { flexDirection: 'row', alignItems: 'center', gap: 6, backgroundColor: colors.surface2, borderRadius: 10, padding: 10, marginTop: 10 },
  mediaChipText: { color: colors.textMuted, fontSize: 12, flex: 1 },
  actions: { flexDirection: 'row', gap: 20, marginTop: 14, paddingTop: 12, borderTopWidth: 1, borderTopColor: colors.border },
  actionBtn: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  actionText: { color: colors.textMuted, fontSize: 13, fontWeight: '600' },
});
