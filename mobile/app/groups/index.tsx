import { useCallback, useState } from 'react';
import { View, Text, FlatList, TouchableOpacity, StyleSheet, TextInput, Modal } from 'react-native';
import { useFocusEffect, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import Toast from 'react-native-toast-message';
import api from '../../src/api/axios';
import { colors, shadow } from '../../src/constants/colors';
import EmptyState from '../../src/components/EmptyState';

export default function GroupsScreen() {
  const router = useRouter();
  const [groups, setGroups] = useState<any[] | null>(null);
  const [modal, setModal] = useState<'create' | 'join' | null>(null);
  const [name, setName] = useState('');
  const [code, setCode] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const load = useCallback(() => {
    api.get('/groups/mine').then(({ data }) => setGroups(data.groups)).catch(() => setGroups([]));
  }, []);

  useFocusEffect(useCallback(() => { load(); }, [load]));

  const createGroup = async () => {
    if (!name.trim()) return;
    setSubmitting(true);
    try {
      const { data } = await api.post('/groups', { name });
      Toast.show({ type: 'success', text1: `Grupo criado! Código: ${data.group.code}` });
      setModal(null);
      setName('');
      load();
    } catch (err: any) {
      Toast.show({ type: 'error', text1: err.response?.data?.error || 'Erro' });
    } finally {
      setSubmitting(false);
    }
  };

  const joinGroup = async () => {
    if (!code.trim()) return;
    setSubmitting(true);
    try {
      await api.post('/groups/join', { code });
      Toast.show({ type: 'success', text1: 'Você entrou no grupo!' });
      setModal(null);
      setCode('');
      load();
    } catch (err: any) {
      Toast.show({ type: 'error', text1: err.response?.data?.error || 'Erro' });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <View style={styles.container}>
      <View style={{ flexDirection: 'row', gap: 10, padding: 16 }}>
        <TouchableOpacity style={styles.actionBtn} onPress={() => setModal('create')}>
          <Ionicons name="add-circle-outline" size={16} color="#fff" />
          <Text style={styles.actionBtnText}>Criar grupo</Text>
        </TouchableOpacity>
        <TouchableOpacity style={[styles.actionBtn, styles.actionBtnOutline]} onPress={() => setModal('join')}>
          <Ionicons name="enter-outline" size={16} color={colors.text} />
          <Text style={[styles.actionBtnText, { color: colors.text }]}>Entrar com código</Text>
        </TouchableOpacity>
      </View>

      <FlatList
        data={groups || []}
        keyExtractor={(g) => g._id}
        contentContainerStyle={{ padding: 16, paddingTop: 0 }}
        ListEmptyComponent={groups !== null ? <EmptyState icon="people-outline" title="Você ainda não está em nenhum grupo" subtitle="Crie um grupo ou entre com o código de um amigo" /> : null}
        renderItem={({ item }) => (
          <TouchableOpacity style={styles.card} onPress={() => router.push(`/groups/${item._id}`)}>
            <View style={styles.groupIcon}><Ionicons name="people" size={20} color={colors.primary} /></View>
            <View style={{ flex: 1 }}>
              <Text style={styles.groupName}>{item.name}</Text>
              <Text style={styles.groupMeta}>{item.members.length} membro(s) · código {item.code}</Text>
            </View>
            <Ionicons name="chevron-forward" size={18} color={colors.textLight} />
          </TouchableOpacity>
        )}
      />

      <Modal visible={!!modal} transparent animationType="fade" onRequestClose={() => setModal(null)}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard}>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 16 }}>
              <Text style={styles.modalTitle}>{modal === 'create' ? 'Criar grupo' : 'Entrar em um grupo'}</Text>
              <TouchableOpacity onPress={() => setModal(null)}><Ionicons name="close" size={20} color={colors.text} /></TouchableOpacity>
            </View>
            {modal === 'create' ? (
              <>
                <TextInput style={styles.input} placeholder="Nome do grupo" placeholderTextColor={colors.textLight} value={name} onChangeText={setName} />
                <TouchableOpacity style={styles.submitBtn} onPress={createGroup} disabled={submitting}>
                  <Text style={styles.submitBtnText}>{submitting ? 'Criando...' : 'Criar'}</Text>
                </TouchableOpacity>
              </>
            ) : (
              <>
                <TextInput style={styles.input} placeholder="Código do grupo" placeholderTextColor={colors.textLight}
                  autoCapitalize="characters" value={code} onChangeText={setCode} />
                <TouchableOpacity style={styles.submitBtn} onPress={joinGroup} disabled={submitting}>
                  <Text style={styles.submitBtnText}>{submitting ? 'Entrando...' : 'Entrar'}</Text>
                </TouchableOpacity>
              </>
            )}
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.bg },
  actionBtn: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6, backgroundColor: colors.primary, borderRadius: 9999, paddingVertical: 12, ...shadow.primary },
  actionBtnOutline: { backgroundColor: colors.surface, borderWidth: 1.5, borderColor: colors.border, shadowOpacity: 0 },
  actionBtnText: { color: '#fff', fontWeight: '700', fontSize: 12.5 },
  card: { flexDirection: 'row', alignItems: 'center', gap: 12, backgroundColor: colors.surface, borderRadius: 14, padding: 14, marginBottom: 10, ...shadow.sm },
  groupIcon: { width: 42, height: 42, borderRadius: 21, backgroundColor: colors.gradientSoft, alignItems: 'center', justifyContent: 'center' },
  groupName: { color: colors.text, fontWeight: '700', fontSize: 14.5 },
  groupMeta: { color: colors.textMuted, fontSize: 11.5, marginTop: 2 },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(15,15,20,0.55)', alignItems: 'center', justifyContent: 'center', padding: 24 },
  modalCard: { backgroundColor: colors.surface, borderRadius: 20, padding: 22, width: '100%' },
  modalTitle: { fontSize: 17, fontFamily: 'Fraunces_600SemiBold', color: colors.text },
  input: { backgroundColor: colors.surface2, borderRadius: 10, padding: 13, color: colors.text, marginBottom: 14 },
  submitBtn: { backgroundColor: colors.primary, borderRadius: 9999, padding: 14, alignItems: 'center' },
  submitBtnText: { color: '#fff', fontWeight: '800' },
});
