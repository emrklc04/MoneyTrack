import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useReducer,
  useRef,
  useState,
  type ReactNode,
} from 'react';
import { ActivityIndicator, Pressable, Text, View } from 'react-native';

import {
  getSetting,
  loadBudgets,
  loadTransactions,
  removeTransaction,
  saveBudgetRow,
  saveTransaction,
  seedCategories,
  setSetting,
  saveCurrencyChange,
} from '@/database/database';
import { convertStoredAmounts } from '@/services/currencyConversionService';
import { SUPPORTED_CURRENCIES } from '@/services/currencyService';
import type { Budget } from '@/models/Budget';
import type { Category } from '@/models/Category';
import type { Transaction } from '@/models/Transaction';

export interface AppState {
  transactions: Transaction[];
  categories: Category[];
  budgets: Budget[];
  homeCurrency: string;
}

type AppAction =
  | { type: 'HYDRATE'; payload: Pick<AppState, 'transactions' | 'budgets' | 'homeCurrency'> }
  | { type: 'ADD_TRANSACTION'; payload: Transaction }
  | { type: 'UPDATE_TRANSACTION'; payload: Transaction }
  | { type: 'DELETE_TRANSACTION'; payload: string }
  | { type: 'UPSERT_BUDGET'; payload: Budget }
  | { type: 'SET_HOME_CURRENCY'; payload: string };

const initialState: AppState = {
  transactions: [],
  categories: [
    { id: 'salary', name: 'Gehalt', type: 'income', color: '#2e7d32' },
    { id: 'other-income', name: 'Sonstige Einnahmen', type: 'income', color: '#4caf50' },
    { id: 'food', name: 'Lebensmittel', type: 'expense', color: '#ef6c00' },
    { id: 'housing', name: 'Wohnen', type: 'expense', color: '#5e35b1' },
    { id: 'transport', name: 'Mobilität', type: 'expense', color: '#0277bd' },
    { id: 'leisure', name: 'Freizeit', type: 'expense', color: '#c2185b' },
    { id: 'other-expense', name: 'Sonstige Ausgaben', type: 'expense', color: '#616161' },
  ],
  budgets: [],
  homeCurrency: 'EUR',
};

export function appReducer(state: AppState, action: AppAction): AppState {
  switch (action.type) {
    case 'HYDRATE':
      return { ...state, ...action.payload };
    case 'ADD_TRANSACTION':
      return { ...state, transactions: [...state.transactions, action.payload] };
    case 'UPDATE_TRANSACTION':
      return {
        ...state,
        transactions: state.transactions.map((transaction) =>
          transaction.id === action.payload.id ? action.payload : transaction,
        ),
      };
    case 'DELETE_TRANSACTION':
      return {
        ...state,
        transactions: state.transactions.filter((transaction) => transaction.id !== action.payload),
      };
    case 'UPSERT_BUDGET': {
      const budgetIndex = state.budgets.findIndex(
        (budget) =>
          budget.categoryId === action.payload.categoryId &&
          budget.month === action.payload.month &&
          budget.year === action.payload.year,
      );
      if (budgetIndex === -1) {
        return { ...state, budgets: [...state.budgets, action.payload] };
      }
      return {
        ...state,
        budgets: state.budgets.map((budget, index) => (index === budgetIndex ? action.payload : budget)),
      };
    }
    case 'SET_HOME_CURRENCY':
      return { ...state, homeCurrency: action.payload };
  }
}

interface AppContextValue extends AppState {
  addTransaction: (transaction: Transaction) => Promise<void>;
  updateTransaction: (transaction: Transaction) => Promise<void>;
  deleteTransaction: (id: string) => Promise<void>;
  saveBudget: (budget: Budget) => Promise<void>;
  setHomeCurrency: (currency: string) => Promise<void>;
}

const AppContext = createContext<AppContextValue | undefined>(undefined);

