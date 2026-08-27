import { useState } from 'react';
import { View, TextInput, FlatList, TouchableOpacity, Text, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import api from '../src/api/axios';
import { colors } from '../src/constants/colors';
import Avatar from '../src/components/Avatar';
import EmptyState from '../src/components/EmptyState';

export default function SearchScreen() {
  const router = useRouter();
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<any[]>([]);
  const [searched, setSearched] = useState(false);

  const search = async (q: string) => {
    setQuery(q);
    if (q.length < 2) { setResults([]); setSearched(false); return; }
    setSearched(true);
    try {
      const { data } = await api.get('/users/search', { params: { q } });
      setResults(data.users);
    } catch {}
  };

  return (
    <View style={styles.container}>
      <View style={styles.inputWrap}>
        <Ionicons name="search" size={18} color={colors.textLight} />
        <TextInput
          style={styles.input}
          placeholder="Buscar atletas..."
          placeholderTextColor={colors.textLight}
          value={query}
          onChangeText={search}
          autoFocus
        />
      </View>

      <FlatList
        data={results}
        keyExtractor={(u) => u._id}
        contentContainerStyle={{ padding: 16 }}
        ListEmptyComponent={searched ? <EmptyState icon="person-outline" title="Nenhum atleta encontrado" /> : null}
        renderItem={({ item }) => (
          <TouchableOpacity style={styles.row} onPress={() => router.push(`/user/${item._id}`)}>
            <Avatar name={item.name} uri={item.avatar} size={44} />
            <View style={{ marginLeft: 12 }}>
              <Text style={styles.name}>{item.name}</Text>
              {item.city ? <Text style={styles.city}>{item.city}</Text> : null}
            </View>
          </TouchableOpacity>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.bg },
  inputWrap: { flexDirection: 'row', alignItems: 'center', gap: 10, backgroundColor: colors.surface, margin: 16, borderRadius: 14, paddingHorizontal: 14, borderWidth: 1, borderColor: colors.border },
  input: { flex: 1, color: colors.text, fontSize: 15, paddingVertical: 12 },
  row: { flexDirection: 'row', alignItems: 'center', backgroundColor: colors.surface, borderRadius: 14, padding: 12, marginBottom: 8 },
  name: { color: colors.text, fontWeight: '700', fontSize: 14.5 },
  city: { color: colors.textMuted, fontSize: 12, marginTop: 2 },
});
