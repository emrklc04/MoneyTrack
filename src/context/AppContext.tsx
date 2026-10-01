import { createContext, useContext, useReducer, type ReactNode } from 'react';

import type { Budget } from '@/models/Budget';
import type { Category } from '@/models/Category';
import type { Transaction } from '@/models/Transaction';

interface AppState {
  transactions: Transaction[];
  categories: Category[];
  budgets: Budget[];
  homeCurrency: string;
}

type AppAction =
  | { type: 'SET_TRANSACTIONS'; payload: Transaction[] }
  | { type: 'ADD_TRANSACTION'; payload: Transaction }
  | { type: 'UPDATE_TRANSACTION'; payload: Transaction }
  | { type: 'DELETE_TRANSACTION'; payload: string }
  | { type: 'SET_CATEGORIES'; payload: Category[] }
  | { type: 'SET_BUDGETS'; payload: Budget[] }
  | { type: 'SET_HOME_CURRENCY'; payload: string };

const initialState: AppState = {
  transactions: [],
  categories: [],
  budgets: [],
  homeCurrency: 'EUR',
};

function appReducer(state: AppState, action: AppAction): AppState {
  switch (action.type) {
    case 'SET_TRANSACTIONS':
      return { ...state, transactions: action.payload };
    case 'ADD_TRANSACTION':
      return { ...state, transactions: [...state.transactions, action.payload] };
    case 'UPDATE_TRANSACTION':
      return {
        ...state,
        transactions: state.transactions.map((t) => (t.id === action.payload.id ? action.payload : t)),
      };
    case 'DELETE_TRANSACTION':
      return { ...state, transactions: state.transactions.filter((t) => t.id !== action.payload) };
    case 'SET_CATEGORIES':
      return { ...state, categories: action.payload };
    case 'SET_BUDGETS':
      return { ...state, budgets: action.payload };
    case 'SET_HOME_CURRENCY':
      return { ...state, homeCurrency: action.payload };
    default:
      return state;
  }
}

const AppContext = createContext<{ state: AppState; dispatch: React.Dispatch<AppAction> } | undefined>(undefined);

export function AppProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(appReducer, initialState);

  return <AppContext.Provider value={{ state, dispatch }}>{children}</AppContext.Provider>;
}

export function useAppContext() {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useAppContext must be used within an AppProvider');
  }
  return context;
}
