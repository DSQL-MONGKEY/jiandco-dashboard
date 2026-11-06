export type { Customer } from '@/types/api';

export type CustomerFilters = {
  page?: number;
  per_page?: number;
  search?: string;
};

export type CustomerPayload = {
  name: string;
  phone: string;
  email?: string;
  address?: string;
  city?: string;
  province?: string;
  postal_code?: string;
  notes?: string;
};
