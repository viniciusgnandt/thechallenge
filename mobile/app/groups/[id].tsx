import { useCallback, useState } from 'react';
import { View, Text, FlatList, StyleSheet, TouchableOpacity } from 'react-native';
import { useFocusEffect, useLocalSearchParams, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import Toast from 'react-native-toast-message';
import api from '../../src/api/axios';
import { colors, shadow } from '../../src/constants/colors';
import Avatar from '../../src/components/Avatar';

export default function GroupDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const [group, setGroup] = useState<any>(null);
  const [ranking, setRanking] = useState<any[]>([]);

  const load = useCallback(() => {
    api.get(`/groups/${id}`).then(({ data }) => { setGroup(data.group); setRanking(data.ranking); }).catch(() => {});
  }, [id]);

  useFocusEffect(useCallback(() => { load(); }, [load]));

  const leave = async () => {
    try {
      await api.post(`/groups/${id}/leave`);
      Toast.show({ type: 'success', text1: 'Você saiu do grupo' });
      router.back();
    } catch (err: any) {
      Toast.show({ type: 'error', text1: err.response?.data?.error || 'Erro' });
    }
  };

  if (!group) return null;

  return (
    <FlatList
      style={{ backgroundColor: colors.bg }}
      data={ranking}
      keyExtractor={(r) => r.user._id}
      contentContainerStyle={{ padding: 16 }}
      ListHeaderComponent={
        <View style={styles.card}>
          <Text style={styles.groupName}>{group.name}</Text>
          <Text style={styles.groupCode}>Código para convidar: <Text style={{ fontWeight: '800', color: colors.primary }}>{group.code}</Text></Text>
          <TouchableOpacity style={styles.leaveBtn} onPress={leave}>
            <Ionicons name="exit-outline" size={14} color={colors.danger} />
            <Text style={styles.leaveBtnText}>Sair do grupo</Text>
          </TouchableOpacity>
        </View>
      }
      renderItem={({ item, index }) => (
        <View style={styles.row}>
          <Text style={styles.pos}>{index + 1}º</Text>
          <Avatar name={item.user?.name} uri={item.user?.avatar} size={38} />
          <View style={{ flex: 1, marginLeft: 10 }}>
            <Text style={styles.name}>{item.user?.name}</Text>
            <Text style={styles.meta}>{item.medals} medalha(s)</Text>
          </View>
          <Text style={styles.days}>{item.totalDays}d</Text>
        </View>
      )}
    />
  );
}

const styles = StyleSheet.create({
  card: { backgroundColor: colors.surface, borderRadius: 16, padding: 18, marginBottom: 16, ...shadow.sm },
  groupName: { fontSize: 18, fontFamily: 'Fraunces_600SemiBold', color: colors.text },
  groupCode: { color: colors.textMuted, fontSize: 13, marginTop: 6 },
  leaveBtn: { flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: 14, alignSelf: 'flex-start' },
  leaveBtnText: { color: colors.danger, fontWeight: '700', fontSize: 12.5 },
  row: { flexDirection: 'row', alignItems: 'center', backgroundColor: colors.surface, borderRadius: 14, padding: 12, marginBottom: 8, ...shadow.sm },
  pos: { width: 28, fontWeight: '800', color: colors.textMuted, fontSize: 13 },
  name: { color: colors.text, fontWeight: '700', fontSize: 13.5 },
  meta: { color: colors.textMuted, fontSize: 11, marginTop: 2 },
  days: { color: colors.primary, fontWeight: '800', fontSize: 13 },
});
