'use client';
// oxlint-disable react/set-state-in-effect -- dialogs sync props into local form state when opened

import { useEffect, useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { AlertModal } from '@/components/modal/alert-modal';
import { SimplePagination } from '@/components/simple-pagination';
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
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from '@/components/ui/table';
import { Textarea } from '@/components/ui/textarea';
import { Icons } from '@/components/icons';
import { FieldHint } from '@/components/form-field-hint';
import { customerMutations, customerQueries } from '../api/queries';
import type { Customer } from '../api/types';

const PER_PAGE = 10;

export function CustomersView() {
  const queryClient = useQueryClient();
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<Customer | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Customer | null>(null);

  const filters = { page, per_page: PER_PAGE, search: search || undefined };
  const { data, isLoading } = useQuery(customerQueries.list(filters));

  const deleteMutation = useMutation({
    ...customerMutations.delete(),
    onSuccess: () => {
      toast.success('Customer deleted');
      setDeleteTarget(null);
      queryClient.invalidateQueries({ queryKey: customerQueries.all() });
    },
    onError: (error) => toast.error(error.message)
  });

  const items = data?.items ?? [];
  const pagination = data?.pagination;

  return (
    <div className='space-y-4'>
      <div className='grid grid-cols-1 gap-2 sm:grid-cols-[1fr_auto] sm:items-center'>
        <div className='relative min-w-0'>
          <Icons.search className='text-muted-foreground absolute top-1/2 left-3 size-4 -translate-y-1/2' />
          <Input
            value={search}
            onChange={(event) => {
              setSearch(event.target.value);
              setPage(1);
            }}
            placeholder='Search name, phone, or email...'
            className='pl-9'
          />
        </div>
        <Button
          className='w-full sm:w-auto'
          onClick={() => {
            setEditing(null);
            setDialogOpen(true);
          }}
        >
          <Icons.add className='mr-1 size-4' />
          Add customer
        </Button>
      </div>

      <Card>
        <CardContent className='p-0'>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Customer</TableHead>
                <TableHead>Phone</TableHead>
                <TableHead>City</TableHead>
                <TableHead>Address</TableHead>
                <TableHead className='w-24 text-right'>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading && (
                <TableRow>
                  <TableCell colSpan={5} className='text-muted-foreground h-24 text-center'>
                    Loading customers...
                  </TableCell>
                </TableRow>
              )}
              {!isLoading && items.length === 0 && (
                <TableRow>
                  <TableCell colSpan={5} className='text-muted-foreground h-24 text-center'>
                    No customers found.
                  </TableCell>
                </TableRow>
              )}
              {items.map((customer) => (
                <TableRow key={customer.id}>
                  <TableCell>
                    <p className='font-medium'>{customer.name}</p>
                    <p className='text-muted-foreground text-xs'>{customer.email || '-'}</p>
                  </TableCell>
                  <TableCell>{customer.phone}</TableCell>
                  <TableCell>{customer.city || '-'}</TableCell>
                  <TableCell className='text-muted-foreground max-w-80 truncate'>
                    {customer.address || '-'}
                  </TableCell>
                  <TableCell className='text-right'>
                    <div className='flex justify-end gap-1'>
                      <Button
                        variant='ghost'
                        size='icon'
                        onClick={() => {
                          setEditing(customer);
                          setDialogOpen(true);
                        }}
                      >
                        <Icons.edit className='size-4' />
                      </Button>
                      <Button variant='ghost' size='icon' onClick={() => setDeleteTarget(customer)}>
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

      <CustomerDialog open={dialogOpen} onOpenChange={setDialogOpen} customer={editing} />

      <AlertModal
        isOpen={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={() => deleteTarget && deleteMutation.mutate(deleteTarget.id)}
        loading={deleteMutation.isPending}
      />
    </div>
  );
}

function CustomerDialog({
  open,
  onOpenChange,
  customer
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  customer: Customer | null;
}) {
  const queryClient = useQueryClient();
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [address, setAddress] = useState('');
  const [city, setCity] = useState('');
  const [province, setProvince] = useState('');
  const [postalCode, setPostalCode] = useState('');
  const [notes, setNotes] = useState('');

  useEffect(() => {
    if (!open) return;
    setName(customer?.name ?? '');
    setPhone(customer?.phone ?? '');
    setEmail(customer?.email ?? '');
    setAddress(customer?.address ?? '');
    setCity(customer?.city ?? '');
    setProvince(customer?.province ?? '');
    setPostalCode(customer?.postal_code ?? '');
    setNotes(customer?.notes ?? '');
  }, [open, customer]);

  const createMutation = useMutation({
    ...customerMutations.create(),
    onSuccess: () => {
      toast.success('Customer created');
      queryClient.invalidateQueries({ queryKey: customerQueries.all() });
      onOpenChange(false);
    },
    onError: (error) => toast.error(error.message)
  });

  const updateMutation = useMutation({
    ...customerMutations.update(),
    onSuccess: () => {
      toast.success('Customer updated');
      queryClient.invalidateQueries({ queryKey: customerQueries.all() });
      onOpenChange(false);
    },
    onError: (error) => toast.error(error.message)
  });

  const pending = createMutation.isPending || updateMutation.isPending;

  function submit() {
    if (!name.trim() || !phone.trim()) {
      toast.error('Name and phone are required');
      return;
    }
    const payload = {
      name: name.trim(),
      phone: phone.trim(),
      email: email.trim(),
      address: address.trim(),
      city: city.trim(),
      province: province.trim(),
      postal_code: postalCode.trim(),
      notes: notes.trim()
    };
    if (customer) {
      updateMutation.mutate({ id: customer.id, payload });
    } else {
      createMutation.mutate(payload);
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{customer ? 'Edit customer' : 'Add customer'}</DialogTitle>
          <DialogDescription>Customer data is used for order shipping details.</DialogDescription>
        </DialogHeader>
        <div className='grid gap-4 py-2 md:grid-cols-2'>
          <div className='space-y-2'>
            <Label>Name</Label>
            <Input value={name} onChange={(event) => setName(event.target.value)} />
            <FieldHint>Full name of the customer or recipient.</FieldHint>
          </div>
          <div className='space-y-2'>
            <Label>Phone</Label>
            <Input value={phone} onChange={(event) => setPhone(event.target.value)} />
            <FieldHint>Active phone number for delivery updates.</FieldHint>
          </div>
          <div className='space-y-2'>
            <Label>Email</Label>
            <Input type='email' value={email} onChange={(event) => setEmail(event.target.value)} />
            <FieldHint>Optional email address for contact.</FieldHint>
          </div>
          <div className='space-y-2'>
            <Label>City</Label>
            <Input value={city} onChange={(event) => setCity(event.target.value)} />
            <FieldHint>City used for shipping.</FieldHint>
          </div>
          <div className='space-y-2'>
            <Label>Province</Label>
            <Input value={province} onChange={(event) => setProvince(event.target.value)} />
            <FieldHint>Province used for shipping.</FieldHint>
          </div>
          <div className='space-y-2'>
            <Label>Postal code</Label>
            <Input value={postalCode} onChange={(event) => setPostalCode(event.target.value)} />
            <FieldHint>Postal code for the shipping address.</FieldHint>
          </div>
          <div className='space-y-2 md:col-span-2'>
            <Label>Address</Label>
            <Textarea
              value={address}
              onChange={(event) => setAddress(event.target.value)}
              rows={3}
            />
            <FieldHint>Complete street address, including house number.</FieldHint>
          </div>
          <div className='space-y-2 md:col-span-2'>
            <Label>Notes</Label>
            <Textarea value={notes} onChange={(event) => setNotes(event.target.value)} rows={2} />
            <FieldHint>Internal notes; not shown to customers.</FieldHint>
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
