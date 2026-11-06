'use client';
// oxlint-disable react/set-state-in-effect -- dialogs sync props into local form state when opened

import Link from 'next/link';
import { buttonVariants } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { useEffect, useMemo, useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { AlertModal } from '@/components/modal/alert-modal';
import { StatusBadge } from '@/components/status-badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
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
import { useAuth } from '@/features/auth/context/auth-provider';
import { formatDateTime } from '@/lib/format';
import { Money } from '@/components/money';
import { productQueries } from '@/features/products/api/queries';
import { orderMutations, orderQueries } from '../api/queries';
import type { Order, OrderItemInput } from '../api/types';

const SHIPPING_STATUS_OPTIONS = [
  { value: 'pending', label: 'Pending' },
  { value: 'picked_up', label: 'Picked up' },
  { value: 'in_transit', label: 'In transit' },
  { value: 'delivered', label: 'Delivered' },
  { value: 'returned', label: 'Returned' }
];

export function OrderDetailView({ orderId }: { orderId: string }) {
  const queryClient = useQueryClient();
  const { can } = useAuth();
  const canUpdate = can('orders', 'update');
  const canDelete = can('orders', 'delete');
  const [editOpen, setEditOpen] = useState(false);
  const [itemsOpen, setItemsOpen] = useState(false);
  const [shippingOpen, setShippingOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);

  const { data: order, isLoading, isError } = useQuery(orderQueries.detail(orderId));

  const invalidate = () => {
    queryClient.invalidateQueries({ queryKey: orderQueries.all() });
  };

  const statusMutation = useMutation({
    ...orderMutations.updateStatus(),
    onSuccess: () => {
      toast.success('Order status updated');
      invalidate();
    },
    onError: (error) => toast.error(error.message)
  });

  const paymentMutation = useMutation({
    ...orderMutations.updatePayment(),
    onSuccess: () => {
      toast.success('Payment updated');
      invalidate();
    },
    onError: (error) => toast.error(error.message)
  });

  const deleteMutation = useMutation({
    ...orderMutations.delete(),
    onSuccess: () => {
      toast.success('Order deleted');
      window.location.href = '/dashboard/orders';
    },
    onError: (error) => toast.error(error.message)
  });

  if (isLoading) {
    return <div className='bg-muted h-96 w-full animate-pulse rounded-lg' />;
  }

  if (isError || !order) {
    return (
      <div className='flex flex-col items-center gap-3 py-12'>
        <Icons.warning className='text-destructive size-8' />
        <p className='text-muted-foreground'>Order not found.</p>
        <Link href='/dashboard/orders' className={cn(buttonVariants({ variant: 'outline' }))}>
          Back to orders
        </Link>
      </div>
    );
  }

  const nextStatuses = getNextStatuses(order.status);

  return (
    <div className='space-y-4'>
      <div className='flex flex-col gap-3 md:flex-row md:items-start md:justify-between'>
        <div className='space-y-1'>
          <div className='flex items-center gap-2'>
            <h2 className='font-mono text-xl font-semibold'>{order.order_number}</h2>
            <StatusBadge value={order.status} />
            <StatusBadge value={order.payment_status} />
            <StatusBadge value={order.shipping_status} />
          </div>
          <p className='text-muted-foreground text-sm'>
            Created {formatDateTime(order.created_at)} · Stock{' '}
            {order.stock_deducted ? 'deducted' : 'not deducted'}
          </p>
        </div>
        <div className='flex flex-wrap gap-2'>
          {canUpdate &&
            nextStatuses.map((status) => (
              <Button
                key={status}
                size='sm'
                variant={status === 'cancelled' ? 'destructive' : 'default'}
                disabled={statusMutation.isPending}
                onClick={() => statusMutation.mutate({ id: order.id, status })}
              >
                {statusLabel(status)}
              </Button>
            ))}
          <Button
            size='sm'
            variant='outline'
            onClick={() => window.open(`/print/orders/${order.id}/invoice`, '_blank')}
          >
            <Icons.receipt className='mr-1 size-4' />
            Invoice
          </Button>
          <Button
            size='sm'
            variant='outline'
            onClick={() => window.open(`/print/orders/${order.id}/receipt`, '_blank')}
          >
            <Icons.receipt className='mr-1 size-4' />
            Receipt
          </Button>
          {canUpdate && (
            <>
              <Button size='sm' variant='outline' onClick={() => setEditOpen(true)}>
                Edit order
              </Button>
              {order.status === 'pending' && (
                <Button size='sm' variant='outline' onClick={() => setItemsOpen(true)}>
                  Edit items
                </Button>
              )}
              <Button size='sm' variant='outline' onClick={() => setShippingOpen(true)}>
                Update shipping
              </Button>
            </>
          )}
          {canDelete && (
            <Button size='sm' variant='destructive' onClick={() => setDeleteOpen(true)}>
              Delete
            </Button>
          )}
        </div>
      </div>

      <div className='grid gap-4 lg:grid-cols-[1fr_360px]'>
        <div className='space-y-4'>
          <Card>
            <CardHeader>
              <CardTitle>Items</CardTitle>
            </CardHeader>
            <CardContent className='p-0'>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Product</TableHead>
                    <TableHead>Variant</TableHead>
                    <TableHead>SKU</TableHead>
                    <TableHead className='text-right'>Price</TableHead>
                    <TableHead className='text-right'>Qty</TableHead>
                    <TableHead className='text-right'>Subtotal</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {order.items.map((item) => (
                    <TableRow key={item.id}>
                      <TableCell>{item.product_name}</TableCell>
                      <TableCell>{item.variant_label}</TableCell>
                      <TableCell className='font-mono text-xs'>{item.sku}</TableCell>
                      <TableCell className='text-right'>
                        <Money value={item.price} />
                      </TableCell>
                      <TableCell className='text-right'>{item.quantity}</TableCell>
                      <TableCell className='text-right'>
                        <Money value={item.subtotal} />
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Customer & shipping</CardTitle>
            </CardHeader>
            <CardContent className='grid gap-4 md:grid-cols-2'>
              <div>
                <p className='text-muted-foreground text-xs uppercase'>Recipient</p>
                <p className='font-medium'>{order.recipient_name}</p>
                <p className='text-sm'>{order.recipient_phone}</p>
              </div>
              <div>
                <p className='text-muted-foreground text-xs uppercase'>Courier</p>
                <p className='font-medium'>{order.courier || '-'}</p>
                <p className='text-sm'>{order.tracking_number || 'No tracking number'}</p>
              </div>
              <div className='md:col-span-2'>
                <p className='text-muted-foreground text-xs uppercase'>Address</p>
                <p className='text-sm'>
                  {order.shipping_address}
                  {order.shipping_city ? `, ${order.shipping_city}` : ''}
                  {order.shipping_province ? `, ${order.shipping_province}` : ''}
                  {order.shipping_postal_code ? ` ${order.shipping_postal_code}` : ''}
                </p>
              </div>
              <div className='md:col-span-2'>
                <p className='text-muted-foreground text-xs uppercase'>Notes</p>
                <p className='text-sm'>{order.notes || '-'}</p>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className='space-y-4'>
          <Card>
            <CardHeader>
              <CardTitle>Payment</CardTitle>
            </CardHeader>
            <CardContent className='space-y-3'>
              <div className='flex items-center justify-between text-sm'>
                <span className='text-muted-foreground'>Method</span>
                <span>{order.payment_method || '-'}</span>
              </div>
              <div className='flex items-center justify-between text-sm'>
                <span className='text-muted-foreground'>Paid at</span>
                <span>{formatDateTime(order.paid_at)}</span>
              </div>
              {canUpdate && (
                <div className='flex flex-wrap gap-2'>
                  <Button
                    size='sm'
                    variant='outline'
                    disabled={order.payment_status === 'paid' || paymentMutation.isPending}
                    onClick={() =>
                      paymentMutation.mutate({
                        id: order.id,
                        paymentStatus: 'paid',
                        paymentMethod: order.payment_method || 'transfer'
                      })
                    }
                  >
                    Mark paid
                  </Button>
                  <Button
                    size='sm'
                    variant='outline'
                    disabled={order.payment_status === 'unpaid' || paymentMutation.isPending}
                    onClick={() =>
                      paymentMutation.mutate({ id: order.id, paymentStatus: 'unpaid' })
                    }
                  >
                    Mark unpaid
                  </Button>
                  <Button
                    size='sm'
                    variant='outline'
                    disabled={order.payment_status === 'refunded' || paymentMutation.isPending}
                    onClick={() =>
                      paymentMutation.mutate({ id: order.id, paymentStatus: 'refunded' })
                    }
                  >
                    Refund
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Summary</CardTitle>
            </CardHeader>
            <CardContent className='space-y-2 text-sm'>
              <div className='flex justify-between'>
                <span className='text-muted-foreground'>Subtotal</span>
                <span>
                  <Money value={order.subtotal} />
                </span>
              </div>
              <div className='flex justify-between'>
                <span className='text-muted-foreground'>Discount</span>
                <span className='inline-flex items-center gap-0.5'>
                  -<Money value={order.discount_amount} />
                </span>
              </div>
              <div className='flex justify-between'>
                <span className='text-muted-foreground'>Shipping</span>
                <span>
                  <Money value={order.shipping_cost} />
                </span>
              </div>
              <div className='flex justify-between border-t pt-2 text-base font-semibold'>
                <span>Total</span>
                <span>
                  <Money value={order.total_amount} />
                </span>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      <OrderEditDialog open={editOpen} onOpenChange={setEditOpen} order={order} />
      <OrderItemsDialog open={itemsOpen} onOpenChange={setItemsOpen} order={order} />
      <ShippingDialog open={shippingOpen} onOpenChange={setShippingOpen} order={order} />
      <AlertModal
        isOpen={deleteOpen}
        onClose={() => setDeleteOpen(false)}
        onConfirm={() => deleteMutation.mutate(order.id)}
        loading={deleteMutation.isPending}
      />
    </div>
  );
}

function getNextStatuses(status: string): string[] {
  switch (status) {
    case 'pending':
      return ['confirmed', 'cancelled'];
    case 'confirmed':
      return ['processing', 'cancelled'];
    case 'processing':
      return ['shipped', 'cancelled'];
    case 'shipped':
      return ['completed', 'cancelled'];
    default:
      return [];
  }
}

function statusLabel(status: string) {
  return status.charAt(0).toUpperCase() + status.slice(1);
}

function OrderEditDialog({
  open,
  onOpenChange,
  order
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  order: Order;
}) {
  const queryClient = useQueryClient();
  const [recipientName, setRecipientName] = useState('');
  const [recipientPhone, setRecipientPhone] = useState('');
  const [shippingAddress, setShippingAddress] = useState('');
  const [shippingCity, setShippingCity] = useState('');
  const [shippingProvince, setShippingProvince] = useState('');
  const [shippingPostalCode, setShippingPostalCode] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('');
  const [courier, setCourier] = useState('');
  const [discountAmount, setDiscountAmount] = useState(0);
  const [shippingCost, setShippingCost] = useState(0);
  const [notes, setNotes] = useState('');

  useEffect(() => {
    if (!open) return;
    setRecipientName(order.recipient_name);
    setRecipientPhone(order.recipient_phone);
    setShippingAddress(order.shipping_address);
    setShippingCity(order.shipping_city);
    setShippingProvince(order.shipping_province);
    setShippingPostalCode(order.shipping_postal_code);
    setPaymentMethod(order.payment_method);
    setCourier(order.courier);
    setDiscountAmount(order.discount_amount);
    setShippingCost(order.shipping_cost);
    setNotes(order.notes);
  }, [open, order]);

  const mutation = useMutation({
    ...orderMutations.update(),
    onSuccess: () => {
      toast.success('Order updated');
      queryClient.invalidateQueries({ queryKey: orderQueries.all() });
      onOpenChange(false);
    },
    onError: (error) => toast.error(error.message)
  });

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className='sm:max-w-2xl'>
        <DialogHeader>
          <DialogTitle>Edit order</DialogTitle>
          <DialogDescription>Update recipient, shipping, and totals.</DialogDescription>
        </DialogHeader>
        <div className='grid gap-4 py-2 md:grid-cols-2'>
          <div className='space-y-2'>
            <Label>Recipient name</Label>
            <Input
              value={recipientName}
              onChange={(event) => setRecipientName(event.target.value)}
            />
            <FieldHint>Name shown on the shipping label.</FieldHint>
          </div>
          <div className='space-y-2'>
            <Label>Recipient phone</Label>
            <Input
              value={recipientPhone}
              onChange={(event) => setRecipientPhone(event.target.value)}
            />
            <FieldHint>Active number for courier confirmation.</FieldHint>
          </div>
          <div className='space-y-2 md:col-span-2'>
            <Label>Address</Label>
            <Textarea
              value={shippingAddress}
              onChange={(event) => setShippingAddress(event.target.value)}
              rows={3}
            />
            <FieldHint>Complete street address, including house number.</FieldHint>
          </div>
          <div className='space-y-2'>
            <Label>City</Label>
            <Input value={shippingCity} onChange={(event) => setShippingCity(event.target.value)} />
            <FieldHint>City used for shipping.</FieldHint>
          </div>
          <div className='space-y-2'>
            <Label>Province</Label>
            <Input
              value={shippingProvince}
              onChange={(event) => setShippingProvince(event.target.value)}
            />
            <FieldHint>Province used for shipping.</FieldHint>
          </div>
          <div className='space-y-2'>
            <Label>Postal code</Label>
            <Input
              value={shippingPostalCode}
              onChange={(event) => setShippingPostalCode(event.target.value)}
            />
            <FieldHint>Postal code for the shipping address.</FieldHint>
          </div>
          <div className='space-y-2'>
            <Label>Courier</Label>
            <Input value={courier} onChange={(event) => setCourier(event.target.value)} />
            <FieldHint>Courier name, for example JNE or J&T.</FieldHint>
          </div>
          <div className='space-y-2'>
            <Label>Payment method</Label>
            <Input
              value={paymentMethod}
              onChange={(event) => setPaymentMethod(event.target.value)}
            />
            <FieldHint>For example transfer, cash, or QRIS.</FieldHint>
          </div>
          <div className='space-y-2'>
            <Label>Discount</Label>
            <Input
              type='number'
              min={0}
              value={discountAmount}
              onChange={(event) => setDiscountAmount(Number(event.target.value) || 0)}
            />
            <FieldHint>Discount amount in rupiah.</FieldHint>
          </div>
          <div className='space-y-2'>
            <Label>Shipping cost</Label>
            <Input
              type='number'
              min={0}
              value={shippingCost}
              onChange={(event) => setShippingCost(Number(event.target.value) || 0)}
            />
            <FieldHint>Shipping fee in rupiah.</FieldHint>
          </div>
          <div className='space-y-2 md:col-span-2'>
            <Label>Notes</Label>
            <Textarea value={notes} onChange={(event) => setNotes(event.target.value)} rows={2} />
            <FieldHint>Internal order notes; not shown to customers.</FieldHint>
          </div>
        </div>
        <DialogFooter>
          <Button variant='outline' onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <LoadingButton
            loading={mutation.isPending}
            onClick={() =>
              mutation.mutate({
                id: order.id,
                payload: {
                  customer_id: order.customer_id,
                  recipient_name: recipientName.trim(),
                  recipient_phone: recipientPhone.trim(),
                  shipping_address: shippingAddress.trim(),
                  shipping_city: shippingCity.trim(),
                  shipping_province: shippingProvince.trim(),
                  shipping_postal_code: shippingPostalCode.trim(),
                  payment_method: paymentMethod.trim(),
                  courier: courier.trim(),
                  discount_amount: discountAmount,
                  shipping_cost: shippingCost,
                  notes: notes.trim()
                }
              })
            }
          >
            Save
          </LoadingButton>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function OrderItemsDialog({
  open,
  onOpenChange,
  order
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  order: Order;
}) {
  const queryClient = useQueryClient();
  const { data: productsData } = useQuery(
    productQueries.list({ page: 1, per_page: 100, status: 'active' })
  );
  const variants = useMemo(
    () =>
      (productsData?.items ?? []).flatMap((product) =>
        product.variants
          .filter((variant) => variant.is_active)
          .map((variant) => ({
            ...variant,
            productName: product.name
          }))
      ),
    [productsData]
  );
  const variantOptions = useMemo(
    () =>
      variants.map((variant) => ({
        value: variant.id,
        label: (
          <>
            {variant.productName} · {variant.size.name}/{variant.color.name} ·{' '}
            <Money value={variant.price} />
          </>
        )
      })),
    [variants]
  );
  const [items, setItems] = useState<OrderItemInput[]>([]);

  useEffect(() => {
    if (!open) return;
    setItems(
      order.items
        .filter((item) => item.variant_id)
        .map((item) => ({ variant_id: item.variant_id as string, quantity: item.quantity }))
    );
  }, [open, order]);

  const mutation = useMutation({
    ...orderMutations.updateItems(),
    onSuccess: () => {
      toast.success('Order items updated');
      queryClient.invalidateQueries({ queryKey: orderQueries.all() });
      onOpenChange(false);
    },
    onError: (error) => toast.error(error.message)
  });

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className='sm:max-w-2xl'>
        <DialogHeader>
          <DialogTitle>Edit items</DialogTitle>
          <DialogDescription>Only pending orders can be edited.</DialogDescription>
        </DialogHeader>
        <div className='space-y-3 py-2'>
          {items.map((item, index) => (
            <div
              key={`${item.variant_id}-${index}`}
              className='grid gap-2 md:grid-cols-[1fr_100px_auto]'
            >
              <div className='space-y-1'>
                <Label className='text-xs'>Variant</Label>
                <Select
                  items={variantOptions}
                  value={item.variant_id}
                  onValueChange={(value) =>
                    setItems((current) =>
                      current.map((candidate, candidateIndex) =>
                        candidateIndex === index
                          ? { ...candidate, variant_id: value ?? '' }
                          : candidate
                      )
                    )
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder='Select variant' />
                  </SelectTrigger>
                  <SelectContent>
                    {variantOptions.map((option) => (
                      <SelectItem key={option.value} value={option.value}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className='space-y-1'>
                <Label className='text-xs'>Qty</Label>
                <Input
                  type='number'
                  min={1}
                  value={item.quantity}
                  onChange={(event) =>
                    setItems((current) =>
                      current.map((candidate, candidateIndex) =>
                        candidateIndex === index
                          ? { ...candidate, quantity: Number(event.target.value) || 1 }
                          : candidate
                      )
                    )
                  }
                />
              </div>
              <Button
                variant='ghost'
                size='icon'
                onClick={() => setItems((current) => current.filter((_, i) => i !== index))}
              >
                <Icons.trash className='size-4' />
              </Button>
            </div>
          ))}
          <Button
            variant='outline'
            size='sm'
            onClick={() => setItems((current) => [...current, { variant_id: '', quantity: 1 }])}
          >
            <Icons.add className='mr-1 size-4' />
            Add item
          </Button>
        </div>
        <DialogFooter>
          <Button variant='outline' onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <LoadingButton
            loading={mutation.isPending}
            onClick={() =>
              mutation.mutate({
                id: order.id,
                payload: { items: items.filter((item) => item.variant_id && item.quantity > 0) }
              })
            }
          >
            Save items
          </LoadingButton>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function ShippingDialog({
  open,
  onOpenChange,
  order
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  order: Order;
}) {
  const queryClient = useQueryClient();
  const [shippingStatus, setShippingStatus] = useState('pending');
  const [courier, setCourier] = useState('');
  const [trackingNumber, setTrackingNumber] = useState('');

  useEffect(() => {
    if (!open) return;
    setShippingStatus(order.shipping_status);
    setCourier(order.courier);
    setTrackingNumber(order.tracking_number);
  }, [open, order]);

  const mutation = useMutation({
    ...orderMutations.updateShipping(),
    onSuccess: () => {
      toast.success('Shipping updated');
      queryClient.invalidateQueries({ queryKey: orderQueries.all() });
      onOpenChange(false);
    },
    onError: (error) => toast.error(error.message)
  });

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Update shipping</DialogTitle>
          <DialogDescription>Update courier, resi, and shipping status.</DialogDescription>
        </DialogHeader>
        <div className='space-y-4 py-2'>
          <div className='space-y-2'>
            <Label>Shipping status</Label>
            <Select
              items={SHIPPING_STATUS_OPTIONS}
              value={shippingStatus}
              onValueChange={(value) => setShippingStatus(value ?? 'pending')}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {SHIPPING_STATUS_OPTIONS.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <FieldHint>Current delivery stage for this order.</FieldHint>
          </div>
          <div className='space-y-2'>
            <Label>Courier</Label>
            <Input value={courier} onChange={(event) => setCourier(event.target.value)} />
            <FieldHint>Courier name, for example JNE or J&T.</FieldHint>
          </div>
          <div className='space-y-2'>
            <Label>Tracking number</Label>
            <Input
              value={trackingNumber}
              onChange={(event) => setTrackingNumber(event.target.value)}
            />
            <FieldHint>Courier tracking number or receipt ID.</FieldHint>
          </div>
        </div>
        <DialogFooter>
          <Button variant='outline' onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <LoadingButton
            loading={mutation.isPending}
            onClick={() =>
              mutation.mutate({
                id: order.id,
                shippingStatus,
                courier: courier.trim(),
                trackingNumber: trackingNumber.trim()
              })
            }
          >
            Save
          </LoadingButton>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
