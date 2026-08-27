import { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { useLocalSearchParams } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import api from '../../../src/api/axios';
import { useAuthStore } from '../../../src/store/authStore';
import { colors, shadow } from '../../../src/constants/colors';

const LEVEL_LABEL: Record<string, string> = { basico: 'Básico', intermediario: 'Intermediário', avancado: 'Avançado' };

export default function CertificateScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { user } = useAuthStore();
  const [enrollment, setEnrollment] = useState<any>(null);

  useEffect(() => {
    api.get(`/enrollments/${id}/progress`).then(({ data }) => setEnrollment(data.enrollment)).catch(() => {});
  }, [id]);

  if (!enrollment) return null;
  const date = new Date(enrollment.completedAt).toLocaleDateString('pt-BR', { day: '2-digit', month: 'long', year: 'numeric' });

  return (
    <ScrollView style={{ flex: 1, backgroundColor: colors.bg }} contentContainerStyle={{ padding: 20 }}>
      <View style={styles.headerIcon}>
        <LinearGradient colors={['#FDE68A', '#F59E0B']} style={styles.medalCircle}>
          <Ionicons name="trophy" size={30} color="#78350F" />
        </LinearGradient>
      </View>
      <Text style={styles.title}>Parabéns pela conquista!</Text>
      <Text style={styles.subtitle}>Você concluiu o desafio de {enrollment.challenge.durationDays} dias.</Text>

      <View style={styles.certificate}>
        <View style={styles.certBorder}>
          <Text style={styles.certLabel}>CERTIFICADO DE CONCLUSÃO</Text>
          <Text style={styles.certName}>{user?.name}</Text>
          <Text style={styles.certText}>
            concluiu com sucesso o <Text style={styles.bold}>{enrollment.challenge.title}</Text>, nível{' '}
            <Text style={styles.bold}>{LEVEL_LABEL[enrollment.level]}</Text>, completando {enrollment.challenge.durationDays} dias
            consecutivos de desafios de atividade física.
          </Text>
          <Text style={styles.certDate}>Concluído em {date}</Text>
          <View style={styles.certFooter}>
            <Text style={styles.certFooterText}>TheChallenge</Text>
            <Text style={styles.certFooterText}>ID: {String(enrollment._id).slice(-8).toUpperCase()}</Text>
          </View>
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  headerIcon: { alignItems: 'center', marginTop: 10 },
  medalCircle: { width: 64, height: 64, borderRadius: 32, alignItems: 'center', justifyContent: 'center' },
  title: { textAlign: 'center', fontSize: 19, fontFamily: 'Fraunces_600SemiBold', color: colors.text, marginTop: 14 },
  subtitle: { textAlign: 'center', color: colors.textMuted, fontSize: 13, marginTop: 4, marginBottom: 24 },
  certificate: { backgroundColor: colors.surface, borderRadius: 20, padding: 6, ...shadow.md },
  certBorder: { borderWidth: 2, borderColor: colors.primary, borderRadius: 16, padding: 26, alignItems: 'center', backgroundColor: colors.gradientSoft },
  certLabel: { fontSize: 10.5, letterSpacing: 2, color: colors.textLight, fontWeight: '800' },
  certName: { fontSize: 24, fontFamily: 'Fraunces_700Bold', color: colors.text, marginTop: 10, marginBottom: 12, textAlign: 'center' },
  certText: { fontSize: 13, color: colors.textMuted, textAlign: 'center', lineHeight: 19, marginBottom: 14 },
  bold: { fontWeight: '800', color: colors.text },
  certDate: { fontSize: 12, color: colors.textLight },
  certFooter: { flexDirection: 'row', justifyContent: 'space-between', width: '100%', marginTop: 20, paddingTop: 14, borderTopWidth: 1, borderTopColor: colors.borderStrong, borderStyle: 'dashed' as any },
  certFooterText: { fontSize: 11, color: colors.textLight },
});
