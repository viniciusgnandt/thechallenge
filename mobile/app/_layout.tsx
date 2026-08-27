import { useEffect } from 'react';
import { Stack, useRouter, useSegments } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import Toast from 'react-native-toast-message';
import { useFonts, PlusJakartaSans_400Regular, PlusJakartaSans_500Medium, PlusJakartaSans_700Bold, PlusJakartaSans_800ExtraBold } from '@expo-google-fonts/plus-jakarta-sans';
import { Fraunces_500Medium, Fraunces_600SemiBold, Fraunces_700Bold } from '@expo-google-fonts/fraunces';
import { useAuthStore } from '../src/store/authStore';
import { colors } from '../src/constants/colors';
import { registerForPushNotifications } from '../src/utils/notifications';

export default function RootLayout() {
  const { user, loading, loadUser } = useAuthStore();
  const segments = useSegments();
  const router = useRouter();
  const [fontsLoaded] = useFonts({
    PlusJakartaSans_400Regular,
    PlusJakartaSans_500Medium,
    PlusJakartaSans_700Bold,
    PlusJakartaSans_800ExtraBold,
    Fraunces_500Medium,
    Fraunces_600SemiBold,
    Fraunces_700Bold,
  });

  useEffect(() => { loadUser(); }, []);

  useEffect(() => {
    if (loading) return;
    const inAuthGroup = segments[0] === '(auth)';
    if (!user && !inAuthGroup) router.replace('/(auth)/login');
    else if (user && inAuthGroup) router.replace('/(tabs)');
  }, [user, loading, segments]);

  useEffect(() => {
    if (user) registerForPushNotifications();
  }, [user?._id]);

  if (!fontsLoaded) return null;

  return (
    <>
      <StatusBar style="dark" />
      <Stack screenOptions={{
        headerStyle: { backgroundColor: colors.surface },
        headerTintColor: colors.text,
        headerTitleStyle: { fontFamily: 'PlusJakartaSans_700Bold', fontSize: 16 },
        headerShadowVisible: false,
        contentStyle: { backgroundColor: colors.bg },
      }}>
        <Stack.Screen name="(auth)" options={{ headerShown: false }} />
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        <Stack.Screen name="enrollment/[id]" options={{ title: 'Meu Progresso' }} />
        <Stack.Screen name="enrollment/[id]/certificate" options={{ title: 'Certificado' }} />
        <Stack.Screen name="challenge/[slug]" options={{ title: 'Desafio' }} />
        <Stack.Screen name="challenge/[slug]/ranking" options={{ title: 'Ranking' }} />
        <Stack.Screen name="post/[id]" options={{ title: 'Publicação' }} />
        <Stack.Screen name="user/[id]" options={{ title: 'Perfil' }} />
        <Stack.Screen name="search" options={{ title: 'Buscar' }} />
        <Stack.Screen name="medals" options={{ title: 'Minhas Medalhas' }} />
        <Stack.Screen name="my-challenges" options={{ title: 'Meus Desafios' }} />
        <Stack.Screen name="settings" options={{ title: 'Configurações' }} />
        <Stack.Screen name="subscribe" options={{ title: 'Assinatura' }} />
        <Stack.Screen name="groups/index" options={{ title: 'Grupos' }} />
        <Stack.Screen name="groups/[id]" options={{ title: 'Grupo' }} />
      </Stack>
      <Toast />
    </>
  );
}
