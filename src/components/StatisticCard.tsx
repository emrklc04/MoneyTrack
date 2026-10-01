import { StyleSheet, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';

interface StatisticCardProps {
  label: string;
  value: string;
}

export function StatisticCard({ label, value }: StatisticCardProps) {
  return (
    <View style={styles.card}>
      <ThemedText type="small">{label}</ThemedText>
      <ThemedText type="subtitle">{value}</ThemedText>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    padding: 16,
    borderRadius: 12,
    backgroundColor: '#F0F0F3',
    gap: 4,
  },
});
