export type { AccountingOverview, Expense, ExpenseItem } from '@/types/api';

export type ExpenseCategory = 'operational' | 'production' | 'marketing' | 'restock' | 'other';

export type ExpenseFilters = {
  page?: number;
  per_page?: number;
  month?: string;
  category?: string;
  search?: string;
};

export type ExpenseItemInput = {
  name: string;
  quantity: number;
  unit: string;
  unit_price: number;
};

export type ExpensePayload = {
  title: string;
  category: ExpenseCategory;
  vendor?: string;
  expense_date: string;
  payment_method?: string;
  notes?: string;
  items: ExpenseItemInput[];
  total_amount?: number;
};
