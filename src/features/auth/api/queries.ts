import { mutationOptions, queryOptions } from '@tanstack/react-query';
import { changePassword, getMe, login, logout, updateProfile, uploadAvatar } from './service';

export const authQueries = {
  all: () => ['auth'] as const,
  me: () =>
    queryOptions({
      queryKey: [...authQueries.all(), 'me'] as const,
      queryFn: getMe,
      staleTime: 5 * 60 * 1000,
      retry: false
    })
};

export const authMutations = {
  login: () => mutationOptions({ mutationFn: login }),
  logout: () => mutationOptions({ mutationFn: logout }),
  updateProfile: () => mutationOptions({ mutationFn: updateProfile }),
  changePassword: () => mutationOptions({ mutationFn: changePassword }),
  uploadAvatar: () => mutationOptions({ mutationFn: uploadAvatar })
};
