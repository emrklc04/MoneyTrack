import { StyleSheet } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';

export default function BudgetsScreen() {
  return (
    <ThemedView style={styles.container}>
      <ThemedText type="title">Budgets</ThemedText>
      <ThemedText>Budgetgrenze, aktuelle Ausgaben und Fortschritt je Kategorie</ThemedText>
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
