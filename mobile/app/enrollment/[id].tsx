import { useEffect, useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView, TextInput, Modal } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import Toast from 'react-native-toast-message';
import { Ionicons } from '@expo/vector-icons';
import api from '../../src/api/axios';
import { colors, shadow } from '../../src/constants/colors';

export default function EnrollmentProgressScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const [data, setData] = useState<any>(null);
  const [selected, setSelected] = useState<any>(null);
  const [videoUrl, setVideoUrl] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [syncing, setSyncing] = useState(false);

  const load = () => api.get(`/enrollments/${id}/progress`).then(({ data }) => setData(data)).catch(() => {});

  useEffect(() => { load(); }, [id]);

  const handleSync = async () => {
    setSyncing(true);
    try {
      const { data: res } = await api.post(`/strava/sync/${id}`);
      Toast.show({ type: 'success', text1: res.matched.length ? `${res.matched.length} dia(s) validado(s)!` : 'Nenhuma atividade nova.' });
      load();
    } catch (err: any) {
      Toast.show({ type: 'error', text1: err.response?.data?.error || 'Conecte o Strava nas configurações' });
    } finally {
      setSyncing(false);
    }
  };

  const handleSubmit = async () => {
    setSubmitting(true);
    try {
      await api.post('/submissions', { enrollmentId: id, day: selected.task.day, videoUrl });
      Toast.show({ type: 'success', text1: 'Enviado!' });
      setSelected(null);
      setVideoUrl('');
      load();
    } catch (err: any) {
      Toast.show({ type: 'error', text1: err.response?.data?.error || 'Erro ao enviar' });
    } finally {
      setSubmitting(false);
    }
  };

  const handleCheckin = async () => {
    setSubmitting(true);
    try {
      await api.post('/submissions', { enrollmentId: id, day: selected.task.day });
      Toast.show({ type: 'success', text1: 'Dia concluído!' });
      setSelected(null);
      load();
    } catch (err: any) {
      Toast.show({ type: 'error', text1: err.response?.data?.error || 'Erro ao enviar' });
    } finally {
      setSubmitting(false);
    }
  };

  if (!data) return null;
  const { enrollment, days } = data;
  const pct = Math.min(100, Math.round((enrollment.completedDays / days.length) * 100));

  return (
    <View style={{ flex: 1, backgroundColor: colors.bg }}>
      <ScrollView contentContainerStyle={{ padding: 16, paddingBottom: 40 }}>
        <View style={styles.summaryCard}>
          <View style={{ flex: 1 }}>
            <Text style={styles.summaryTitle}>{enrollment.challenge.title}</Text>
            <View style={styles.levelTag}><Text style={styles.levelTagText}>{enrollment.level}</Text></View>
            <Text style={styles.summarySub}>{enrollment.completedDays} de {days.length} dias concluídos</Text>
          </View>
          <Text style={styles.pct}>{pct}%</Text>
        </View>

        {enrollment.status === 'completed' && (
          <TouchableOpacity style={styles.completedCard} onPress={() => router.push(`/enrollment/${id}/certificate`)}>
            <Ionicons name="trophy" size={26} color={colors.gold} />
            <View style={{ flex: 1 }}>
              <Text style={styles.completedTitle}>Desafio concluído! 🎉</Text>
              <Text style={styles.completedSub}>Toque para ver seu certificado</Text>
            </View>
            <Ionicons name="chevron-forward" size={18} color={colors.text} />
          </TouchableOpacity>
        )}

        <TouchableOpacity style={styles.syncButton} onPress={handleSync} disabled={syncing}>
          <Ionicons name="refresh" size={16} color="#fff" />
          <Text style={styles.syncButtonText}>{syncing ? 'Sincronizando...' : 'Sincronizar Strava'}</Text>
        </TouchableOpacity>

        <View style={styles.legend}>
          <LegendDot color={colors.success} label="Aprovado" />
          <LegendDot color={colors.warning} label="Pendente" />
          <LegendDot color={colors.danger} label="Rejeitado" />
        </View>

        <View style={styles.grid}>
          {days.map(({ task, submission }: any) => {
            const status = submission?.status;
            const bg = status === 'approved' ? '#ECFDF5' : status === 'pending' ? '#FFFBEB' : status === 'rejected' ? '#FEF2F2' : colors.surface2;
            const fg = status === 'approved' ? '#059669' : status === 'pending' ? '#B45309' : status === 'rejected' ? '#DC2626' : colors.textLight;
            return (
              <TouchableOpacity key={task.day} style={[styles.dayCell, { backgroundColor: bg }]} onPress={() => setSelected({ task, submission })}>
                <Text style={{ color: fg, fontWeight: '800', fontSize: 12 }}>{task.day}</Text>
              </TouchableOpacity>
            );
          })}
        </View>
      </ScrollView>

      <Modal visible={!!selected} transparent animationType="fade" onRequestClose={() => setSelected(null)}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard}>
            {selected && (
              <>
                <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 10 }}>
                  <Text style={styles.modalTitle}>Dia {selected.task.day}</Text>
                  <TouchableOpacity onPress={() => setSelected(null)}><Ionicons name="close" size={22} color={colors.text} /></TouchableOpacity>
                </View>
                <Text style={styles.modalTaskTitle}>{selected.task.title}</Text>
                <Text style={styles.modalTaskDesc}>{selected.task.description}</Text>

                {selected.submission ? (
                  <Text style={{ color: colors.textMuted, fontWeight: '600' }}>Status: {selected.submission.status}</Text>
                ) : selected.task.validationType === 'strava' ? (
                  <Text style={{ color: colors.textMuted }}>Faça a atividade no Strava e sincronize.</Text>
                ) : selected.task.validationType === 'video_link' ? (
                  <>
                    <TextInput style={styles.input} placeholder="Cole o link do YouTube" placeholderTextColor={colors.textLight}
                      value={videoUrl} onChangeText={setVideoUrl} />
                    <TouchableOpacity style={styles.submitBtn} onPress={handleSubmit} disabled={submitting || !videoUrl}>
                      <Text style={styles.submitBtnText}>{submitting ? 'Enviando...' : 'Enviar prova'}</Text>
                    </TouchableOpacity>
                  </>
                ) : (
                  <TouchableOpacity style={styles.submitBtn} onPress={handleCheckin} disabled={submitting}>
                    <Text style={styles.submitBtnText}>{submitting ? 'Enviando...' : 'Marcar como concluído'}</Text>
                  </TouchableOpacity>
                )}
              </>
            )}
          </View>
        </View>
      </Modal>
    </View>
  );
}