export function AppProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(appReducer, initialState);
  const [loaded, setLoaded] = useState(false);
  const [loadError, setLoadError] = useState(false);
  const [loadAttempt, setLoadAttempt] = useState(0);
  const changingCurrency = useRef(false);

  useEffect(() => {
    let cancelled = false;
    async function hydrate() {
      try {
        await seedCategories(initialState.categories);
        const [transactions, budgets, homeCurrency] = await Promise.all([
          loadTransactions(),
          loadBudgets(),
          getSetting('homeCurrency'),
        ]);
        if (!cancelled) {
          dispatch({
            type: 'HYDRATE',
            payload: { transactions, budgets, homeCurrency: homeCurrency ?? initialState.homeCurrency },
          });
        }
      } catch {
        if (!cancelled) setLoadError(true);
      } finally {
        if (!cancelled) {
          setLoaded(true);
        }
      }
    }
    hydrate();
    return () => {
      cancelled = true;
    };
  }, [loadAttempt]);

  const addTransaction = useCallback(async (transaction: Transaction) => {
    if (changingCurrency.current) throw new Error('Währungswechsel läuft');
    await saveTransaction(transaction);
    dispatch({ type: 'ADD_TRANSACTION', payload: transaction });
  }, []);
  const updateTransaction = useCallback(async (transaction: Transaction) => {
    if (changingCurrency.current) throw new Error('Währungswechsel läuft');
    await saveTransaction(transaction);
    dispatch({ type: 'UPDATE_TRANSACTION', payload: transaction });
  }, []);
  const deleteTransaction = useCallback(async (id: string) => {
    if (changingCurrency.current) throw new Error('Währungswechsel läuft');
    await removeTransaction(id);
    dispatch({ type: 'DELETE_TRANSACTION', payload: id });
  }, []);
  const saveBudget = useCallback(async (budget: Budget) => {
    if (changingCurrency.current) throw new Error('Währungswechsel läuft');
    await saveBudgetRow(budget);
    dispatch({ type: 'UPSERT_BUDGET', payload: budget });
  }, []);
  const setHomeCurrency = useCallback(async (currency: string) => {
    if (currency === state.homeCurrency) return;
    if (!SUPPORTED_CURRENCIES.some((code) => code === currency)) throw new Error('Unbekannte Währung');
    if (changingCurrency.current) throw new Error('Währungswechsel läuft bereits');
    changingCurrency.current = true;
    try {
      if (state.transactions.length === 0 && state.budgets.length === 0) {
        await setSetting('homeCurrency', currency);
        dispatch({ type: 'SET_HOME_CURRENCY', payload: currency });
      } else {
        const converted = await convertStoredAmounts(state.transactions, state.budgets, state.homeCurrency, currency);
        await saveCurrencyChange(converted.transactions, converted.budgets, currency);
        dispatch({ type: 'HYDRATE', payload: { transactions: converted.transactions, budgets: converted.budgets, homeCurrency: currency } });
      }
    } finally { changingCurrency.current = false; }
  }, [state.transactions, state.budgets, state.homeCurrency]);

  const value = useMemo(
    () => ({
      ...state,
      addTransaction,
      updateTransaction,
      deleteTransaction,
      saveBudget,
      setHomeCurrency,
    }),
    [state, addTransaction, updateTransaction, deleteTransaction, saveBudget, setHomeCurrency],
  );

  if (loadError) {
    return <View style={{ flex: 1, justifyContent: 'center', padding: 24, gap: 16 }}>
      <Text accessibilityRole="alert">Lokale Daten konnten nicht geladen werden. Deine gespeicherten Daten werden nicht überschrieben.</Text>
      <Pressable accessibilityRole="button" onPress={() => { setLoadError(false); setLoaded(false); setLoadAttempt((attempt) => attempt + 1); }}>
        <Text>Erneut versuchen</Text>
      </Pressable>
    </View>;
  }
  if (!loaded) {
    return (
      <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

export function useAppContext(): AppContextValue {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useAppContext must be used within an AppProvider');
  }
  return context;
}
