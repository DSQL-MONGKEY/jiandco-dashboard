'use client';

import Link from 'next/link';
import { buttonVariants } from '@/components/ui/button';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { Icons } from '@/components/icons';

export function PrintToolbar({
  orderId,
  backLabel = 'Back to order'
}: {
  orderId: string;
  backLabel?: string;
}) {
  return (
    <div className='print-toolbar mb-6 flex flex-wrap items-center justify-between gap-3'>
      <Link
        href={`/dashboard/orders/${orderId}`}
        className={cn(buttonVariants({ variant: 'outline' }))}
      >
        <Icons.arrowLeft className='mr-1 size-4' />
        {backLabel}
      </Link>
      <Button onClick={() => window.print()}>
        <Icons.upload className='mr-1 size-4' />
        Print
      </Button>
    </div>
  );
}
