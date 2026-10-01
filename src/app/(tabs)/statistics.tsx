import { StyleSheet } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';

export default function StatisticsScreen() {
  return (
    <ThemedView style={styles.container}>
      <ThemedText type="title">Statistiken</ThemedText>
      <ThemedText>Einnahmen/Ausgaben, Kategorien-, Monats- und Jahresauswertung</ThemedText>
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
