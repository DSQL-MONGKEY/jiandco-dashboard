'use client';
// oxlint-disable react/set-state-in-effect -- dialogs sync props into local form state when opened

import { useEffect, useRef, useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import { toast } from 'sonner';
import { UserAvatar } from '@/components/user-avatar';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { LoadingButton } from '@/components/ui/loading-button';
import { Icons } from '@/components/icons';
import { FieldHint } from '@/components/form-field-hint';
import { useAuth } from '@/features/auth/context/auth-provider';
import { authMutations } from '@/features/auth/api/queries';
import { MAX_IMAGE_SIZE, MAX_UPLOAD_LABEL } from '@/lib/upload';

export function ProfileView() {
  const { user, refreshUser } = useAuth();
  const fileRef = useRef<HTMLInputElement>(null);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');

  useEffect(() => {
    if (!user) return;
    setName(user.name);
    setEmail(user.email);
    setPhone(user.phone);
  }, [user]);

  const profileMutation = useMutation({
    ...authMutations.updateProfile(),
    onSuccess: async () => {
      toast.success('Profile updated');
      await refreshUser();
    },
    onError: (error) => toast.error(error.message)
  });

  const passwordMutation = useMutation({
    ...authMutations.changePassword(),
    onSuccess: () => {
      toast.success('Password updated');
      setCurrentPassword('');
      setNewPassword('');
    },
    onError: (error) => toast.error(error.message)
  });

  const avatarMutation = useMutation({
    ...authMutations.uploadAvatar(),
    onSuccess: async () => {
      toast.success('Avatar updated');
      await refreshUser();
    },
    onError: (error) => toast.error(error.message)
  });

  return (
    <div className='grid gap-4 lg:grid-cols-[320px_1fr]'>
      <Card>
        <CardHeader>
          <CardTitle>Avatar</CardTitle>
          <CardDescription>JPEG, PNG, or WebP up to 10 MB.</CardDescription>
        </CardHeader>
        <CardContent className='flex flex-col items-center gap-4'>
          <UserAvatar user={user} className='size-24 text-2xl' />
          <input
            ref={fileRef}
            type='file'
            accept='image/jpeg,image/png,image/webp'
            className='hidden'
            onChange={(event) => {
              const file = event.target.files?.[0];
              if (file) {
                if (file.size > MAX_IMAGE_SIZE) {
                  toast.error(`Avatar exceeds the ${MAX_UPLOAD_LABEL} limit.`);
                } else {
                  avatarMutation.mutate(file);
                }
              }
              if (fileRef.current) fileRef.current.value = '';
            }}
          />
          <Button
            variant='outline'
            disabled={avatarMutation.isPending}
            onClick={() => fileRef.current?.click()}
          >
            <Icons.upload className='mr-1 size-4' />
            {avatarMutation.isPending ? 'Uploading...' : 'Upload avatar'}
          </Button>
          <div className='text-center'>
            <p className='font-medium'>{user?.name}</p>
            <p className='text-muted-foreground text-sm'>{user?.role.name}</p>
          </div>
        </CardContent>
      </Card>

      <div className='space-y-4'>
        <Card>
          <CardHeader>
            <CardTitle>Profile</CardTitle>
            <CardDescription>Update your account details.</CardDescription>
          </CardHeader>
          <CardContent className='space-y-4'>
            <div className='grid gap-4 md:grid-cols-2'>
              <div className='space-y-2'>
                <Label>Name</Label>
                <Input value={name} onChange={(event) => setName(event.target.value)} />
                <FieldHint>Display name shown in the dashboard.</FieldHint>
              </div>
              <div className='space-y-2'>
                <Label>Username</Label>
                <Input value={user?.username ?? ''} disabled />
                <FieldHint>Username cannot be changed here.</FieldHint>
              </div>
              <div className='space-y-2'>
                <Label>Email</Label>
                <Input
                  type='email'
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                />
                <FieldHint>Email used for account contact.</FieldHint>
              </div>
              <div className='space-y-2'>
                <Label>Phone</Label>
                <Input value={phone} onChange={(event) => setPhone(event.target.value)} />
                <FieldHint>Optional phone number.</FieldHint>
              </div>
            </div>
            <div className='flex justify-end'>
              <LoadingButton
                loading={profileMutation.isPending}
                onClick={() =>
                  profileMutation.mutate({
                    name: name.trim(),
                    email: email.trim(),
                    phone: phone.trim()
                  })
                }
              >
                Save profile
              </LoadingButton>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Change password</CardTitle>
            <CardDescription>Other sessions will be signed out.</CardDescription>
          </CardHeader>
          <CardContent className='space-y-4'>
            <div className='grid gap-4 md:grid-cols-2'>
              <div className='space-y-2'>
                <Label>Current password</Label>
                <Input
                  type='password'
                  value={currentPassword}
                  onChange={(event) => setCurrentPassword(event.target.value)}
                />
                <FieldHint>Required to confirm a password change.</FieldHint>
              </div>
              <div className='space-y-2'>
                <Label>New password</Label>
                <Input
                  type='password'
                  value={newPassword}
                  onChange={(event) => setNewPassword(event.target.value)}
                />
                <FieldHint>Minimum 8 characters.</FieldHint>
              </div>
            </div>
            <div className='flex justify-end'>
              <LoadingButton
                loading={passwordMutation.isPending}
                disabled={!currentPassword || newPassword.length < 8}
                onClick={() => passwordMutation.mutate({ currentPassword, newPassword })}
              >
                Update password
              </LoadingButton>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
