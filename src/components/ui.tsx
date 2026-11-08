import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { Pressable, StyleSheet, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { useAppContext } from '@/context/AppContext';
import { useTheme } from '@/hooks/use-theme';
import type { Transaction } from '@/models/Transaction';
import { formatCurrency } from '@/utils/formatCurrency';

export const INCOME = '#2e7d32';
export const EXPENSE = '#c62828';

export function Card({ style, ...rest }: React.ComponentProps<typeof View>) {
  return <View style={[s.card, { backgroundColor: useTheme().backgroundElement }, style]} {...rest} />;
}

export function EmptyState({ size = 40 }: { size?: number }) {
  const theme = useTheme();
  return (
    <Card style={s.empty}>
      <Ionicons name="receipt-outline" size={size} color={theme.textSecondary} />
      <ThemedText themeColor="textSecondary">Es sind noch keine Transaktionen vorhanden.</ThemedText>
    </Card>
  );
}

export function IncomeExpenseCards({ income, expenses }: { income: number; expenses: number }) {
  const { homeCurrency } = useAppContext();
  return (
    <View style={s.cards}>
      {([['Einnahmen', income, 'arrow-down-circle', INCOME], ['Ausgaben', expenses, 'arrow-up-circle', EXPENSE]] as const).map(
        ([label, value, icon, color]) => (
          <Card key={label} style={s.flex}>
            <Ionicons name={icon} size={28} color={color} />
            <ThemedText type="small">{label}</ThemedText>
            <ThemedText type="smallBold">{formatCurrency(value, homeCurrency)}</ThemedText>
          </Card>
        ),
      )}
    </View>
  );
}

export function ProgressBar({ ratio, color, height = 10 }: { ratio: number; color: string; height?: number }) {
  return (
    <View style={{ height, borderRadius: height / 2, overflow: 'hidden', backgroundColor: '#8884' }}>
      <View style={{ width: `${Math.min(ratio, 1) * 100}%`, height: '100%', backgroundColor: color }} />
    </View>
  );
}

export function TransactionRow({ transaction: t, showDate }: { transaction: Transaction; showDate?: boolean }) {
  const router = useRouter();
  const { categories, homeCurrency } = useAppContext();
  const income = t.type === 'income';
  const color = income ? INCOME : EXPENSE;
  return (
    <Pressable onPress={() => router.push({ pathname: '/transaction/[id]', params: { id: t.id } })}>
      <Card style={s.row}>
        <View style={[s.badge, { backgroundColor: `${color}22` }]}>
          <Ionicons name={income ? 'arrow-down' : 'arrow-up'} size={20} color={color} />
        </View>
        <View style={s.flex}>
          <ThemedText type="smallBold">{t.description}</ThemedText>
          <ThemedText type="small" themeColor="textSecondary">
            {categories.find((c) => c.id === t.categoryId)?.name ?? 'Unbekannte Kategorie'}
            {showDate ? ` · ${t.date}` : ''}
          </ThemedText>
        </View>
        <ThemedText style={{ color, fontWeight: '700' }}>
          {income ? '+' : '-'}
          {formatCurrency(t.convertedAmount ?? t.amount, t.convertedAmount === undefined ? t.currency : homeCurrency)}
        </ThemedText>
      </Card>
    </Pressable>
  );
}

export function AddTransactionButton() {
  const router = useRouter();
  return (
    <Pressable onPress={() => router.push('/add-transaction')} style={s.button}>
      <Ionicons name="add-circle" size={22} color="#fff" />
      <ThemedText style={s.buttonText}>Neue Transaktion</ThemedText>
    </Pressable>
  );
}

const s = StyleSheet.create({
  card: { gap: 4, padding: 16, borderRadius: 16 },
  empty: { alignItems: 'center', gap: 8, padding: 28 },
  cards: { flexDirection: 'row', gap: 12 },
  flex: { flex: 1 },
  row: { flexDirection: 'row', alignItems: 'center', gap: 12, padding: 12, borderRadius: 14 },
  badge: { width: 40, height: 40, borderRadius: 20, alignItems: 'center', justifyContent: 'center' },
  button: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, padding: 14, borderRadius: 14, backgroundColor: '#2563eb' },
  buttonText: { color: '#fff', fontWeight: '600' },
});
