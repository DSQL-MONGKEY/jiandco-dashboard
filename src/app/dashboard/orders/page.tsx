import Link from 'next/link';
import PageContainer from '@/components/layout/page-container';
import { buttonVariants } from '@/components/ui/button';
import { Icons } from '@/components/icons';
import { cn } from '@/lib/utils';
import { RequirePermission } from '@/features/auth/components/require-permission';
import { OrdersView } from '@/features/orders/components/orders-view';

export const metadata = {
  title: 'Orders'
};

export default function OrdersPage() {
  return (
    <PageContainer
      pageTitle='Orders'
      pageDescription='Track orders, payments, shipping, and stock movements.'
      pageHeaderAction={
        <Link
          href='/dashboard/orders/new'
          className={cn(buttonVariants(), 'w-full justify-center text-xs sm:w-auto md:text-sm')}
        >
          <Icons.add className='mr-2 size-4' />
          Create order
        </Link>
      }
    >
      <RequirePermission page='orders' action='view'>
        <OrdersView />
      </RequirePermission>
    </PageContainer>
  );
}
