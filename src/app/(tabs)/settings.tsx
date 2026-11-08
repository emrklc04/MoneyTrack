import { Ionicons } from '@expo/vector-icons';
import { useState } from 'react';
import { Alert, Pressable, StyleSheet, View } from 'react-native';

import { Card } from '@/components/ui';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { useAppContext } from '@/context/AppContext';
import { useTheme } from '@/hooks/use-theme';
import { SUPPORTED_CURRENCIES } from '@/services/currencyService';

export default function SettingsScreen() {
  const { homeCurrency, setHomeCurrency, transactions, budgets } = useAppContext();
  const theme = useTheme();
  const [changing, setChanging] = useState(false);
  async function changeCurrency(code: string) {
    if (changing || code === homeCurrency) return;
    setChanging(true);
    try {
      await setHomeCurrency(code);
      Alert.alert('Hauptwährung geändert', 'Bestehende Transaktionen und Budgets wurden umgerechnet. Bei Verbindungsproblemen werden gespeicherte Kurse verwendet.');
    } catch {
      Alert.alert('Währungswechsel fehlgeschlagen', 'Bitte prüfe deine Verbindung. Ohne verfügbare Kurse bleiben Währung und Beträge unverändert.');
    } finally { setChanging(false); }
  }

  return (
    <ThemedView style={{ flex: 1, padding: 24, gap: 16 }}>
      <ThemedText type="title">Einstellungen</ThemedText>
      <Card style={{ gap: 12 }}>
        <View style={s.row}>
          <Ionicons name="cash" size={20} color="#208AEF" />
          <ThemedText type="smallBold">Heimatwährung</ThemedText>
        </View>
        <View style={[s.row, { flexWrap: 'wrap' }]}>
          {SUPPORTED_CURRENCIES.map((code) => (
            <Pressable
              key={code}
              disabled={changing}
              onPress={() => changeCurrency(code)}
              style={[s.chip, { backgroundColor: homeCurrency === code ? '#2563eb' : theme.background }]}
            >
              <ThemedText style={homeCurrency === code ? { color: '#fff' } : undefined}>{code}</ThemedText>
            </Pressable>
          ))}
        </View>
        {changing ? <ThemedText>Währung und Beträge werden umgerechnet…</ThemedText> : null}
      </Card>
      <View style={s.row}>
        {([['swap-horizontal', '#208AEF', transactions.length, 'Transaktionen'], ['wallet', '#17C964', budgets.length, 'Budgets']] as const).map(
          ([icon, color, count, label]) => (
            <Card key={label} style={{ flex: 1, alignItems: 'center' }}>
              <Ionicons name={icon} size={24} color={color} />
              <ThemedText type="subtitle">{count}</ThemedText>
              <ThemedText type="small" themeColor="textSecondary">{label}</ThemedText>
            </Card>
          ),
        )}
      </View>
      <View style={[s.row, { alignItems: 'flex-start' }]}>
        <Ionicons name="shield-checkmark" size={20} color="#17C964" />
        <ThemedText type="small" themeColor="textSecondary" style={{ flex: 1 }}>
          Alle Daten werden auf diesem Gerät gespeichert und funktionieren auch ohne Internet. Nur neue Wechselkurse
          benötigen eine Verbindung; zuletzt geladene Kurse werden zwischengespeichert.
        </ThemedText>
      </View>
    </ThemedView>
  );
}

const s = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  chip: { paddingHorizontal: 14, paddingVertical: 10, borderRadius: 18 },
});
