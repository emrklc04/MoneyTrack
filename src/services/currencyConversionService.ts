import type { Budget } from '@/models/Budget';
import type { Transaction } from '@/models/Transaction';
import { getExchangeRate } from '@/services/currencyService';

export async function convertStoredAmounts(transactions: Transaction[], budgets: Budget[], from: string, to: string) {
  const currencies = new Set(transactions.filter((t) => t.convertedAmount === undefined).map((t) => t.currency));
  currencies.add(from);
  const rates = new Map(await Promise.all([...currencies].map(async (currency) => [currency, await getExchangeRate(currency, to)] as const)));
  const round = (value: number) => Math.round(value * 100) / 100;
  return {
    transactions: transactions.map((t) => ({ ...t, convertedAmount: t.currency === to ? t.amount : round(t.convertedAmount === undefined
      ? t.amount * rates.get(t.currency)!.rate : t.convertedAmount * rates.get(from)!.rate) })),
    budgets: budgets.map((b) => ({ ...b, monthlyLimit: round(b.monthlyLimit * rates.get(from)!.rate) })),
    cached: [...rates.values()].some((rate) => rate.source === 'cache'),
  };
}
