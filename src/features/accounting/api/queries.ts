import { mutationOptions, queryOptions } from '@tanstack/react-query';
import {
  createExpense,
  deleteExpense,
  deleteReceipt,
  getAccountingOverview,
  getExpense,
  getExpenses,
  updateExpense,
  uploadReceipt
} from './service';
import type { ExpenseFilters, ExpensePayload } from './types';

export const expenseQueries = {
  all: () => ['expenses'] as const,
  list: (filters: ExpenseFilters) =>
    queryOptions({
      queryKey: [...expenseQueries.all(), 'list', filters] as const,
      queryFn: () => getExpenses(filters)
    }),
  detail: (id: string) =>
    queryOptions({
      queryKey: [...expenseQueries.all(), 'detail', id] as const,
      queryFn: () => getExpense(id)
    })
};

export const accountingQueries = {
  all: () => ['accounting'] as const,
  overview: (month?: string) =>
    queryOptions({
      queryKey: [...accountingQueries.all(), 'overview', month] as const,
      queryFn: () => getAccountingOverview(month)
    })
};

export const expenseMutations = {
  create: () =>
    mutationOptions({ mutationFn: (payload: ExpensePayload) => createExpense(payload) }),
  update: () =>
    mutationOptions({
      mutationFn: ({ id, payload }: { id: string; payload: ExpensePayload }) =>
        updateExpense(id, payload)
    }),
  delete: () => mutationOptions({ mutationFn: (id: string) => deleteExpense(id) }),
  uploadReceipt: () =>
    mutationOptions({
      mutationFn: ({ id, file }: { id: string; file: File }) => uploadReceipt(id, file)
    }),
  deleteReceipt: () => mutationOptions({ mutationFn: (id: string) => deleteReceipt(id) })
};
