
export interface User {
  id: string;
  username: string; // Changed from email
  name: string;     // Mapped from full_name
}

export type TransactionType = 'income' | 'expense';

export interface Transaction {
  id: string;
  amount: number;
  category: string;
  description: string;
  date: string; 
  type: TransactionType;
}

export interface TransactionSummary {
  balance: number;
  income: number;
  expense: number;
}
