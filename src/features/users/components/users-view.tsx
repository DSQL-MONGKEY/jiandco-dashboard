'use client';
// oxlint-disable react/set-state-in-effect -- dialogs sync props into local form state when opened

import { useEffect, useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { AlertModal } from '@/components/modal/alert-modal';
import { SimplePagination } from '@/components/simple-pagination';
import { StatusBadge } from '@/components/status-badge';
import { UserAvatar } from '@/components/user-avatar';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { LoadingButton } from '@/components/ui/loading-button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from '@/components/ui/table';
import { Icons } from '@/components/icons';
import { FieldHint } from '@/components/form-field-hint';
import { formatDateTime } from '@/lib/format';
import { useAuth } from '@/features/auth/context/auth-provider';
import { roleQueries } from '@/features/roles/api/queries';
import { userMutations, userQueries } from '../api/queries';
import type { AuthUser, Role } from '../api/types';

const PER_PAGE = 10;

const USER_STATUS_OPTIONS = [
  { value: 'all', label: 'All status' },
  { value: 'active', label: 'Active' },
  { value: 'inactive', label: 'Inactive' }
];

export function UsersView() {
  const { user: currentUser, isSuperAdmin } = useAuth();
  const queryClient = useQueryClient();
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [roleId, setRoleId] = useState('all');
  const [active, setActive] = useState('all');
  const [editTarget, setEditTarget] = useState<AuthUser | null>(null);
  const [createOpen, setCreateOpen] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<AuthUser | null>(null);
  const [resetTarget, setResetTarget] = useState<AuthUser | null>(null);

  const filters = {
    page,
    per_page: PER_PAGE,
    search: search || undefined,
    role_id: roleId === 'all' ? undefined : roleId,
    is_active: active === 'all' ? undefined : active === 'active'
  };

  const { data, isLoading } = useQuery(userQueries.list(filters));
  const { data: roles = [] } = useQuery(roleQueries.list());
  const roleOptions = [
    { value: 'all', label: 'All roles' },
    ...roles.map((role) => ({ value: role.id, label: role.name }))
  ];

  const assignableRoles = roles.filter(
    (role) =>
      isSuperAdmin ||
      role.level > (currentUser?.role.level ?? 99) ||
      role.id === editTarget?.role_id
  );

  const deleteMutation = useMutation({
    ...userMutations.delete(),
    onSuccess: () => {
      toast.success('User deleted');
      setDeleteTarget(null);
      queryClient.invalidateQueries({ queryKey: userQueries.all() });
    },
    onError: (error) => toast.error(error.message)
  });

  const items = data?.items ?? [];
  const pagination = data?.pagination;

  return (
    <div className='space-y-4'>
      <div className='grid grid-cols-1 gap-2 sm:grid-cols-2 xl:flex xl:items-center'>
        <div className='relative min-w-0 sm:col-span-2 xl:min-w-64 xl:flex-1'>
          <Icons.search className='text-muted-foreground absolute top-1/2 left-3 size-4 -translate-y-1/2' />
          <Input
            value={search}
            onChange={(event) => {
              setSearch(event.target.value);
              setPage(1);
            }}
            placeholder='Search name, username, or email...'
            className='pl-9'
          />
        </div>
        <Select
          items={roleOptions}
          value={roleId}
          onValueChange={(value) => {
            setRoleId(value ?? 'all');
            setPage(1);
          }}
        >
          <SelectTrigger className='w-full sm:w-48'>
            <SelectValue placeholder='Role' />
          </SelectTrigger>
          <SelectContent>
            {roleOptions.map((option) => (
              <SelectItem key={option.value} value={option.value}>
                {option.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select
          items={USER_STATUS_OPTIONS}
          value={active}
          onValueChange={(value) => {
            setActive(value ?? 'all');
            setPage(1);
          }}
        >
          <SelectTrigger className='w-full sm:w-40'>
            <SelectValue placeholder='Status' />
          </SelectTrigger>
          <SelectContent>
            {USER_STATUS_OPTIONS.map((option) => (
              <SelectItem key={option.value} value={option.value}>
                {option.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Button className='w-full xl:w-auto' onClick={() => setCreateOpen(true)}>
          <Icons.add className='mr-1 size-4' />
          Add user
        </Button>
      </div>

      <Card>
        <CardContent className='p-0'>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>User</TableHead>
                <TableHead>Username</TableHead>
                <TableHead>Role</TableHead>
                <TableHead>Phone</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Last login</TableHead>
                <TableHead className='w-32 text-right'>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading && (
                <TableRow>
                  <TableCell colSpan={7} className='text-muted-foreground h-24 text-center'>
                    Loading users...
                  </TableCell>
                </TableRow>
              )}
              {!isLoading && items.length === 0 && (
                <TableRow>
                  <TableCell colSpan={7} className='text-muted-foreground h-24 text-center'>
                    No users found.
                  </TableCell>
                </TableRow>
              )}
              {items.map((item) => (
                <TableRow key={item.id}>
                  <TableCell>
                    <div className='flex items-center gap-2'>
                      <UserAvatar user={item} className='size-8' />
                      <div>
                        <p className='font-medium'>{item.name}</p>
                        <p className='text-muted-foreground text-xs'>{item.email}</p>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell className='font-mono text-xs'>{item.username}</TableCell>
                  <TableCell>{item.role.name}</TableCell>
                  <TableCell>{item.phone || '-'}</TableCell>
                  <TableCell>
                    <StatusBadge value={item.is_active ? 'active' : 'inactive'} />
                  </TableCell>
                  <TableCell className='text-xs'>{formatDateTime(item.last_login_at)}</TableCell>
                  <TableCell className='text-right'>
                    <div className='flex justify-end gap-1'>
                      <Button
                        variant='ghost'
                        size='icon'
                        title='Reset password'
                        onClick={() => setResetTarget(item)}
                      >
                        <Icons.lock className='size-4' />
                      </Button>
                      <Button variant='ghost' size='icon' onClick={() => setEditTarget(item)}>
                        <Icons.edit className='size-4' />
                      </Button>
                      <Button
                        variant='ghost'
                        size='icon'
                        disabled={item.id === currentUser?.id}
                        onClick={() => setDeleteTarget(item)}
                      >
                        <Icons.trash className='size-4' />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {pagination && (
        <SimplePagination
          page={pagination.page}
          totalPages={pagination.total_pages}
          total={pagination.total}
          onPageChange={setPage}
        />
      )}

      <UserDialog
        open={createOpen || !!editTarget}
        onOpenChange={(open) => {
          if (!open) {
            setCreateOpen(false);
            setEditTarget(null);
          }
        }}
        user={editTarget}
        roles={assignableRoles.length > 0 ? assignableRoles : roles}
      />

      <ResetPasswordDialog
        open={!!resetTarget}
        onOpenChange={(open) => !open && setResetTarget(null)}
        user={resetTarget}
      />

      <AlertModal
        isOpen={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={() => deleteTarget && deleteMutation.mutate(deleteTarget.id)}
        loading={deleteMutation.isPending}
      />
    </div>
  );
}

function UserDialog({
  open,
  onOpenChange,
  user,
  roles
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  user: AuthUser | null;
  roles: Role[];
}) {
  const queryClient = useQueryClient();
  const [name, setName] = useState('');
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [roleId, setRoleId] = useState('');
  const [isActive, setIsActive] = useState(true);
  const roleOptions = roles.map((role) => ({
    value: role.id,
    label: `${role.name} (level ${role.level})`
  }));

  useEffect(() => {
    if (!open) return;
    setName(user?.name ?? '');
    setUsername(user?.username ?? '');
    setEmail(user?.email ?? '');
    setPhone(user?.phone ?? '');
    setPassword('');
    setRoleId(user?.role_id ?? roles[0]?.id ?? '');
    setIsActive(user?.is_active ?? true);
  }, [open, user, roles]);

  const createMutation = useMutation({
    ...userMutations.create(),
    onSuccess: () => {
      toast.success('User created');
      queryClient.invalidateQueries({ queryKey: userQueries.all() });
      onOpenChange(false);
    },
    onError: (error) => toast.error(error.message)
  });

  const updateMutation = useMutation({
    ...userMutations.update(),
    onSuccess: () => {
      toast.success('User updated');
      queryClient.invalidateQueries({ queryKey: userQueries.all() });
      onOpenChange(false);
    },
    onError: (error) => toast.error(error.message)
  });

  const pending = createMutation.isPending || updateMutation.isPending;

  function submit() {
    if (!name.trim() || !email.trim() || !roleId) {
      toast.error('Name, email, and role are required');
      return;
    }
    if (user) {
      updateMutation.mutate({
        id: user.id,
        payload: {
          name: name.trim(),
          email: email.trim(),
          phone: phone.trim(),
          role_id: roleId,
          is_active: isActive
        }
      });
    } else {
      if (!username.trim() || password.length < 8) {
        toast.error('Username is required and password must be at least 8 characters');
        return;
      }
      createMutation.mutate({
        name: name.trim(),
        username: username.trim(),
        email: email.trim(),
        password,
        phone: phone.trim(),
        role_id: roleId,
        is_active: isActive
      });
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{user ? 'Edit user' : 'Create user'}</DialogTitle>
          <DialogDescription>
            {user ? 'Update account details and role.' : 'Create a dashboard account.'}
          </DialogDescription>
        </DialogHeader>
        <div className='grid gap-4 py-2 md:grid-cols-2'>
          <div className='space-y-2'>
            <Label>Name</Label>
            <Input value={name} onChange={(event) => setName(event.target.value)} />
            <FieldHint>Full name shown in the dashboard.</FieldHint>
          </div>
          <div className='space-y-2'>
            <Label>Username</Label>
            <Input
              value={username}
              disabled={!!user}
              onChange={(event) => setUsername(event.target.value)}
            />
            <FieldHint>Login username; it cannot be changed later.</FieldHint>
          </div>
          <div className='space-y-2'>
            <Label>Email</Label>
            <Input type='email' value={email} onChange={(event) => setEmail(event.target.value)} />
            <FieldHint>Email used for account contact.</FieldHint>
          </div>
          <div className='space-y-2'>
            <Label>Phone</Label>
            <Input value={phone} onChange={(event) => setPhone(event.target.value)} />
            <FieldHint>Optional phone number.</FieldHint>
          </div>
          {!user && (
            <div className='space-y-2'>
              <Label>Password</Label>
              <Input
                type='password'
                value={password}
                onChange={(event) => setPassword(event.target.value)}
              />
              <FieldHint>Minimum 8 characters.</FieldHint>
            </div>
          )}
          <div className='space-y-2'>
            <Label>Role</Label>
            <Select
              items={roleOptions}
              value={roleId}
              onValueChange={(value) => setRoleId(value ?? '')}
            >
              <SelectTrigger>
                <SelectValue placeholder='Select role' />
              </SelectTrigger>
              <SelectContent>
                {roleOptions.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <FieldHint>Determines which dashboard pages this user can access.</FieldHint>
          </div>
          <div className='flex items-center gap-2 pt-6'>
            <input
              id='user-active'
              type='checkbox'
              checked={isActive}
              onChange={(event) => setIsActive(event.target.checked)}
            />
            <div>
              <Label htmlFor='user-active'>Active</Label>
              <FieldHint>Inactive users cannot sign in.</FieldHint>
            </div>
          </div>
        </div>
        <DialogFooter>
          <Button variant='outline' onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <LoadingButton loading={pending} onClick={submit}>
            Save
          </LoadingButton>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function ResetPasswordDialog({
  open,
  onOpenChange,
  user
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  user: AuthUser | null;
}) {
  const queryClient = useQueryClient();
  const [password, setPassword] = useState('');

  useEffect(() => {
    if (open) setPassword('');
  }, [open]);

  const mutation = useMutation({
    ...userMutations.resetPassword(),
    onSuccess: () => {
      toast.success('Password reset');
      queryClient.invalidateQueries({ queryKey: userQueries.all() });
      onOpenChange(false);
    },
    onError: (error) => toast.error(error.message)
  });

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Reset password</DialogTitle>
          <DialogDescription>
            {user?.name} · {user?.username}
          </DialogDescription>
        </DialogHeader>
        <div className='space-y-2 py-2'>
          <Label>New password</Label>
          <Input
            type='password'
            value={password}
            onChange={(event) => setPassword(event.target.value)}
          />
          <FieldHint>Minimum 8 characters.</FieldHint>
        </div>
        <DialogFooter>
          <Button variant='outline' onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <LoadingButton
            loading={mutation.isPending}
            disabled={password.length < 8}
            onClick={() =>
              user && mutation.mutate({ id: user.id, payload: { new_password: password } })
            }
          >
            Reset
          </LoadingButton>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
