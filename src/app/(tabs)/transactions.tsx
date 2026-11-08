import { ScrollView } from 'react-native';

import { AddTransactionButton, EmptyState, TransactionRow } from '@/components/ui';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { useAppContext } from '@/context/AppContext';

export default function TransactionsScreen() {
  const { transactions } = useAppContext();

  return (
    <ThemedView style={{ flex: 1, padding: 24, gap: 16 }}>
      <ThemedText type="title">Transaktionen</ThemedText>
      {transactions.length === 0 ? (
        <EmptyState size={48} />
      ) : (
        <ScrollView contentContainerStyle={{ gap: 8 }}>
          {[...transactions].reverse().map((t) => <TransactionRow key={t.id} transaction={t} showDate />)}
        </ScrollView>
      )}
      <AddTransactionButton />
    </ThemedView>
  );
}
