import { Ionicons } from '@expo/vector-icons';
import { ScrollView, StyleSheet, View } from 'react-native';

import { AddTransactionButton, EmptyState, IncomeExpenseCards, TransactionRow } from '@/components/ui';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { useAppContext } from '@/context/AppContext';
import { calculateTotals } from '@/utils/finance';
import { formatCurrency } from '@/utils/formatCurrency';

export default function DashboardScreen() {
  const { transactions, homeCurrency } = useAppContext();
  const { income, expenses, balance } = calculateTotals(transactions, homeCurrency);

  return (
    <ThemedView style={{ flex: 1 }}>
      <ScrollView contentContainerStyle={s.content}>
        <ThemedText type="title">Dashboard</ThemedText>
        <View style={s.hero}>
          <ThemedText style={{ color: '#ffffffcc' }}>Kontostand</ThemedText>
          <ThemedText style={s.heroValue}>{formatCurrency(balance, homeCurrency)}</ThemedText>
          <Ionicons name="wallet" size={90} color="rgba(255,255,255,0.15)" style={s.heroIcon} />
        </View>
        {transactions.some((t) => t.currency !== homeCurrency && t.convertedAmount === undefined) ? <ThemedText accessibilityRole="alert">Transaktionen ohne Wechselkurs sind in den Summen nicht enthalten.</ThemedText> : null}
        <IncomeExpenseCards income={income} expenses={expenses} />
        <ThemedText type="subtitle">Letzte Transaktionen</ThemedText>
        {transactions.length === 0 ? (
          <EmptyState />
        ) : (
          transactions.slice(-3).reverse().map((t) => <TransactionRow key={t.id} transaction={t} />)
        )}
        <AddTransactionButton />
      </ScrollView>
    </ThemedView>
  );
}

const s = StyleSheet.create({
  content: { padding: 24, gap: 16 },
  hero: { padding: 24, borderRadius: 20, backgroundColor: '#208AEF', overflow: 'hidden', gap: 4 },
  heroValue: { color: '#fff', fontSize: 34, lineHeight: 42, fontWeight: '700' },
  heroIcon: { position: 'absolute', right: 12, bottom: 4 },
});
