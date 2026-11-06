import { apiClient } from '@/lib/api-client';
import type { AuthUser, MeData } from '@/types/api';
import type { AvatarResult, ChangePasswordInput, LoginInput, UpdateProfileInput } from './types';

export function login(input: LoginInput): Promise<MeData> {
  return apiClient<MeData>('/auth/login', {
    method: 'POST',
    body: JSON.stringify(input)
  });
}

export function logout(): Promise<{ message: string }> {
  return apiClient<{ message: string }>('/auth/logout', { method: 'POST' });
}

export function getMe(): Promise<MeData> {
  return apiClient<MeData>('/auth/me');
}

export function updateProfile(input: UpdateProfileInput): Promise<AuthUser> {
  return apiClient<AuthUser>('/auth/profile', {
    method: 'PUT',
    body: JSON.stringify(input)
  });
}

export function changePassword(input: ChangePasswordInput): Promise<{ message: string }> {
  return apiClient<{ message: string }>('/auth/password', {
    method: 'PUT',
    body: JSON.stringify(input)
  });
}

export function uploadAvatar(file: File): Promise<AvatarResult> {
  const formData = new FormData();
  formData.append('file', file);
  return apiClient<AvatarResult>('/auth/avatar', {
    method: 'POST',
    body: formData
  });
}
