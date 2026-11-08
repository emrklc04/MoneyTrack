import { Ionicons } from '@expo/vector-icons';
import { ScrollView, StyleSheet, View } from 'react-native';

import { DonutChart } from '@/components/DonutChart';
import { Card, EXPENSE, IncomeExpenseCards, ProgressBar } from '@/components/ui';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { useAppContext } from '@/context/AppContext';
import { calculateTotals, effectiveAmount } from '@/utils/finance';
import { formatCurrency } from '@/utils/formatCurrency';

const PALETTE = ['#208AEF', '#F5A524', '#F31260', '#7828C8', '#06B7DB', '#FF7849', '#889096'];

export default function StatisticsScreen() {
  const { transactions, categories, homeCurrency } = useAppContext();
  const { income, expenses, balance } = calculateTotals(transactions, homeCurrency);

  const spending = categories
    .map((c) => ({
      id: c.id,
      name: c.name,
      color: c.color,
      type: c.type,
      value: transactions
        .filter((t) => t.type === 'expense' && t.categoryId === c.id)
        .reduce((sum, t) => sum + effectiveAmount(t, homeCurrency), 0),
    }))
    .filter((c) => c.type === 'expense' && c.value > 0)
    .sort((a, b) => b.value - a.value)
    .map((c, i) => ({ ...c, color: c.color ?? PALETTE[i % PALETTE.length] }));

  // Das Diagramm zeigt die Einnahmen aufgeteilt in Ausgaben-Kategorien und den Rest (Gespart).
  const slices = [...spending, ...(balance > 0 ? [{ id: 'saved', name: 'Gespart', value: balance, color: '#17C964' }] : [])];
  const base = slices.reduce((sum, slice) => sum + slice.value, 0);
  const deficit = income > 0 && expenses > income;
  const [centerLabel, centerValue] =
    income === 0
      ? ['Ausgaben', formatCurrency(expenses, homeCurrency)]
      : deficit
        ? ['Defizit', formatCurrency(expenses - income, homeCurrency)]
        : ['Sparquote', `${Math.round((balance / income) * 100)} %`];

  return (
    <ThemedView style={{ flex: 1 }}>
      <ScrollView contentContainerStyle={s.content}>
        <ThemedText type="title">Statistiken</ThemedText>
        {transactions.some((t) => t.currency !== homeCurrency && t.convertedAmount === undefined) ? <ThemedText accessibilityRole="alert">Transaktionen ohne Wechselkurs sind in den Summen nicht enthalten.</ThemedText> : null}
        <IncomeExpenseCards income={income} expenses={expenses} />
        {slices.length === 0 ? (
          <ThemedText>Für die Auswertung gibt es noch keine Daten.</ThemedText>
        ) : (
          <>
            <ThemedText type="subtitle">{income > 0 ? 'Wohin dein Geld geht' : 'Ausgaben nach Kategorie'}</ThemedText>
            {deficit && (
              <View style={s.line}>
                <Ionicons name="warning" size={18} color={EXPENSE} />
                <ThemedText style={{ color: EXPENSE, flex: 1 }}>Du hast mehr ausgegeben als eingenommen.</ThemedText>
              </View>
            )}
            <DonutChart slices={slices} centerLabel={centerLabel} centerValue={centerValue} />
            {slices.map((slice) => (
              <Card key={slice.id} style={{ gap: 10, padding: 14, borderRadius: 12 }}>
                <View style={s.line}>
                  <View style={[s.dot, { backgroundColor: slice.color }]} />
                  <ThemedText style={{ flex: 1 }}>{slice.name}</ThemedText>
                  <ThemedText type="smallBold">{formatCurrency(slice.value, homeCurrency)}</ThemedText>
                  <ThemedText type="small">{Math.round((slice.value / base) * 100)} %</ThemedText>
                </View>
                <ProgressBar ratio={slice.value / base} color={slice.color} height={6} />
              </Card>
            ))}
          </>
        )}
      </ScrollView>
    </ThemedView>
  );
}

const s = StyleSheet.create({
  content: { padding: 24, gap: 16 },
  line: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  dot: { width: 12, height: 12, borderRadius: 6 },
});
