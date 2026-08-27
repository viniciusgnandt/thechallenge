import * as ImagePicker from 'expo-image-picker';
import api from '../api/axios';

// Abre a galeria, deixa o usuário escolher/recortar uma imagem e sobe pro backend (OCI).
// Retorna a URL pública ou null se o usuário cancelar.
export async function pickAndUploadImage(options?: { aspect?: [number, number] }): Promise<string | null> {
  const perm = await ImagePicker.requestMediaLibraryPermissionsAsync();
  if (!perm.granted) throw new Error('Permissão de galeria negada');

  const result = await ImagePicker.launchImageLibraryAsync({
    mediaTypes: ImagePicker.MediaTypeOptions.Images,
    allowsEditing: true,
    aspect: options?.aspect || [1, 1],
    quality: 0.8,
  });
  if (result.canceled || !result.assets?.[0]) return null;

  const asset = result.assets[0];
  const formData = new FormData();
  const fileName = asset.uri.split('/').pop() || 'photo.jpg';
  const match = /\.(\w+)$/.exec(fileName);
  const type = match ? `image/${match[1] === 'jpg' ? 'jpeg' : match[1]}` : 'image/jpeg';

  formData.append('image', { uri: asset.uri, name: fileName, type } as any);

  const { data } = await api.post('/upload/image', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
  return data.url;
}
