import { mutationOptions, queryOptions } from '@tanstack/react-query';
import {
  createCustomer,
  deleteCustomer,
  getCustomer,
  getCustomers,
  updateCustomer
} from './service';
import type { CustomerFilters, CustomerPayload } from './types';

export const customerQueries = {
  all: () => ['customers'] as const,
  list: (filters: CustomerFilters) =>
    queryOptions({
      queryKey: [...customerQueries.all(), 'list', filters] as const,
      queryFn: () => getCustomers(filters)
    }),
  detail: (id: string) =>
    queryOptions({
      queryKey: [...customerQueries.all(), 'detail', id] as const,
      queryFn: () => getCustomer(id)
    })
};

export const customerMutations = {
  create: () =>
    mutationOptions({ mutationFn: (payload: CustomerPayload) => createCustomer(payload) }),
  update: () =>
    mutationOptions({
      mutationFn: ({ id, payload }: { id: string; payload: CustomerPayload }) =>
        updateCustomer(id, payload)
    }),
  delete: () => mutationOptions({ mutationFn: (id: string) => deleteCustomer(id) })
};
