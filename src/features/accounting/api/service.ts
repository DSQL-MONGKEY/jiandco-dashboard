import { apiClient } from '@/lib/api-client';
import { toQueryString } from '@/lib/query-string';
import type { AccountingOverview, Expense, Paginated } from '@/types/api';
import type { ExpenseFilters, ExpensePayload } from './types';

export function getExpenses(filters: ExpenseFilters) {
  return apiClient<Paginated<Expense>>(`/expenses${toQueryString(filters)}`);
}

export function getExpense(id: string) {
  return apiClient<Expense>(`/expenses/${id}`);
}

export function createExpense(payload: ExpensePayload) {
  return apiClient<Expense>('/expenses', {
    method: 'POST',
    body: JSON.stringify(payload)
  });
}

export function updateExpense(id: string, payload: ExpensePayload) {
  return apiClient<Expense>(`/expenses/${id}`, {
    method: 'PUT',
    body: JSON.stringify(payload)
  });
}

export function deleteExpense(id: string) {
  return apiClient<{ message: string }>(`/expenses/${id}`, { method: 'DELETE' });
}

export function uploadReceipt(id: string, file: File) {
  const formData = new FormData();
  formData.append('file', file);
  return apiClient<{ receipt_key: string; receipt_url: string }>(`/expenses/${id}/receipt`, {
    method: 'POST',
    body: formData
  });
}

export function deleteReceipt(id: string) {
  return apiClient<{ message: string }>(`/expenses/${id}/receipt`, { method: 'DELETE' });
}

export function getAccountingOverview(month?: string) {
  return apiClient<AccountingOverview>(`/accounting/overview${toQueryString({ month })}`);
}
