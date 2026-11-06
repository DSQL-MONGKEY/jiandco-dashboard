'use client';

import { useQuery } from '@tanstack/react-query';
import { BrandLogo } from '@/components/brand-logo';
import { brand } from '@/config/brand';
import { formatDateTime, formatIDR } from '@/lib/format';
import { orderQueries } from '../../api/queries';
import { PrintToolbar } from './print-toolbar';

export function InvoicePrintView({ orderId }: { orderId: string }) {
  const { data: order, isLoading, isError } = useQuery(orderQueries.detail(orderId));

  if (isLoading) {
    return <div className='p-8 text-sm text-neutral-500'>Loading invoice...</div>;
  }
  if (isError || !order) {
    return <div className='p-8 text-sm text-red-600'>Order not found.</div>;
  }

  return (
    <>
      <style>{`@page { size: A4; margin: 12mm; }`}</style>
      <PrintToolbar orderId={order.id} />
      <div className='print-document mx-auto max-w-[210mm] p-8'>
        <header className='flex items-start justify-between gap-8 border-b border-neutral-200 pb-6'>
          <div className='flex items-center gap-3'>
            <BrandLogo size={52} />
            <div>
              <h1 className='text-2xl font-semibold tracking-tight'>{brand.name}</h1>
              <p className='text-xs text-neutral-500'>{brand.tagline}</p>
            </div>
          </div>
          <div className='text-right text-xs text-neutral-500'>
            <p>{brand.address}</p>
            <p>{brand.email}</p>
            <p>{brand.phone}</p>
          </div>
        </header>

        <div className='mt-6 flex items-start justify-between gap-8'>
          <div>
            <p className='text-[10px] font-semibold uppercase tracking-[0.16em] text-neutral-500'>
              Invoice
            </p>
            <p className='mt-1 font-mono text-lg font-semibold'>{order.order_number}</p>
            <p className='mt-1 text-xs text-neutral-500'>{formatDateTime(order.created_at)}</p>
          </div>
          <div className='text-right text-xs'>
            <p className='font-semibold uppercase tracking-[0.12em] text-neutral-500'>Status</p>
            <p className='mt-1 capitalize'>{order.status.replaceAll('_', ' ')}</p>
            <p className='mt-1 capitalize'>Payment: {order.payment_status}</p>
          </div>
        </div>

        <div className='mt-6 grid gap-6 md:grid-cols-2'>
          <div>
            <p className='text-[10px] font-semibold uppercase tracking-[0.16em] text-neutral-500'>
              Bill to
            </p>
            <p className='mt-2 text-sm font-medium'>{order.recipient_name}</p>
            <p className='text-xs text-neutral-600'>{order.recipient_phone}</p>
            <p className='mt-1 text-xs text-neutral-600'>{order.customer?.email || '-'}</p>
          </div>
          <div>
            <p className='text-[10px] font-semibold uppercase tracking-[0.16em] text-neutral-500'>
              Ship to
            </p>
            <p className='mt-2 text-xs leading-5 text-neutral-600'>
              {order.shipping_address}
              {order.shipping_city ? `, ${order.shipping_city}` : ''}
              {order.shipping_province ? `, ${order.shipping_province}` : ''}
              {order.shipping_postal_code ? ` ${order.shipping_postal_code}` : ''}
            </p>
          </div>
        </div>

        <table className='print-table mt-8'>
          <thead>
            <tr>
              <th>Item</th>
              <th>Variant</th>
              <th>SKU</th>
              <th className='text-right'>Price</th>
              <th className='text-right'>Qty</th>
              <th className='text-right'>Subtotal</th>
            </tr>
          </thead>
          <tbody>
            {order.items.map((item) => (
              <tr key={item.id}>
                <td>{item.product_name}</td>
                <td>{item.variant_label}</td>
                <td>{item.sku}</td>
                <td className='text-right'>{formatIDR(item.price)}</td>
                <td className='text-right'>{item.quantity}</td>
                <td className='text-right'>{formatIDR(item.subtotal)}</td>
              </tr>
            ))}
          </tbody>
        </table>

        <div className='mt-6 ml-auto w-full max-w-xs space-y-2 text-sm'>
          <div className='flex justify-between'>
            <span className='text-neutral-500'>Subtotal</span>
            <span>{formatIDR(order.subtotal)}</span>
          </div>
          <div className='flex justify-between'>
            <span className='text-neutral-500'>Discount</span>
            <span>-{formatIDR(order.discount_amount)}</span>
          </div>
          <div className='flex justify-between'>
            <span className='text-neutral-500'>Shipping</span>
            <span>{formatIDR(order.shipping_cost)}</span>
          </div>
          <div className='flex justify-between border-t border-neutral-300 pt-2 text-base font-semibold'>
            <span>Total</span>
            <span>{formatIDR(order.total_amount)}</span>
          </div>
        </div>

        <div className='mt-8 border-t border-neutral-200 pt-4 text-xs text-neutral-500'>
          <p>Notes: {order.notes || '-'}</p>
          <p className='mt-2'>
            Courier: {order.courier || '-'} · Tracking: {order.tracking_number || '-'}
          </p>
          <p className='mt-4 text-[10px]'>
            {brand.name} · {brand.address} · {brand.email}
          </p>
        </div>
      </div>
    </>
  );
}
