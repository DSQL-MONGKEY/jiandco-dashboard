import { mutationOptions, queryOptions } from '@tanstack/react-query';
import {
  createUser,
  deleteUser,
  getUser,
  getUsers,
  resetUserPassword,
  updateUser
} from './service';
import type {
  CreateUserPayload,
  ResetPasswordPayload,
  UpdateUserPayload,
  UserFilters
} from './types';

export const userQueries = {
  all: () => ['users'] as const,
  list: (filters: UserFilters) =>
    queryOptions({
      queryKey: [...userQueries.all(), 'list', filters] as const,
      queryFn: () => getUsers(filters)
    }),
  detail: (id: string) =>
    queryOptions({
      queryKey: [...userQueries.all(), 'detail', id] as const,
      queryFn: () => getUser(id)
    })
};

export const userMutations = {
  create: () =>
    mutationOptions({ mutationFn: (payload: CreateUserPayload) => createUser(payload) }),
  update: () =>
    mutationOptions({
      mutationFn: ({ id, payload }: { id: string; payload: UpdateUserPayload }) =>
        updateUser(id, payload)
    }),
  delete: () => mutationOptions({ mutationFn: (id: string) => deleteUser(id) }),
  resetPassword: () =>
    mutationOptions({
      mutationFn: ({ id, payload }: { id: string; payload: ResetPasswordPayload }) =>
        resetUserPassword(id, payload)
    })
};
