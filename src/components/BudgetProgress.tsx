import { StyleSheet, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';

interface BudgetProgressProps {
  categoryName: string;
  spent: number;
  limit: number;
}

export function BudgetProgress({ categoryName, spent, limit }: BudgetProgressProps) {
  const progress = limit > 0 ? Math.min(spent / limit, 1) : 0;

  return (
    <View style={styles.container}>
      <ThemedText>{categoryName}</ThemedText>
      <View style={styles.track}>
        <View style={[styles.fill, { width: `${progress * 100}%` }]} />
      </View>
      <ThemedText type="small">
        {spent} / {limit}
      </ThemedText>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: 4,
    paddingVertical: 8,
  },
  track: {
    height: 8,
    borderRadius: 4,
    backgroundColor: '#E0E1E6',
    overflow: 'hidden',
  },
  fill: {
    height: '100%',
    backgroundColor: '#3c87f7',
  },
});
