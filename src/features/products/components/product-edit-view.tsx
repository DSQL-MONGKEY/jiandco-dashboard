'use client';

import Link from 'next/link';
import { useQuery } from '@tanstack/react-query';
import { buttonVariants } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { Icons } from '@/components/icons';
import { productQueries } from '../api/queries';
import { ProductForm } from './product-form';
import { VariantManager } from './variant-manager';
import { ImageManager } from './image-manager';

export function ProductEditView({ productId }: { productId: string }) {
  const { data: product, isLoading, isError } = useQuery(productQueries.detail(productId));

  if (isLoading) {
    return <div className='bg-muted h-96 w-full animate-pulse rounded-lg' />;
  }

  if (isError || !product) {
    return (
      <div className='flex flex-col items-center gap-3 py-12'>
        <Icons.warning className='text-destructive size-8' />
        <p className='text-muted-foreground'>Product not found.</p>
        <Link href='/dashboard/products' className={cn(buttonVariants({ variant: 'outline' }))}>
          Back to products
        </Link>
      </div>
    );
  }

  return (
    <div className='space-y-6'>
      <ProductForm initialData={product} />
      <VariantManager product={product} />
      <ImageManager product={product} />
    </div>
  );
}
