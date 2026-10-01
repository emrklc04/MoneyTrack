export type TransactionType = 'income' | 'expense';

export interface Transaction {
  id: string;
  type: TransactionType;
  amount: number;
  currency: string;
  convertedAmount?: number;
  categoryId: string;
  date: string;
  description: string;
  receiptImageUri?: string;
}
