import { StyleSheet } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';

export default function TransactionsScreen() {
  return (
    <ThemedView style={styles.container}>
      <ThemedText type="title">Transaktionen</ThemedText>
      <ThemedText>Liste aller Transaktionen mit Filter nach Zeitraum und Kategorie</ThemedText>
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
