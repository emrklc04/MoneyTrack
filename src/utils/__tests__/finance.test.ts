import type { Budget } from '@/models/Budget';
import type { Transaction } from '@/models/Transaction';
import { calculateSpent, calculateTotals, isBudgetExceeded } from '@/utils/finance';

const base: Transaction = {
  id: '1',
  type: 'expense',
  amount: 10,
  currency: 'EUR',
  categoryId: 'food',
  date: '2026-10-05',
  description: 'Test',
};

describe('calculateTotals', () => {
  it('berechnet Einnahmen, Ausgaben und Kontostand', () => {
    const totals = calculateTotals([
      { ...base, id: 'a', type: 'income', amount: 100 },
      { ...base, id: 'b', amount: 30 },
      { ...base, id: 'c', amount: 20 },
    ]);
    expect(totals).toEqual({ income: 100, expenses: 50, balance: 50 });
  });

  it('nutzt den umgerechneten Betrag, falls vorhanden', () => {
    const totals = calculateTotals([{ ...base, amount: 10, currency: 'USD', convertedAmount: 9 }]);
    expect(totals.expenses).toBe(9);
  });

  it('liefert 0 bei leerer Liste', () => {
    expect(calculateTotals([])).toEqual({ income: 0, expenses: 0, balance: 0 });
  });
});

describe('calculateSpent', () => {
  const list: Transaction[] = [
    { ...base, id: 'a', amount: 12 },
    { ...base, id: 'b', amount: 8, date: '2026-09-30' },
    { ...base, id: 'c', amount: 5, categoryId: 'leisure' },
    { ...base, id: 'd', amount: 50, type: 'income' },
  ];

  it('summiert nur Ausgaben der Kategorie im Monat', () => {
    expect(calculateSpent(list, 'food', 10, 2026)).toBe(12);
  });
});

describe('isBudgetExceeded', () => {
  const budget: Budget = { id: 'b', categoryId: 'food', monthlyLimit: 100, month: 10, year: 2026 };

  it('warnt nur bei Überschreitung', () => {
    expect(isBudgetExceeded(budget, 100)).toBe(false);
    expect(isBudgetExceeded(budget, 100.01)).toBe(true);
  });

  it('warnt nicht ohne Budget', () => {
    expect(isBudgetExceeded(undefined, 999)).toBe(false);
  });
});


it('zählt unkonvertierte Fremdwährungen nicht als Hauptwährung', () => {
  expect(calculateTotals([{ ...base, currency: 'USD', amount: 100 }], 'EUR').expenses).toBe(0);
  expect(calculateSpent([{ ...base, currency: 'USD' }], 'food', 10, 2026, 'EUR')).toBe(0);
  expect(calculateTotals([{ ...base, currency: 'USD', amount: 100 }], 'USD').expenses).toBe(100);
});
