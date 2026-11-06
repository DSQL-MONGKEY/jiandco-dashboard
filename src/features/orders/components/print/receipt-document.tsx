'use client';

import { useQuery } from '@tanstack/react-query';
import { BrandLogo } from '@/components/brand-logo';
import { brand } from '@/config/brand';
import { formatDateTime, formatIDR } from '@/lib/format';
import { orderQueries } from '../../api/queries';
import { PrintToolbar } from './print-toolbar';

export function ReceiptPrintView({ orderId }: { orderId: string }) {
  const { data: order, isLoading, isError } = useQuery(orderQueries.detail(orderId));

  if (isLoading) {
    return <div className='p-8 text-sm text-neutral-500'>Loading receipt...</div>;
  }
  if (isError || !order) {
    return <div className='p-8 text-sm text-red-600'>Order not found.</div>;
  }

  return (
    <>
      <style>{`@page { size: 80mm auto; margin: 4mm; }`}</style>
      <PrintToolbar orderId={order.id} />
      <div className='print-document mx-auto w-[80mm] p-2 text-[11px] leading-5'>
        <div className='flex flex-col items-center border-b border-dashed border-neutral-300 pb-3 text-center'>
          <BrandLogo size={42} />
          <p className='mt-1 text-sm font-semibold'>{brand.name}</p>
          <p className='text-[9px] text-neutral-500'>{brand.companyName}</p>
          <p className='text-[9px] text-neutral-500'>{brand.address}</p>
          <p className='text-[9px] text-neutral-500'>{brand.phone}</p>
        </div>

        <div className='mt-3 space-y-1 text-[10px]'>
          <div className='flex justify-between'>
            <span className='text-neutral-500'>Order</span>
            <span className='font-mono'>{order.order_number}</span>
          </div>
          <div className='flex justify-between'>
            <span className='text-neutral-500'>Date</span>
            <span>{formatDateTime(order.created_at)}</span>
          </div>
          <div className='flex justify-between'>
            <span className='text-neutral-500'>Customer</span>
            <span>{order.recipient_name}</span>
          </div>
        </div>

        <div className='mt-3 border-y border-dashed border-neutral-300 py-2'>
          {order.items.map((item) => (
            <div key={item.id} className='mb-2'>
              <p className='font-medium'>{item.product_name}</p>
              <div className='flex justify-between text-[10px] text-neutral-600'>
                <span>
                  {item.variant_label} x{item.quantity}
                </span>
                <span>{formatIDR(item.subtotal)}</span>
              </div>
            </div>
          ))}
        </div>

        <div className='mt-2 space-y-1'>
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
          <div className='flex justify-between border-t border-neutral-300 pt-1 text-sm font-semibold'>
            <span>Total</span>
            <span>{formatIDR(order.total_amount)}</span>
          </div>
        </div>

        <div className='mt-3 space-y-1 text-[10px] text-neutral-600'>
          <div className='flex justify-between'>
            <span>Payment</span>
            <span className='capitalize'>{order.payment_status}</span>
          </div>
          <div className='flex justify-between'>
            <span>Method</span>
            <span>{order.payment_method || '-'}</span>
          </div>
        </div>

        <div className='mt-4 border-t border-dashed border-neutral-300 pt-3 text-center text-[10px] text-neutral-500'>
          <p>Terima kasih telah berbelanja di {brand.name}.</p>
          <p className='mt-1'>Ji&Co is a brand of {brand.companyName}.</p>
        </div>
      </div>
    </>
  );
}
