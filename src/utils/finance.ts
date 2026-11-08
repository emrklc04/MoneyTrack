import type { Budget } from '@/models/Budget';
import type { Transaction } from '@/models/Transaction';

export function effectiveAmount(transaction: Transaction, homeCurrency = 'EUR'): number {
  return transaction.convertedAmount ?? (transaction.currency === homeCurrency ? transaction.amount : 0);
}

export function calculateTotals(transactions: Transaction[], homeCurrency = 'EUR'): { income: number; expenses: number; balance: number } {
  let income = 0;
  let expenses = 0;
  for (const transaction of transactions) {
    if (transaction.type === 'income') {
      income += effectiveAmount(transaction, homeCurrency);
    } else {
      expenses += effectiveAmount(transaction, homeCurrency);
    }
  }
  return { income, expenses, balance: income - expenses };
}

export function calculateSpent(transactions: Transaction[], categoryId: string, month: number, year: number, homeCurrency = 'EUR'): number {
  const prefix = `${year}-${String(month).padStart(2, '0')}`;
  return transactions
    .filter(
      (transaction) =>
        transaction.type === 'expense' &&
        transaction.categoryId === categoryId &&
        transaction.date.startsWith(prefix),
    )
    .reduce((total, transaction) => total + effectiveAmount(transaction, homeCurrency), 0);
}

export function isBudgetExceeded(budget: Budget | undefined, spent: number): boolean {
  return budget !== undefined && spent > budget.monthlyLimit;
}
