export type { AuthUser, MeData, Permission, Role } from '@/types/api';

export type LoginInput = {
  username: string;
  password: string;
};

export type UpdateProfileInput = {
  name: string;
  email: string;
  phone: string;
};

export type ChangePasswordInput = {
  currentPassword: string;
  newPassword: string;
};

export type AvatarResult = {
  avatar_key: string;
  avatar_url: string;
};
