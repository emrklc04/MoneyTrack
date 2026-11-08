import { Ionicons } from '@expo/vector-icons';
import { useState } from 'react';
import { Alert, Pressable, ScrollView, StyleSheet, TextInput, View } from 'react-native';

import { Card, EXPENSE, ProgressBar } from '@/components/ui';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { useAppContext } from '@/context/AppContext';
import { useTheme } from '@/hooks/use-theme';
import { calculateSpent, isBudgetExceeded } from '@/utils/finance';
import { formatCurrency } from '@/utils/formatCurrency';

export default function BudgetsScreen() {
  const { budgets, categories, transactions, homeCurrency, saveBudget } = useAppContext();
  const theme = useTheme();
  const [limits, setLimits] = useState<Record<string, string>>({});
  const now = new Date();
  const month = now.getMonth() + 1;
  const year = now.getFullYear();

  function saveCategoryBudget(categoryId: string) {
    const monthlyLimit = Number((limits[`${homeCurrency}-${categoryId}`] ?? budgets.find((b) => b.categoryId === categoryId && b.month === month && b.year === year)?.monthlyLimit.toString() ?? '').replace(',', '.'));
    if (!Number.isFinite(monthlyLimit) || monthlyLimit <= 0) {
      Alert.alert('Betrag prüfen', 'Bitte gib ein monatliches Budget größer als 0 ein.');
      return;
    }
    saveBudget({ id: `${categoryId}-${year}-${month}`, categoryId, monthlyLimit, month, year }).catch(() =>
      Alert.alert('Speichern fehlgeschlagen', 'Das Budget konnte nicht lokal gespeichert werden.'),
    );
  }

  return (
    <ThemedView style={{ flex: 1, padding: 24, gap: 12 }}>
      <ThemedText type="title">Budgets</ThemedText>
      <View style={s.row}>
        <Ionicons name="calendar" size={18} color={theme.textSecondary} />
        <ThemedText themeColor="textSecondary">{now.toLocaleDateString('de-DE', { month: 'long', year: 'numeric' })}</ThemedText>
      </View>
      {transactions.some((t) => t.currency !== homeCurrency && t.convertedAmount === undefined) ? <ThemedText accessibilityRole="alert">Transaktionen ohne Wechselkurs sind in den Summen nicht enthalten.</ThemedText> : null}
      <ScrollView contentContainerStyle={{ gap: 12 }} keyboardShouldPersistTaps="handled">
        {categories.filter((c) => c.type === 'expense').map((category) => {
          const budget = budgets.find((b) => b.categoryId === category.id && b.month === month && b.year === year);
          const spent = calculateSpent(transactions, category.id, month, year, homeCurrency);
          const ratio = budget ? spent / budget.monthlyLimit : 0;
          const color = ratio >= 1 ? EXPENSE : ratio >= 0.8 ? '#F5A524' : '#17C964';

          return (
            <Card key={category.id} style={{ gap: 10, padding: 14 }}>
              <View style={s.row}>
                <ThemedText type="smallBold" style={{ flex: 1 }}>{category.name}</ThemedText>
                {budget && <ThemedText type="smallBold" style={{ color }}>{Math.round(ratio * 100)} %</ThemedText>}
              </View>
              {budget && <ProgressBar ratio={ratio} color={color} />}
              <ThemedText type="small" themeColor="textSecondary">
                Ausgegeben: {formatCurrency(spent, homeCurrency)}
                {budget ? ` von ${formatCurrency(budget.monthlyLimit, homeCurrency)}` : ''}
              </ThemedText>
              <View style={s.row}>
                <TextInput
                  accessibilityLabel={`Monatsbudget für ${category.name}`}
                  keyboardType="decimal-pad"
                  onChangeText={(value) => setLimits((current) => ({ ...current, [`${homeCurrency}-${category.id}`]: value }))}
                  placeholder="Monatslimit"
                  placeholderTextColor="#888888"
                  style={s.input}
                  key={`${category.id}-${homeCurrency}`}
                  value={limits[`${homeCurrency}-${category.id}`] ?? budget?.monthlyLimit.toString() ?? ''}
                />
                <Pressable onPress={() => saveCategoryBudget(category.id)} style={[s.row, s.button]}>
                  <Ionicons name="checkmark" size={18} color="#fff" />
                  <ThemedText style={{ color: '#fff', fontWeight: '600' }}>Speichern</ThemedText>
                </Pressable>
              </View>
              {isBudgetExceeded(budget, spent) && (
                <View style={s.row}>
                  <Ionicons name="warning" size={16} color={EXPENSE} />
                  <ThemedText style={{ color: EXPENSE, fontWeight: '700' }}>Budget überschritten</ThemedText>
                </View>
              )}
            </Card>
          );
        })}
      </ScrollView>
    </ThemedView>
  );
}

const s = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  input: { flex: 1, paddingHorizontal: 12, paddingVertical: 10, borderWidth: 1, borderColor: '#999', borderRadius: 10, color: '#111', backgroundColor: '#fff' },
  button: { gap: 4, padding: 12, borderRadius: 10, backgroundColor: '#2563eb' },
});
