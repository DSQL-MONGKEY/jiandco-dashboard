'use client';
// oxlint-disable react/set-state-in-effect -- dialogs sync props into local form state when opened

import { useEffect, useMemo, useState } from 'react';
import { useMutation, useQuery } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
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
import { Textarea } from '@/components/ui/textarea';
import { Icons } from '@/components/icons';
import { FieldHint } from '@/components/form-field-hint';
import { Money } from '@/components/money';
import { customerQueries } from '@/features/customers/api/queries';
import { productQueries } from '@/features/products/api/queries';
import { orderMutations } from '../api/queries';

type ItemDraft = {
  key: string;
  variantId: string;
  quantity: number;
};

export function OrderForm() {
  const router = useRouter();
  const { data: customersData } = useQuery(customerQueries.list({ page: 1, per_page: 100 }));
  const { data: productsData } = useQuery(
    productQueries.list({ page: 1, per_page: 100, status: 'active' })
  );

  const customers = customersData?.items ?? [];
  const products = useMemo(() => productsData?.items ?? [], [productsData?.items]);
  const variants = useMemo(
    () =>
      products.flatMap((product) =>
        product.variants
          .filter((variant) => variant.is_active)
          .map((variant) => ({
            ...variant,
            productName: product.name
          }))
      ),
    [products]
  );
  const customerOptions = customers.map((customer) => ({
    value: customer.id,
    label: `${customer.name} · ${customer.phone}`
  }));
  const variantOptions = useMemo(
    () =>
      variants.map((candidate) => ({
        value: candidate.id,
        label: (
          <>
            {candidate.productName} · {candidate.size.name}/{candidate.color.name} ·{' '}
            <Money value={candidate.price} /> · stock {candidate.stock}
          </>
        )
      })),
    [variants]
  );

  const [customerId, setCustomerId] = useState('');
  const [items, setItems] = useState<ItemDraft[]>([]);
  const [recipientName, setRecipientName] = useState('');
  const [recipientPhone, setRecipientPhone] = useState('');
  const [shippingAddress, setShippingAddress] = useState('');
  const [shippingCity, setShippingCity] = useState('');
  const [shippingProvince, setShippingProvince] = useState('');
  const [shippingPostalCode, setShippingPostalCode] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('transfer');
  const [courier, setCourier] = useState('JNE');
  const [discountAmount, setDiscountAmount] = useState(0);
  const [shippingCost, setShippingCost] = useState(0);
  const [notes, setNotes] = useState('');

  const selectedCustomer = customers.find((customer) => customer.id === customerId);

  useEffect(() => {
    if (!selectedCustomer) return;
    setRecipientName((current) => current || selectedCustomer.name);
    setRecipientPhone((current) => current || selectedCustomer.phone);
    setShippingAddress((current) => current || selectedCustomer.address);
    setShippingCity((current) => current || selectedCustomer.city);
    setShippingProvince((current) => current || selectedCustomer.province);
    setShippingPostalCode((current) => current || selectedCustomer.postal_code);
  }, [selectedCustomer]);

  const subtotal = items.reduce((total, item) => {
    const variant = variants.find((candidate) => candidate.id === item.variantId);
    return total + (variant?.price ?? 0) * item.quantity;
  }, 0);
  const total = subtotal - discountAmount + shippingCost;

  const createMutation = useMutation({
    ...orderMutations.create(),
    onSuccess: (order) => {
      toast.success('Order created');
      router.push(`/dashboard/orders/${order.id}`);
    },
    onError: (error) => toast.error(error.message)
  });

  function addItem() {
    setItems((current) => [...current, { key: crypto.randomUUID(), variantId: '', quantity: 1 }]);
  }

  function updateItem(key: string, patch: Partial<ItemDraft>) {
    setItems((current) => current.map((item) => (item.key === key ? { ...item, ...patch } : item)));
  }

  function submit() {
    if (!customerId) {
      toast.error('Customer is required');
      return;
    }
    const validItems = items.filter((item) => item.variantId && item.quantity > 0);
    if (validItems.length === 0) {
      toast.error('Add at least one item');
      return;
    }
    if (!recipientName.trim() || !recipientPhone.trim() || !shippingAddress.trim()) {
      toast.error('Recipient name, phone, and shipping address are required');
      return;
    }

    createMutation.mutate({
      customer_id: customerId,
      items: validItems.map((item) => ({
        variant_id: item.variantId,
        quantity: item.quantity
      })),
      recipient_name: recipientName.trim(),
      recipient_phone: recipientPhone.trim(),
      shipping_address: shippingAddress.trim(),
      shipping_city: shippingCity.trim(),
      shipping_province: shippingProvince.trim(),
      shipping_postal_code: shippingPostalCode.trim(),
      payment_method: paymentMethod,
      courier,
      discount_amount: discountAmount,
      shipping_cost: shippingCost,
      notes: notes.trim()
    });
  }

  return (
    <div className='grid gap-4 lg:grid-cols-[1fr_360px]'>
      <div className='space-y-4'>
        <Card>
          <CardHeader>
            <CardTitle>Customer</CardTitle>
          </CardHeader>
          <CardContent>
            <Select
              items={customerOptions}
              value={customerId}
              onValueChange={(value) => setCustomerId(value ?? '')}
            >
              <SelectTrigger>
                <SelectValue placeholder='Select customer' />
              </SelectTrigger>
              <SelectContent>
                {customerOptions.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <FieldHint className='mt-2'>
              Choose a saved customer to reuse their contact details.
            </FieldHint>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className='flex flex-row items-center justify-between'>
            <CardTitle>Items</CardTitle>
            <Button size='sm' variant='outline' onClick={addItem}>
              <Icons.add className='mr-1 size-4' />
              Add item
            </Button>
          </CardHeader>
          <CardContent className='space-y-3'>
            {items.length === 0 && <p className='text-muted-foreground text-sm'>No items added.</p>}
            {items.map((item) => {
              const variant = variants.find((candidate) => candidate.id === item.variantId);
              return (
                <div
                  key={item.key}
                  className='grid gap-3 rounded-lg border p-3 md:grid-cols-[1fr_100px_120px_auto]'
                >
                  <div className='space-y-1'>
                    <Label className='text-xs'>Variant</Label>
                    <Select
                      items={variantOptions}
                      value={item.variantId}
                      onValueChange={(value) => updateItem(item.key, { variantId: value ?? '' })}
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
                        updateItem(item.key, { quantity: Number(event.target.value) || 1 })
                      }
                    />
                  </div>
                  <div className='flex items-center justify-end text-sm font-medium'>
                    <Money value={(variant?.price ?? 0) * item.quantity} />
                  </div>
                  <Button
                    variant='ghost'
                    size='icon'
                    onClick={() =>
                      setItems((current) =>
                        current.filter((candidate) => candidate.key !== item.key)
                      )
                    }
                  >
                    <Icons.trash className='size-4' />
                  </Button>
                </div>
              );
            })}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Shipping</CardTitle>
          </CardHeader>
          <CardContent className='grid gap-4 md:grid-cols-2'>
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
              <Input
                value={shippingCity}
                onChange={(event) => setShippingCity(event.target.value)}
              />
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
          </CardContent>
        </Card>
      </div>

      <Card className='h-fit'>
        <CardHeader>
          <CardTitle>Summary</CardTitle>
        </CardHeader>
        <CardContent className='space-y-4'>
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
          <div className='space-y-2'>
            <Label>Notes</Label>
            <Textarea value={notes} onChange={(event) => setNotes(event.target.value)} rows={3} />
            <FieldHint>Internal order notes; not shown to customers.</FieldHint>
          </div>
          <div className='space-y-1 border-t pt-3 text-sm'>
            <div className='flex justify-between'>
              <span className='text-muted-foreground'>Subtotal</span>
              <span>
                <Money value={subtotal} />
              </span>
            </div>
            <div className='flex justify-between'>
              <span className='text-muted-foreground'>Discount</span>
              <span className='inline-flex items-center gap-0.5'>
                -<Money value={discountAmount} />
              </span>
            </div>
            <div className='flex justify-between'>
              <span className='text-muted-foreground'>Shipping</span>
              <span>
                <Money value={shippingCost} />
              </span>
            </div>
            <div className='flex justify-between text-base font-semibold'>
              <span>Total</span>
              <span>
                <Money value={total} />
              </span>
            </div>
          </div>
          <LoadingButton loading={createMutation.isPending} className='w-full' onClick={submit}>
            Create order
          </LoadingButton>
        </CardContent>
      </Card>
    </div>
  );
}
