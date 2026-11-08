import { Platform } from 'react-native';
import * as SQLite from 'expo-sqlite';

import type { Budget } from '@/models/Budget';
import type { Category } from '@/models/Category';
import type { Transaction } from '@/models/Transaction';

let dbPromise: Promise<SQLite.SQLiteDatabase> | null = null;

export function getDatabase(): Promise<SQLite.SQLiteDatabase> {
  if (!dbPromise) {
    dbPromise = SQLite.openDatabaseAsync('moneytrack.db').then(async (database) => {
      await initDatabase(database);
      return database;
    }).catch((error) => { dbPromise = null; throw error; });
  }
  return dbPromise;
}

async function initDatabase(database: SQLite.SQLiteDatabase): Promise<void> {
  await database.execAsync(`
    CREATE TABLE IF NOT EXISTS categories (
      id TEXT PRIMARY KEY NOT NULL,
      name TEXT NOT NULL,
      type TEXT NOT NULL,
      color TEXT
    );

    CREATE TABLE IF NOT EXISTS transactions (
      id TEXT PRIMARY KEY NOT NULL,
      type TEXT NOT NULL,
      amount REAL NOT NULL,
      currency TEXT NOT NULL,
      convertedAmount REAL,
      categoryId TEXT NOT NULL,
      date TEXT NOT NULL,
      description TEXT,
      receiptImageUri TEXT,
      FOREIGN KEY (categoryId) REFERENCES categories(id)
    );

    CREATE TABLE IF NOT EXISTS budgets (
      id TEXT PRIMARY KEY NOT NULL,
      categoryId TEXT NOT NULL,
      monthlyLimit REAL NOT NULL,
      month INTEGER NOT NULL,
      year INTEGER NOT NULL,
      FOREIGN KEY (categoryId) REFERENCES categories(id)
    );

    CREATE TABLE IF NOT EXISTS settings (
      key TEXT PRIMARY KEY NOT NULL,
      value TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS exchange_rates (
      pair TEXT PRIMARY KEY NOT NULL,
      rate REAL NOT NULL,
      date TEXT NOT NULL
    );
  `);
}

export async function seedCategories(categories: Category[]): Promise<void> {
  const db = await getDatabase();
  for (const category of categories) {
    await db.runAsync(
      'INSERT OR IGNORE INTO categories (id, name, type, color) VALUES (?, ?, ?, ?)',
      category.id,
      category.name,
      category.type,
      category.color ?? null,
    );
  }
}

interface TransactionRow extends Omit<Transaction, 'convertedAmount' | 'receiptImageUri' | 'description'> {
  convertedAmount: number | null;
  receiptImageUri: string | null;
  description: string | null;
}

export async function loadTransactions(): Promise<Transaction[]> {
  const db = await getDatabase();
  const rows = await db.getAllAsync<TransactionRow>('SELECT * FROM transactions ORDER BY date ASC, rowid ASC');
  return rows.map((row) => ({
    ...row,
    description: row.description ?? '',
    convertedAmount: row.convertedAmount ?? undefined,
    receiptImageUri: row.receiptImageUri ?? undefined,
  }));
}

export async function saveTransaction(transaction: Transaction): Promise<void> {
  const db = await getDatabase();
  await db.runAsync(
    `INSERT OR REPLACE INTO transactions
      (id, type, amount, currency, convertedAmount, categoryId, date, description, receiptImageUri)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    transaction.id,
    transaction.type,
    transaction.amount,
    transaction.currency,
    transaction.convertedAmount ?? null,
    transaction.categoryId,
    transaction.date,
    transaction.description,
    transaction.receiptImageUri ?? null,
  );
}

export async function removeTransaction(id: string): Promise<void> {
  const db = await getDatabase();
  await db.runAsync('DELETE FROM transactions WHERE id = ?', id);
}

export async function loadBudgets(): Promise<Budget[]> {
  const db = await getDatabase();
  return db.getAllAsync<Budget>('SELECT * FROM budgets');
}

export async function saveBudgetRow(budget: Budget): Promise<void> {
  const db = await getDatabase();
  await db.runAsync(
    'INSERT OR REPLACE INTO budgets (id, categoryId, monthlyLimit, month, year) VALUES (?, ?, ?, ?, ?)',
    budget.id,
    budget.categoryId,
    budget.monthlyLimit,
    budget.month,
    budget.year,
  );
}

export async function getSetting(key: string): Promise<string | null> {
  const db = await getDatabase();
  const row = await db.getFirstAsync<{ value: string }>('SELECT value FROM settings WHERE key = ?', key);
  return row?.value ?? null;
}

export async function setSetting(key: string, value: string): Promise<void> {
  const db = await getDatabase();
  await db.runAsync('INSERT OR REPLACE INTO settings (key, value) VALUES (?, ?)', key, value);
}

export async function getCachedRate(pair: string): Promise<{ rate: number; date: string } | null> {
  const db = await getDatabase();
  return db.getFirstAsync<{ rate: number; date: string }>(
    'SELECT rate, date FROM exchange_rates WHERE pair = ?',
    pair,
  );
}

export async function cacheRate(pair: string, rate: number, date: string): Promise<void> {
  const db = await getDatabase();
  await db.runAsync('INSERT OR REPLACE INTO exchange_rates (pair, rate, date) VALUES (?, ?, ?)', pair, rate, date);
}

/** Commit all converted amounts, budgets and currency together, or roll back everything. */
export async function saveCurrencyChange(transactions: Transaction[], budgets: Budget[], currency: string): Promise<void> {
  const db = await getDatabase();
  const write = async (tx: SQLite.SQLiteDatabase) => {
    for (const transaction of transactions) {
      await tx.runAsync('UPDATE transactions SET convertedAmount = ? WHERE id = ?', transaction.convertedAmount ?? null, transaction.id);
    }
    for (const budget of budgets) {
      await tx.runAsync('UPDATE budgets SET monthlyLimit = ? WHERE id = ?', budget.monthlyLimit, budget.id);
    }
    await tx.runAsync('INSERT OR REPLACE INTO settings (key, value) VALUES (?, ?)', 'homeCurrency', currency);
  };
  if (Platform.OS === 'web') {
    await db.withTransactionAsync(() => write(db));
  } else {
    await db.withExclusiveTransactionAsync(write);
  }
}
