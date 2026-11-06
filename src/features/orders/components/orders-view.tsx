'use client';

import { useState } from 'react';
import Link from 'next/link';
import { buttonVariants } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { useQuery } from '@tanstack/react-query';
import { SimplePagination } from '@/components/simple-pagination';
import { StatusBadge } from '@/components/status-badge';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
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
import { formatDateOnly } from '@/lib/format';
import { Money } from '@/components/money';
import { orderQueries } from '../api/queries';

const PER_PAGE = 10;

const ORDER_STATUS_OPTIONS = [
  { value: 'all', label: 'All order status' },
  { value: 'pending', label: 'Pending' },
  { value: 'confirmed', label: 'Confirmed' },
  { value: 'processing', label: 'Processing' },
  { value: 'shipped', label: 'Shipped' },
  { value: 'completed', label: 'Completed' },
  { value: 'cancelled', label: 'Cancelled' }
];

const PAYMENT_STATUS_OPTIONS = [
  { value: 'all', label: 'All payment' },
  { value: 'unpaid', label: 'Unpaid' },
  { value: 'paid', label: 'Paid' },
  { value: 'refunded', label: 'Refunded' }
];

const SHIPPING_STATUS_OPTIONS = [
  { value: 'all', label: 'All shipping' },
  { value: 'pending', label: 'Pending' },
  { value: 'picked_up', label: 'Picked up' },
  { value: 'in_transit', label: 'In transit' },
  { value: 'delivered', label: 'Delivered' },
  { value: 'returned', label: 'Returned' }
];

export function OrdersView() {
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState('all');
  const [paymentStatus, setPaymentStatus] = useState('all');
  const [shippingStatus, setShippingStatus] = useState('all');
  const [from, setFrom] = useState('');
  const [to, setTo] = useState('');

  const filters = {
    page,
    per_page: PER_PAGE,
    search: search || undefined,
    status: status === 'all' ? undefined : status,
    payment_status: paymentStatus === 'all' ? undefined : paymentStatus,
    shipping_status: shippingStatus === 'all' ? undefined : shippingStatus,
    from: from || undefined,
    to: to || undefined
  };

  const { data, isLoading } = useQuery(orderQueries.list(filters));
  const items = data?.items ?? [];
  const pagination = data?.pagination;

  return (
    <div className='space-y-4'>
      <div className='grid grid-cols-1 gap-2 sm:grid-cols-2 lg:grid-cols-3 xl:flex xl:flex-wrap xl:items-center'>
        <div className='relative min-w-0 sm:col-span-2 xl:min-w-64 xl:flex-1'>
          <Icons.search className='text-muted-foreground absolute top-1/2 left-3 size-4 -translate-y-1/2' />
          <Input
            value={search}
            onChange={(event) => {
              setSearch(event.target.value);
              setPage(1);
            }}
            placeholder='Search order number, buyer, phone, or tracking...'
            className='pl-9'
          />
        </div>
        <div className='contents'>
          <Select
            items={ORDER_STATUS_OPTIONS}
            value={status}
            onValueChange={(value) => {
              setStatus(value ?? 'all');
              setPage(1);
            }}
          >
            <SelectTrigger className='w-full xl:w-44'>
              <SelectValue placeholder='Order status' />
            </SelectTrigger>
            <SelectContent>
              {ORDER_STATUS_OPTIONS.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select
            items={PAYMENT_STATUS_OPTIONS}
            value={paymentStatus}
            onValueChange={(value) => {
              setPaymentStatus(value ?? 'all');
              setPage(1);
            }}
          >
            <SelectTrigger className='w-full xl:w-44'>
              <SelectValue placeholder='Payment' />
            </SelectTrigger>
            <SelectContent>
              {PAYMENT_STATUS_OPTIONS.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select
            items={SHIPPING_STATUS_OPTIONS}
            value={shippingStatus}
            onValueChange={(value) => {
              setShippingStatus(value ?? 'all');
              setPage(1);
            }}
          >
            <SelectTrigger className='w-full xl:w-44'>
              <SelectValue placeholder='Shipping' />
            </SelectTrigger>
            <SelectContent>
              {SHIPPING_STATUS_OPTIONS.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Input
            type='date'
            aria-label='From date'
            value={from}
            onChange={(event) => {
              setFrom(event.target.value);
              setPage(1);
            }}
            className='w-full xl:w-40'
          />
          <Input
            type='date'
            aria-label='To date'
            value={to}
            onChange={(event) => {
              setTo(event.target.value);
              setPage(1);
            }}
            className='w-full xl:w-40'
          />
        </div>
      </div>

      <Card>
        <CardContent className='p-0'>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Order</TableHead>
                <TableHead>Customer</TableHead>
                <TableHead>Date</TableHead>
                <TableHead className='text-right'>Items</TableHead>
                <TableHead className='text-right'>Total</TableHead>
                <TableHead>Order</TableHead>
                <TableHead>Payment</TableHead>
                <TableHead>Shipping</TableHead>
                <TableHead>Tracking</TableHead>
                <TableHead className='w-16 text-right'>View</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading && (
                <TableRow>
                  <TableCell colSpan={10} className='text-muted-foreground h-24 text-center'>
                    Loading orders...
                  </TableCell>
                </TableRow>
              )}
              {!isLoading && items.length === 0 && (
                <TableRow>
                  <TableCell colSpan={10} className='text-muted-foreground h-24 text-center'>
                    No orders found.
                  </TableCell>
                </TableRow>
              )}
              {items.map((order) => (
                <TableRow key={order.id}>
                  <TableCell>
                    <Link
                      href={`/dashboard/orders/${order.id}`}
                      className='font-mono text-xs font-medium hover:underline'
                    >
                      {order.order_number}
                    </Link>
                  </TableCell>
                  <TableCell>
                    <p className='font-medium'>{order.recipient_name}</p>
                    <p className='text-muted-foreground text-xs'>{order.recipient_phone}</p>
                  </TableCell>
                  <TableCell className='text-xs'>{formatDateOnly(order.created_at)}</TableCell>
                  <TableCell className='text-right'>{order.items.length}</TableCell>
                  <TableCell className='text-right'>
                    <Money value={order.total_amount} />
                  </TableCell>
                  <TableCell>
                    <StatusBadge value={order.status} />
                  </TableCell>
                  <TableCell>
                    <StatusBadge value={order.payment_status} />
                  </TableCell>
                  <TableCell>
                    <StatusBadge value={order.shipping_status} />
                  </TableCell>
                  <TableCell className='text-xs'>{order.tracking_number || '-'}</TableCell>
                  <TableCell className='text-right'>
                    <Link
                      href={`/dashboard/orders/${order.id}`}
                      aria-label='View order'
                      className={cn(buttonVariants({ variant: 'ghost', size: 'icon' }))}
                    >
                      <Icons.arrowRight className='size-4' />
                    </Link>
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
    </div>
  );
}
