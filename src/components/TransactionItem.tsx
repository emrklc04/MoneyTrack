import { StyleSheet, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import type { Transaction } from '@/models/Transaction';

interface TransactionItemProps {
  transaction: Transaction;
}

export function TransactionItem({ transaction }: TransactionItemProps) {
  return (
    <View style={styles.row}>
      <ThemedText>{transaction.description}</ThemedText>
      <ThemedText style={transaction.type === 'income' ? styles.income : undefined}>
        {transaction.amount} {transaction.currency}
      </ThemedText>
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 8,
  },
  income: {
    color: '#2e7d32',
  },
});
