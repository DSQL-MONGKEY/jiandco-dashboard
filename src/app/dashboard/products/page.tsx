import Link from 'next/link';
import PageContainer from '@/components/layout/page-container';
import { buttonVariants } from '@/components/ui/button';
import { Icons } from '@/components/icons';
import { cn } from '@/lib/utils';
import { RequirePermission } from '@/features/auth/components/require-permission';
import { ProductList } from '@/features/products/components/product-list';

export const metadata = {
  title: 'Products'
};

export default function ProductsPage() {
  return (
    <PageContainer
      pageTitle='Products'
      pageDescription='Manage product catalog, variants, images, and stock.'
      pageHeaderAction={
        <Link
          href='/dashboard/products/new'
          className={cn(buttonVariants(), 'w-full justify-center text-xs sm:w-auto md:text-sm')}
        >
          <Icons.add className='mr-2 size-4' />
          Add product
        </Link>
      }
    >
      <RequirePermission page='products' action='view'>
        <ProductList />
      </RequirePermission>
    </PageContainer>
  );
}