function LegendDot({ color, label }: { color: string; label: string }) {
  return (
    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 5 }}>
      <View style={{ width: 9, height: 9, borderRadius: 3, backgroundColor: color }} />
      <Text style={{ fontSize: 11.5, color: colors.textMuted }}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  summaryCard: { flexDirection: 'row', alignItems: 'center', backgroundColor: colors.surface, borderRadius: 16, padding: 16, marginBottom: 12, ...shadow.sm },
  summaryTitle: { fontSize: 17, fontFamily: 'Fraunces_600SemiBold', color: colors.text },
  levelTag: { alignSelf: 'flex-start', backgroundColor: colors.gradientSoft, borderRadius: 20, paddingHorizontal: 9, paddingVertical: 2, marginTop: 6 },
  levelTagText: { color: colors.primary, fontSize: 10, fontWeight: '800', textTransform: 'uppercase' },
  summarySub: { color: colors.textMuted, fontSize: 12, marginTop: 6 },
  pct: { fontSize: 24, fontFamily: 'PlusJakartaSans_800ExtraBold', color: colors.primary },
  completedCard: { flexDirection: 'row', alignItems: 'center', gap: 12, backgroundColor: '#FFFBEB', borderRadius: 14, padding: 14, marginBottom: 12 },
  completedTitle: { fontWeight: '800', color: colors.text, fontSize: 13.5 },
  completedSub: { color: colors.textMuted, fontSize: 11.5, marginTop: 2 },
  syncButton: { flexDirection: 'row', gap: 8, alignItems: 'center', justifyContent: 'center', backgroundColor: colors.primary, borderRadius: 9999, padding: 13, marginBottom: 16, ...shadow.primary },
  syncButtonText: { color: '#fff', fontWeight: '800', fontSize: 13.5 },
  legend: { flexDirection: 'row', gap: 16, marginBottom: 12 },
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: 7 },
  dayCell: { width: 44, height: 44, borderRadius: 10, alignItems: 'center', justifyContent: 'center' },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(15,15,20,0.55)', alignItems: 'center', justifyContent: 'center', padding: 24 },
  modalCard: { backgroundColor: colors.surface, borderRadius: 20, padding: 22, width: '100%' },
  modalTitle: { fontSize: 17, fontFamily: 'PlusJakartaSans_700Bold', color: colors.text },
  modalTaskTitle: { fontWeight: '700', color: colors.text, marginBottom: 4 },
  modalTaskDesc: { color: colors.textMuted, fontSize: 13, marginBottom: 18, lineHeight: 19 },
  input: { backgroundColor: colors.surface2, borderRadius: 10, padding: 12, color: colors.text, marginBottom: 12 },
  submitBtn: { backgroundColor: colors.primary, borderRadius: 9999, padding: 14, alignItems: 'center' },
  submitBtnText: { color: '#fff', fontWeight: '800' },
});
