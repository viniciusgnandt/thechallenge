import { useEffect, useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView } from 'react-native';
import * as Clipboard from 'expo-clipboard';
import { Ionicons } from '@expo/vector-icons';
import Toast from 'react-native-toast-message';
import api from '../src/api/axios';
import { colors, shadow } from '../src/constants/colors';

const BENEFITS = [
  'Acesso a todos os desafios (100 dias, 30 dias, força, pedal...)',
  'Todos os níveis: básico, intermediário e avançado',
  'Validação automática via Strava',
  'Medalha + certificado a cada desafio concluído',
];

export default function SubscribeScreen() {
  const [plan, setPlan] = useState<any>(null);

  useEffect(() => {
    api.get('/subscription/plan').then(({ data }) => setPlan(data.plan)).catch(() => {});
  }, []);

  const copyPixKey = async () => {
    await Clipboard.setStringAsync('pix@thechallenge.app');
    Toast.show({ type: 'success', text1: 'Chave Pix copiada' });
  };

  if (!plan) return null;

  return (
    <ScrollView style={styles.container} contentContainerStyle={{ padding: 20 }}>
      <View style={{ alignItems: 'center', marginBottom: 24 }}>
        <View style={styles.iconWrap}><Ionicons name="flame" size={26} color={colors.primary} /></View>
        <Text style={styles.title}>Assine o TheChallenge</Text>
        <Text style={styles.subtitle}>Uma assinatura única dá acesso a todos os desafios da plataforma.</Text>
      </View>

      <View style={styles.card}>
        <View style={{ flexDirection: 'row', justifyContent: 'space-around', marginBottom: 20 }}>
          <View style={{ alignItems: 'center' }}>
            <Text style={styles.priceLabel}>À vista</Text>
            <Text style={styles.price}>R$ {plan.priceOneTime}</Text>
          </View>
          <View style={{ alignItems: 'center' }}>
            <Text style={styles.priceLabel}>Parcelado</Text>
            <Text style={styles.price}>{plan.installments.count}x R$ {plan.installments.value}</Text>
          </View>
        </View>

        <View style={{ gap: 10, marginBottom: 20 }}>
          {BENEFITS.map((b) => (
            <View key={b} style={{ flexDirection: 'row', gap: 10, alignItems: 'center' }}>
              <Ionicons name="checkmark-circle" size={18} color={colors.primary} />
              <Text style={styles.benefitText}>{b}</Text>
            </View>
          ))}
        </View>

        <View style={styles.pixBox}>
          <Text style={styles.pixTitle}>Como assinar</Text>
          <Text style={styles.pixText}>
            Faça o Pix (à vista ou combine o parcelamento) e envie o comprovante para nossa equipe.
            Sua assinatura é ativada manualmente em até algumas horas.
          </Text>
          <TouchableOpacity style={styles.pixBtn} onPress={copyPixKey}>
            <Ionicons name="copy-outline" size={14} color={colors.text} />
            <Text style={styles.pixBtnText}>pix@thechallenge.app</Text>
          </TouchableOpacity>
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.bg },
  iconWrap: { width: 56, height: 56, borderRadius: 28, backgroundColor: colors.gradientSoft, alignItems: 'center', justifyContent: 'center', marginBottom: 12 },
  title: { fontSize: 20, fontFamily: 'Fraunces_600SemiBold', color: colors.text, textAlign: 'center' },
  subtitle: { color: colors.textMuted, fontSize: 13, textAlign: 'center', marginTop: 6, paddingHorizontal: 20 },
  card: { backgroundColor: colors.surface, borderRadius: 20, padding: 20, ...shadow.sm },
  priceLabel: { color: colors.textMuted, fontSize: 12 },
  price: { fontSize: 24, fontFamily: 'PlusJakartaSans_800ExtraBold', color: colors.text, marginTop: 2 },
  benefitText: { flex: 1, color: colors.text, fontSize: 13 },
  pixBox: { backgroundColor: colors.gradientSoft, borderRadius: 14, padding: 16 },
  pixTitle: { fontWeight: '800', color: colors.text, marginBottom: 8 },
  pixText: { color: colors.textMuted, fontSize: 12.5, lineHeight: 18, marginBottom: 12 },
  pixBtn: { flexDirection: 'row', gap: 8, alignItems: 'center', alignSelf: 'flex-start', borderWidth: 1.5, borderColor: colors.borderStrong, borderRadius: 9999, paddingHorizontal: 14, paddingVertical: 9 },
  pixBtnText: { color: colors.text, fontWeight: '700', fontSize: 12.5 },
});
