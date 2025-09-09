
export type ExpenseCategory = 
  | 'stock' 
  | 'office' 
  | 'advertising' 
  | 'vendor' 
  | 'transport' 
  | 'other';

export interface Expense {
  id: string;
  date: string;
  category: ExpenseCategory;
  amount: number;
  description: string;
  paymentMethod: string;
  vendor?: string;
  receipt?: string;
  status: 'pending' | 'approved' | 'rejected';
}
