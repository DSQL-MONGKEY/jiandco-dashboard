export type { AuthUser, Role } from '@/types/api';

export type UserFilters = {
  page?: number;
  per_page?: number;
  search?: string;
  role_id?: string;
  is_active?: boolean;
};

export type CreateUserPayload = {
  name: string;
  username: string;
  email: string;
  password: string;
  phone: string;
  role_id: string;
  is_active?: boolean;
};

export type UpdateUserPayload = {
  name: string;
  email: string;
  phone: string;
  role_id: string;
  is_active?: boolean;
};

export type ResetPasswordPayload = {
  new_password: string;
};
