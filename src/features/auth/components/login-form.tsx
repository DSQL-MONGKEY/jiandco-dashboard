'use client';

import { useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import { useSearchParams } from 'next/navigation';
import { toast } from 'sonner';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { LoadingButton } from '@/components/ui/loading-button';
import { Icons } from '@/components/icons';
import { FieldHint } from '@/components/form-field-hint';
import { ApiError } from '@/lib/api-client';
import { authMutations } from '../api/queries';

export function LoginForm() {
  const searchParams = useSearchParams();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const loginMutation = useMutation({
    ...authMutations.login(),
    onSuccess: () => {
      toast.success('Signed in');
      const next = searchParams.get('next') || '/dashboard/overview';
      const safeNext =
        next.startsWith('/') && !next.startsWith('//') ? next : '/dashboard/overview';
      window.location.assign(safeNext);
    },
    onError: (error) => {
      toast.error(error instanceof ApiError ? error.message : 'Login failed');
    }
  });

  return (
    <form
      className='space-y-5'
      onSubmit={(event) => {
        event.preventDefault();
        if (!username.trim() || !password) {
          toast.error('Username and password are required');
          return;
        }
        loginMutation.mutate({ username: username.trim(), password });
      }}
    >
      <div className='space-y-2'>
        <Label htmlFor='username' className='text-[#4D0E13]'>
          Username
        </Label>
        <Input
          id='username'
          autoComplete='username'
          placeholder='Your username'
          value={username}
          onChange={(event) => setUsername(event.target.value)}
          disabled={loginMutation.isPending}
          aria-describedby='username-hint'
          className='h-11 border-[#CDBAA4] bg-white/60 text-[#111214] placeholder:text-[#8C7A6B] focus-visible:border-[#4D0E13] focus-visible:ring-[#4D0E13]/20'
        />
        <FieldHint id='username-hint'>Use the username assigned by your administrator.</FieldHint>
      </div>

      <div className='space-y-2'>
        <Label htmlFor='password' className='text-[#4D0E13]'>
          Password
        </Label>
        <div className='relative'>
          <Input
            id='password'
            type={showPassword ? 'text' : 'password'}
            autoComplete='current-password'
            placeholder='Enter your password'
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            disabled={loginMutation.isPending}
            aria-describedby='password-hint'
            className='h-11 border-[#CDBAA4] bg-white/60 pr-11 text-[#111214] placeholder:text-[#8C7A6B] focus-visible:border-[#4D0E13] focus-visible:ring-[#4D0E13]/20'
          />
          <button
            type='button'
            className='absolute inset-y-0 right-0 flex w-11 items-center justify-center text-[#6B5A4D] transition-colors hover:text-[#4D0E13] focus-visible:text-[#4D0E13] focus-visible:outline-none'
            aria-label={showPassword ? 'Hide password' : 'Show password'}
            onClick={() => setShowPassword((value) => !value)}
          >
            {showPassword ? <Icons.eyeOff className='size-4' /> : <Icons.eye className='size-4' />}
          </button>
        </div>
        <FieldHint id='password-hint'>Enter your account password.</FieldHint>
      </div>

      <LoadingButton
        loading={loginMutation.isPending}
        type='submit'
        className='h-11 w-full bg-[#4D0E13] text-[#EEE4DA] hover:bg-[#3D0A0F]'
        disabled={!username.trim() || !password}
      >
        <Icons.login className='mr-2 size-4' />
        Sign in to dashboard
      </LoadingButton>

      <p className='text-center text-[0.68rem] leading-5 text-[#8C7A6B]'>
        Authorized personnel only. Contact your admin if you cannot sign in.
      </p>
    </form>
  );
}
