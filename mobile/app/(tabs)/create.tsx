import { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, KeyboardAvoidingView, Platform, Image } from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import Toast from 'react-native-toast-message';
import api from '../../src/api/axios';
import { useAuthStore } from '../../src/store/authStore';
import { colors, shadow } from '../../src/constants/colors';
import Avatar from '../../src/components/Avatar';
import { pickAndUploadImage } from '../../src/utils/upload';

export default function CreatePostScreen() {
  const router = useRouter();
  const { user } = useAuthStore();
  const [text, setText] = useState('');
  const [videoUrl, setVideoUrl] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [posting, setPosting] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);

  const canPost = !!(text || videoUrl || imageUrl);

  const addPhoto = async () => {
    setUploadingImage(true);
    try {
      const url = await pickAndUploadImage({ aspect: [4, 3] });
      if (url) setImageUrl(url);
    } catch (err: any) {
      Toast.show({ type: 'error', text1: err.message || 'Erro ao enviar foto' });
    } finally {
      setUploadingImage(false);
    }
  };

  const submit = async () => {
    if (!canPost) return;
    setPosting(true);
    try {
      await api.post('/posts', { text, videoUrl: videoUrl || undefined, imageUrl: imageUrl || undefined });
      Toast.show({ type: 'success', text1: 'Publicado!' });
      setText('');
      setVideoUrl('');
      setImageUrl('');
      router.push('/(tabs)');
    } catch (err: any) {
      Toast.show({ type: 'error', text1: err.response?.data?.error || 'Erro ao publicar' });
    } finally {
      setPosting(false);
    }
  };

  return (
    <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <SafeAreaView style={styles.container} edges={['top']}>
        <View style={styles.topBar}>
          <Text style={styles.title}>Nova publicação</Text>
          <TouchableOpacity style={[styles.postBtn, !canPost && { opacity: 0.4 }]} disabled={posting || !canPost} onPress={submit}>
            <Text style={styles.postBtnText}>{posting ? 'Publicando...' : 'Publicar'}</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.composer}>
          <Avatar name={user?.name} uri={user?.avatar} size={44} />
          <TextInput
            style={styles.input}
            placeholder="Como foi seu treino hoje? Compartilhe com a comunidade..."
            placeholderTextColor={colors.textLight}
            multiline
            value={text}
            onChangeText={setText}
            autoFocus
          />
        </View>

        {imageUrl ? (
          <View style={styles.imagePreviewWrap}>
            <Image source={{ uri: imageUrl }} style={styles.imagePreview} />
            <TouchableOpacity style={styles.removeImageBtn} onPress={() => setImageUrl('')}>
              <Ionicons name="close" size={16} color="#fff" />
            </TouchableOpacity>
          </View>
        ) : null}

        <TouchableOpacity style={styles.photoBtn} onPress={addPhoto} disabled={uploadingImage}>
          <Ionicons name="image-outline" size={18} color={colors.primary} />
          <Text style={styles.photoBtnText}>{uploadingImage ? 'Enviando...' : 'Adicionar foto'}</Text>
        </TouchableOpacity>

        <View style={styles.videoRow}>
          <Ionicons name="link-outline" size={18} color={colors.textMuted} />
          <TextInput
            style={styles.videoInput}
            placeholder="Link de vídeo (opcional)"
            placeholderTextColor={colors.textLight}
            value={videoUrl}
            onChangeText={setVideoUrl}
            autoCapitalize="none"
          />
        </View>

        <Text style={styles.hint}>
          Dica: para validar um dia do seu desafio, use a tela de progresso do desafio — este espaço é para posts livres no feed.
        </Text>
      </SafeAreaView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.bg },
  topBar: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 16, borderBottomWidth: 1, borderBottomColor: colors.border },
  title: { fontSize: 17, fontFamily: 'PlusJakartaSans_700Bold', color: colors.text },
  postBtn: { backgroundColor: colors.primary, borderRadius: 9999, paddingHorizontal: 18, paddingVertical: 9, ...shadow.primary },
  postBtnText: { color: '#fff', fontWeight: '800', fontSize: 13.5 },
  composer: { flexDirection: 'row', gap: 12, padding: 16 },
  input: { flex: 1, color: colors.text, fontSize: 15.5, minHeight: 100, textAlignVertical: 'top', paddingTop: 8 },
  imagePreviewWrap: { marginHorizontal: 16, marginBottom: 12, position: 'relative' },
  imagePreview: { width: '100%', height: 180, borderRadius: 14 },
  removeImageBtn: { position: 'absolute', top: 8, right: 8, width: 26, height: 26, borderRadius: 13, backgroundColor: 'rgba(0,0,0,0.55)', alignItems: 'center', justifyContent: 'center' },
  photoBtn: { flexDirection: 'row', alignItems: 'center', gap: 8, marginHorizontal: 16, marginBottom: 12, alignSelf: 'flex-start' },
  photoBtnText: { color: colors.primary, fontWeight: '700', fontSize: 13.5 },
  videoRow: { flexDirection: 'row', alignItems: 'center', gap: 10, marginHorizontal: 16, backgroundColor: colors.surface2, borderRadius: 12, paddingHorizontal: 14 },
  videoInput: { flex: 1, color: colors.text, fontSize: 14, paddingVertical: 12 },
  hint: { color: colors.textLight, fontSize: 12, margin: 16, lineHeight: 17 },
});
