import { appReducer, type AppState } from '@/context/AppContext';
import type { Transaction } from '@/models/Transaction';
jest.mock('@/database/database', () => ({
  seedCategories: jest.fn(),
  loadTransactions: jest.fn(),
  loadBudgets: jest.fn(),
  getSetting: jest.fn(),
  setSetting: jest.fn(),
  saveTransaction: jest.fn(),
  removeTransaction: jest.fn(),
  saveBudgetRow: jest.fn(),
}));


const tx: Transaction = {
  id: '1',
  type: 'expense',
  amount: 10,
  currency: 'EUR',
  categoryId: 'food',
  date: '2026-10-05',
  description: 'Brot',
};

const empty: AppState = { transactions: [], categories: [], budgets: [], homeCurrency: 'EUR' };

describe('appReducer', () => {
  it('fügt Transaktionen hinzu', () => {
    expect(appReducer(empty, { type: 'ADD_TRANSACTION', payload: tx }).transactions).toEqual([tx]);
  });

  it('ändert Transaktionen', () => {
    const state = { ...empty, transactions: [tx] };
    const next = appReducer(state, { type: 'UPDATE_TRANSACTION', payload: { ...tx, amount: 99 } });
    expect(next.transactions[0].amount).toBe(99);
  });

  it('löscht Transaktionen', () => {
    const state = { ...empty, transactions: [tx] };
    expect(appReducer(state, { type: 'DELETE_TRANSACTION', payload: '1' }).transactions).toEqual([]);
  });

  it('ersetzt ein bestehendes Budget statt es zu duplizieren', () => {
    const budget = { id: 'b', categoryId: 'food', monthlyLimit: 100, month: 10, year: 2026 };
    const first = appReducer(empty, { type: 'UPSERT_BUDGET', payload: budget });
    const second = appReducer(first, { type: 'UPSERT_BUDGET', payload: { ...budget, monthlyLimit: 200 } });
    expect(second.budgets).toHaveLength(1);
    expect(second.budgets[0].monthlyLimit).toBe(200);
  });

  it('setzt die Heimatwährung', () => {
    expect(appReducer(empty, { type: 'SET_HOME_CURRENCY', payload: 'USD' }).homeCurrency).toBe('USD');
  });
});
