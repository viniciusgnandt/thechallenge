import { useCallback, useState } from 'react';
import { View, Text, FlatList, TouchableOpacity, StyleSheet } from 'react-native';
import { useFocusEffect, useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import api from '../../src/api/axios';
import { colors } from '../../src/constants/colors';
import Avatar from '../../src/components/Avatar';
import EmptyState from '../../src/components/EmptyState';
import { timeAgo } from '../../src/utils/timeAgo';

const ICON: Record<string, any> = { like: 'heart', comment: 'chatbubble', follow: 'person-add' };

export default function NotificationsScreen() {
  const router = useRouter();
  const [items, setItems] = useState<any[] | null>(null);

  useFocusEffect(useCallback(() => {
    api.get('/notifications').then(({ data }) => setItems(data.notifications)).catch(() => setItems([]));
    api.post('/notifications/read-all').catch(() => {});
  }, []));

  const text = (n: any) => {
    if (n.type === 'like') return 'curtiu sua publicação';
    if (n.type === 'comment') return 'comentou na sua publicação';
    return 'começou a te seguir';
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.topBar}>
        <Text style={styles.title}>Notificações</Text>
      </View>

      <FlatList
        data={items || []}
        keyExtractor={(n) => n._id}
        contentContainerStyle={{ padding: 16, paddingBottom: 40 }}
        ListEmptyComponent={items !== null ? <EmptyState icon="notifications-outline" title="Nenhuma notificação ainda" /> : null}
        renderItem={({ item }) => (
          <TouchableOpacity
            style={[styles.row, !item.read && styles.unread]}
            onPress={() => item.post ? router.push(`/post/${item.post._id}`) : router.push(`/user/${item.fromUser._id}`)}
          >
            <Avatar name={item.fromUser?.name} uri={item.fromUser?.avatar} size={42} />
            <View style={{ flex: 1, marginLeft: 12 }}>
              <Text style={styles.text}>
                <Text style={styles.name}>{item.fromUser?.name}</Text> {text(item)}
              </Text>
              <Text style={styles.time}>{timeAgo(item.createdAt)}</Text>
            </View>
            <Ionicons name={ICON[item.type]} size={16} color={colors.primary} />
          </TouchableOpacity>
        )}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.bg },
  topBar: { paddingHorizontal: 20, paddingTop: 8, paddingBottom: 12 },
  title: { fontSize: 22, fontFamily: 'PlusJakartaSans_800ExtraBold', color: colors.text },
  row: { flexDirection: 'row', alignItems: 'center', backgroundColor: colors.surface, borderRadius: 14, padding: 14, marginBottom: 10 },
  unread: { backgroundColor: colors.gradientSoft },
  text: { color: colors.text, fontSize: 13.5, lineHeight: 19 },
  name: { fontWeight: '700' },
  time: { color: colors.textLight, fontSize: 11.5, marginTop: 3 },
});
