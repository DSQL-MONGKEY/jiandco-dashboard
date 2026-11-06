'use client';
// oxlint-disable react/set-state-in-effect -- dialogs sync props into local form state when opened

import { useEffect, useMemo, useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { LoadingButton } from '@/components/ui/loading-button';
import { Icons } from '@/components/icons';
import { useAuth } from '@/features/auth/context/auth-provider';
import { cn } from '@/lib/utils';
import { roleMutations, roleQueries } from '../api/queries';

const ACTION_ORDER = ['view', 'create', 'update', 'delete'];

export function RolesView() {
  const { can } = useAuth();
  const queryClient = useQueryClient();
  const { data: roles = [], isLoading: rolesLoading } = useQuery(roleQueries.list());
  const { data: catalog = [], isLoading: catalogLoading } = useQuery(roleQueries.catalog());
  const [selectedRoleId, setSelectedRoleId] = useState<string>('');
  const [selected, setSelected] = useState<Set<string>>(new Set());

  useEffect(() => {
    if (!selectedRoleId && roles.length > 0) {
      setSelectedRoleId(roles[0].id);
    }
  }, [roles, selectedRoleId]);

  const { data: rolePermissions, isLoading: permissionsLoading } = useQuery({
    ...roleQueries.permissions(selectedRoleId),
    enabled: !!selectedRoleId
  });

  useEffect(() => {
    if (rolePermissions) {
      setSelected(new Set(rolePermissions.permissions.map((permission) => permission.id)));
    }
  }, [rolePermissions]);

  const selectedRole = roles.find((role) => role.id === selectedRoleId);
  const canUpdate = can('roles', 'update');
  const locked = !canUpdate || (selectedRole?.level ?? 0) <= 1;

  const groups = useMemo(() => {
    const map = new Map<string, typeof catalog>();
    for (const permission of catalog) {
      const list = map.get(permission.page) ?? [];
      list.push(permission);
      map.set(permission.page, list);
    }
    return Array.from(map.entries())
      .map(([page, permissions]) => ({
        page,
        permissions: [...permissions].toSorted(
          (a, b) => ACTION_ORDER.indexOf(a.action) - ACTION_ORDER.indexOf(b.action)
        )
      }))
      .toSorted((a, b) => a.page.localeCompare(b.page));
  }, [catalog]);

  const mutation = useMutation({
    ...roleMutations.updatePermissions(),
    onSuccess: () => {
      toast.success('Role permissions updated');
      queryClient.invalidateQueries({ queryKey: roleQueries.all() });
      queryClient.invalidateQueries({ queryKey: ['auth', 'me'] });
    },
    onError: (error) => toast.error(error.message)
  });

  function toggle(permissionId: string) {
    if (locked) return;
    setSelected((current) => {
      const next = new Set(current);
      if (next.has(permissionId)) next.delete(permissionId);
      else next.add(permissionId);
      return next;
    });
  }

  if (rolesLoading || catalogLoading) {
    return <div className='bg-muted h-96 w-full animate-pulse rounded-lg' />;
  }

  return (
    <div className='grid gap-4 lg:grid-cols-[280px_1fr]'>
      <Card>
        <CardHeader>
          <CardTitle>Roles</CardTitle>
          <CardDescription>Select a role to edit its permissions.</CardDescription>
        </CardHeader>
        <CardContent className='space-y-2'>
          {roles.map((role) => (
            <button
              key={role.id}
              type='button'
              onClick={() => setSelectedRoleId(role.id)}
              className={cn(
                'hover:bg-muted flex w-full items-center justify-between rounded-lg border p-3 text-left transition-colors',
                selectedRoleId === role.id && 'border-primary bg-muted'
              )}
            >
              <div>
                <p className='font-medium'>{role.name}</p>
                <p className='text-muted-foreground text-xs'>Level {role.level}</p>
              </div>
              {role.level <= 1 ? (
                <Badge variant='default'>Full access</Badge>
              ) : (
                <Badge variant='outline'>Custom</Badge>
              )}
            </button>
          ))}
        </CardContent>
      </Card>

      <Card>
        <CardHeader className='flex flex-row items-start justify-between gap-4'>
          <div>
            <CardTitle>{selectedRole?.name ?? 'Permissions'}</CardTitle>
            <CardDescription>
              {locked
                ? 'This role is full access or you do not have permission to edit it.'
                : 'Toggle the pages and actions this role can access.'}
            </CardDescription>
          </div>
          <LoadingButton
            loading={mutation.isPending}
            disabled={locked || permissionsLoading}
            onClick={() =>
              selectedRoleId &&
              mutation.mutate({ roleId: selectedRoleId, permissionIds: Array.from(selected) })
            }
          >
            <Icons.check className='mr-1 size-4' />
            Save permissions
          </LoadingButton>
        </CardHeader>
        <CardContent>
          {permissionsLoading ? (
            <div className='bg-muted h-64 animate-pulse rounded-lg' />
          ) : (
            <div className='grid gap-4 md:grid-cols-2'>
              {groups.map((group) => (
                <div key={group.page} className='rounded-lg border p-4'>
                  <p className='mb-3 font-medium capitalize'>{group.page.replaceAll('_', ' ')}</p>
                  <div className='space-y-2'>
                    {group.permissions.map((permission) => (
                      <label
                        key={permission.id}
                        className='flex cursor-pointer items-center gap-2 text-sm'
                      >
                        <input
                          type='checkbox'
                          className='size-4'
                          checked={selected.has(permission.id)}
                          disabled={locked}
                          onChange={() => toggle(permission.id)}
                        />
                        <span>{permission.label}</span>
                        <span className='text-muted-foreground ml-auto font-mono text-[10px]'>
                          {permission.action}
                        </span>
                      </label>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
