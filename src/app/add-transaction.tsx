import { StyleSheet } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';

export default function AddTransactionScreen() {
  return (
    <ThemedView style={styles.container}>
      <ThemedText type="title">Neue Transaktion</ThemedText>
      <ThemedText>Betrag, Typ, Kategorie, Datum, Beschreibung, Währung und Belegfoto</ThemedText>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
});
