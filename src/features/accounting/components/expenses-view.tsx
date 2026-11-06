'use client';
// oxlint-disable react/set-state-in-effect -- dialogs sync props into local form state when opened

import { useEffect, useMemo, useRef, useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { AlertModal } from '@/components/modal/alert-modal';
import { SimplePagination } from '@/components/simple-pagination';
import { StatusBadge } from '@/components/status-badge';
import { Button, buttonVariants } from '@/components/ui/button';
import { cn } from '@/lib/utils';
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
import { Textarea } from '@/components/ui/textarea';
import { Icons } from '@/components/icons';
import { FieldHint } from '@/components/form-field-hint';
import { currentMonth, formatDateOnly } from '@/lib/format';
import { Money } from '@/components/money';
import { MAX_RECEIPT_SIZE, MAX_UPLOAD_LABEL } from '@/lib/upload';
import { expenseMutations, expenseQueries } from '../api/queries';
import type { Expense, ExpenseCategory, ExpenseItemInput } from '../api/types';

const PER_PAGE = 10;
const CATEGORIES: ExpenseCategory[] = [
  'operational',
  'production',
  'marketing',
  'restock',
  'other'
];

const CATEGORY_OPTIONS = CATEGORIES.map((value) => ({
  value,
  label: value.charAt(0).toUpperCase() + value.slice(1)
}));

const CATEGORY_FILTER_OPTIONS = [{ value: 'all', label: 'All categories' }, ...CATEGORY_OPTIONS];

type ItemDraft = ExpenseItemInput & { key: string };

function emptyItem(): ItemDraft {
  return { key: crypto.randomUUID(), name: '', quantity: 1, unit: 'pcs', unit_price: 0 };
}

export function ExpensesView() {
  const queryClient = useQueryClient();
  const [page, setPage] = useState(1);
  const [month, setMonth] = useState(currentMonth());
  const [category, setCategory] = useState('all');
  const [search, setSearch] = useState('');
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<Expense | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Expense | null>(null);

  const filters = {
    page,
    per_page: PER_PAGE,
    month: month || undefined,
    category: category === 'all' ? undefined : category,
    search: search || undefined
  };
  const { data, isLoading } = useQuery(expenseQueries.list(filters));

  const deleteMutation = useMutation({
    ...expenseMutations.delete(),
    onSuccess: () => {
      toast.success('Expense deleted');
      setDeleteTarget(null);
      queryClient.invalidateQueries({ queryKey: expenseQueries.all() });
    },
    onError: (error) => toast.error(error.message)
  });

  const items = data?.items ?? [];
  const pagination = data?.pagination;

  return (
    <div className='space-y-4'>
      <div className='grid grid-cols-1 gap-2 sm:grid-cols-2 xl:flex xl:items-center'>
        <Input
          type='month'
          value={month}
          onChange={(event) => {
            setMonth(event.target.value);
            setPage(1);
          }}
          className='w-full sm:w-44'
        />
        <div className='relative min-w-0 sm:col-span-2 xl:min-w-64 xl:flex-1'>
          <Icons.search className='text-muted-foreground absolute top-1/2 left-3 size-4 -translate-y-1/2' />
          <Input
            value={search}
            onChange={(event) => {
              setSearch(event.target.value);
              setPage(1);
            }}
            placeholder='Search title or vendor...'
            className='pl-9'
          />
        </div>
        <Select
          items={CATEGORY_FILTER_OPTIONS}
          value={category}
          onValueChange={(value) => {
            setCategory(value ?? 'all');
            setPage(1);
          }}
        >
          <SelectTrigger className='w-full sm:w-44'>
            <SelectValue placeholder='Category' />
          </SelectTrigger>
          <SelectContent>
            {CATEGORY_FILTER_OPTIONS.map((option) => (
              <SelectItem key={option.value} value={option.value}>
                {option.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Button
          className='w-full xl:w-auto'
          onClick={() => {
            setEditing(null);
            setDialogOpen(true);
          }}
        >
          <Icons.add className='mr-1 size-4' />
          Add expense
        </Button>
      </div>

      <Card>
        <CardContent className='p-0'>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Date</TableHead>
                <TableHead>Title</TableHead>
                <TableHead>Category</TableHead>
                <TableHead>Vendor</TableHead>
                <TableHead className='text-right'>Total</TableHead>
                <TableHead>Receipt</TableHead>
                <TableHead className='w-24 text-right'>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading && (
                <TableRow>
                  <TableCell colSpan={7} className='text-muted-foreground h-24 text-center'>
                    Loading expenses...
                  </TableCell>
                </TableRow>
              )}
              {!isLoading && items.length === 0 && (
                <TableRow>
                  <TableCell colSpan={7} className='text-muted-foreground h-24 text-center'>
                    No expenses found.
                  </TableCell>
                </TableRow>
              )}
              {items.map((expense) => (
                <TableRow key={expense.id}>
                  <TableCell className='text-xs'>{formatDateOnly(expense.expense_date)}</TableCell>
                  <TableCell className='font-medium'>{expense.title}</TableCell>
                  <TableCell>
                    <StatusBadge value={expense.category} />
                  </TableCell>
                  <TableCell>{expense.vendor || '-'}</TableCell>
                  <TableCell className='text-right'>
                    <Money value={expense.total_amount} />
                  </TableCell>
                  <TableCell>
                    <ReceiptActions expense={expense} />
                  </TableCell>
                  <TableCell className='text-right'>
                    <div className='flex justify-end gap-1'>
                      <Button
                        variant='ghost'
                        size='icon'
                        onClick={() => {
                          setEditing(expense);
                          setDialogOpen(true);
                        }}
                      >
                        <Icons.edit className='size-4' />
                      </Button>
                      <Button variant='ghost' size='icon' onClick={() => setDeleteTarget(expense)}>
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

      <ExpenseDialog open={dialogOpen} onOpenChange={setDialogOpen} expense={editing} />

      <AlertModal
        isOpen={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={() => deleteTarget && deleteMutation.mutate(deleteTarget.id)}
        loading={deleteMutation.isPending}
      />
    </div>
  );
}

function ReceiptActions({ expense }: { expense: Expense }) {
  const queryClient = useQueryClient();
  const inputRef = useRef<HTMLInputElement>(null);

  const uploadMutation = useMutation({
    ...expenseMutations.uploadReceipt(),
    onSuccess: () => {
      toast.success('Receipt uploaded');
      queryClient.invalidateQueries({ queryKey: expenseQueries.all() });
    },
    onError: (error) => toast.error(error.message)
  });

  const deleteMutation = useMutation({
    ...expenseMutations.deleteReceipt(),
    onSuccess: () => {
      toast.success('Receipt deleted');
      queryClient.invalidateQueries({ queryKey: expenseQueries.all() });
    },
    onError: (error) => toast.error(error.message)
  });

  return (
    <div className='flex items-center gap-1'>
      <input
        ref={inputRef}
        type='file'
        accept='image/jpeg,image/png,application/pdf'
        className='hidden'
        onChange={(event) => {
          const file = event.target.files?.[0];
          if (file) {
            if (file.size > MAX_RECEIPT_SIZE) {
              toast.error(`Receipt exceeds the ${MAX_UPLOAD_LABEL} limit.`);
            } else {
              uploadMutation.mutate({ id: expense.id, file });
            }
          }
          if (inputRef.current) inputRef.current.value = '';
        }}
      />
      {expense.receipt_url?.startsWith('http') ? (
        <>
          <a
            href={expense.receipt_url}
            target='_blank'
            rel='noreferrer'
            aria-label='Open receipt'
            title='Open receipt'
            className={cn(buttonVariants({ variant: 'ghost', size: 'icon' }))}
          >
            <Icons.externalLink className='size-4' />
          </a>
          <Button
            variant='ghost'
            size='icon'
            aria-label='Delete receipt'
            title='Delete receipt'
            disabled={deleteMutation.isPending}
            onClick={() => deleteMutation.mutate(expense.id)}
          >
            <Icons.trash className='size-4' />
          </Button>
        </>
      ) : (
        <Button
          variant='ghost'
          size='sm'
          disabled={uploadMutation.isPending}
          title='Upload receipt (JPEG, PNG, or PDF, max 10 MB)'
          onClick={() => inputRef.current?.click()}
        >
          <Icons.upload className='mr-1 size-4' />
          Upload
        </Button>
      )}
    </div>
  );
}

function ExpenseDialog({
  open,
  onOpenChange,
  expense
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  expense: Expense | null;
}) {
  const queryClient = useQueryClient();
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState<ExpenseCategory>('operational');
  const [vendor, setVendor] = useState('');
  const [expenseDate, setExpenseDate] = useState(currentDate());
  const [paymentMethod, setPaymentMethod] = useState('cash');
  const [notes, setNotes] = useState('');
  const [items, setItems] = useState<ItemDraft[]>([emptyItem()]);
  const [manualTotal, setManualTotal] = useState(0);

  useEffect(() => {
    if (!open) return;
    setTitle(expense?.title ?? '');
    setCategory(expense?.category ?? 'operational');
    setVendor(expense?.vendor ?? '');
    setExpenseDate(expense?.expense_date ?? currentDate());
    setPaymentMethod(expense?.payment_method ?? 'cash');
    setNotes(expense?.notes ?? '');
    setItems(
      expense?.items.length
        ? expense.items.map((item) => ({
            key: item.id,
            name: item.name,
            quantity: item.quantity,
            unit: item.unit,
            unit_price: item.unit_price
          }))
        : [emptyItem()]
    );
    setManualTotal(expense && expense.items.length === 0 ? expense.total_amount : 0);
  }, [open, expense]);

  const computedTotal = useMemo(
    () => items.reduce((total, item) => total + Math.round(item.quantity * item.unit_price), 0),
    [items]
  );
  const total = items.length > 0 ? computedTotal : manualTotal;

  const createMutation = useMutation({
    ...expenseMutations.create(),
    onSuccess: () => {
      toast.success('Expense created');
      queryClient.invalidateQueries({ queryKey: expenseQueries.all() });
      onOpenChange(false);
    },
    onError: (error) => toast.error(error.message)
  });

  const updateMutation = useMutation({
    ...expenseMutations.update(),
    onSuccess: () => {
      toast.success('Expense updated');
      queryClient.invalidateQueries({ queryKey: expenseQueries.all() });
      onOpenChange(false);
    },
    onError: (error) => toast.error(error.message)
  });

  const pending = createMutation.isPending || updateMutation.isPending;

  function submit() {
    if (!title.trim() || !expenseDate) {
      toast.error('Title and expense date are required');
      return;
    }
    const payload = {
      title: title.trim(),
      category,
      vendor: vendor.trim(),
      expense_date: expenseDate,
      payment_method: paymentMethod.trim(),
      notes: notes.trim(),
      items: items
        .filter((item) => item.name.trim())
        .map(({ key: _key, ...item }) => ({
          ...item,
          name: item.name.trim(),
          quantity: Number(item.quantity) || 0,
          unit_price: Number(item.unit_price) || 0
        })),
      total_amount: manualTotal
    };
    if (expense) {
      updateMutation.mutate({ id: expense.id, payload });
    } else {
      createMutation.mutate(payload);
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className='sm:max-w-3xl'>
        <DialogHeader>
          <DialogTitle>{expense ? 'Edit expense' : 'Add expense'}</DialogTitle>
          <DialogDescription>
            Add line items or fill a manual total if there are no items.
          </DialogDescription>
        </DialogHeader>
        <div className='grid gap-4 py-2 md:grid-cols-2'>
          <div className='space-y-2'>
            <Label>Title</Label>
            <Input value={title} onChange={(event) => setTitle(event.target.value)} />
            <FieldHint>Short description of the expense.</FieldHint>
          </div>
          <div className='space-y-2'>
            <Label>Category</Label>
            <Select
              items={CATEGORY_OPTIONS}
              value={category}
              onValueChange={(value) => setCategory((value ?? 'operational') as ExpenseCategory)}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {CATEGORY_OPTIONS.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <FieldHint>Used for expense reports and grouping.</FieldHint>
          </div>
          <div className='space-y-2'>
            <Label>Vendor</Label>
            <Input value={vendor} onChange={(event) => setVendor(event.target.value)} />
            <FieldHint>Store or vendor name; optional.</FieldHint>
          </div>
          <div className='space-y-2'>
            <Label>Date</Label>
            <Input
              type='date'
              value={expenseDate}
              onChange={(event) => setExpenseDate(event.target.value)}
            />
            <FieldHint>Date the expense occurred.</FieldHint>
          </div>
          <div className='space-y-2'>
            <Label>Payment method</Label>
            <Input
              value={paymentMethod}
              onChange={(event) => setPaymentMethod(event.target.value)}
            />
            <FieldHint>For example cash, transfer, or QRIS.</FieldHint>
          </div>
          <div className='space-y-2 md:col-span-2'>
            <Label>Notes</Label>
            <Textarea value={notes} onChange={(event) => setNotes(event.target.value)} rows={2} />
            <FieldHint>Optional internal notes.</FieldHint>
          </div>
        </div>

        <div className='space-y-3'>
          <div className='flex items-center justify-between'>
            <h3 className='font-medium'>Items</h3>
            <Button
              size='sm'
              variant='outline'
              onClick={() => setItems((current) => [...current, emptyItem()])}
            >
              <Icons.add className='mr-1 size-4' />
              Add item
            </Button>
          </div>
          {items.map((item) => (
            <div key={item.key} className='grid gap-2 md:grid-cols-[1fr_80px_80px_100px_auto]'>
              <div className='space-y-1'>
                <Label className='text-xs'>Item name</Label>
                <Input
                  value={item.name}
                  placeholder='e.g. Fabric'
                  onChange={(event) =>
                    setItems((current) =>
                      current.map((candidate) =>
                        candidate.key === item.key
                          ? { ...candidate, name: event.target.value }
                          : candidate
                      )
                    )
                  }
                />
              </div>
              <div className='space-y-1'>
                <Label className='text-xs'>Qty</Label>
                <Input
                  type='number'
                  min={0}
                  step='0.01'
                  value={item.quantity}
                  onChange={(event) =>
                    setItems((current) =>
                      current.map((candidate) =>
                        candidate.key === item.key
                          ? { ...candidate, quantity: Number(event.target.value) || 0 }
                          : candidate
                      )
                    )
                  }
                />
              </div>
              <div className='space-y-1'>
                <Label className='text-xs'>Unit</Label>
                <Input
                  value={item.unit}
                  placeholder='pcs'
                  onChange={(event) =>
                    setItems((current) =>
                      current.map((candidate) =>
                        candidate.key === item.key
                          ? { ...candidate, unit: event.target.value }
                          : candidate
                      )
                    )
                  }
                />
              </div>
              <div className='space-y-1'>
                <Label className='text-xs'>Unit price</Label>
                <Input
                  type='number'
                  min={0}
                  value={item.unit_price}
                  onChange={(event) =>
                    setItems((current) =>
                      current.map((candidate) =>
                        candidate.key === item.key
                          ? { ...candidate, unit_price: Number(event.target.value) || 0 }
                          : candidate
                      )
                    )
                  }
                />
              </div>
              <Button
                variant='ghost'
                size='icon'
                onClick={() =>
                  setItems((current) => current.filter((candidate) => candidate.key !== item.key))
                }
              >
                <Icons.trash className='size-4' />
              </Button>
            </div>
          ))}
          {items.length === 0 && (
            <div className='space-y-2'>
              <Label>Manual total</Label>
              <Input
                type='number'
                min={0}
                value={manualTotal}
                onChange={(event) => setManualTotal(Number(event.target.value) || 0)}
              />
              <FieldHint>Use this only when the expense has no line items.</FieldHint>
            </div>
          )}
          <div className='flex items-center justify-end gap-1 text-sm font-semibold'>
            Total: <Money value={total} />
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

function currentDate() {
  return new Intl.DateTimeFormat('en-CA', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    timeZone: 'Asia/Jakarta'
  }).format(new Date());
}
