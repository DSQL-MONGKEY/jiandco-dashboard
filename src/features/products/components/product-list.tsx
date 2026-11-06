'use client';

import { useState } from 'react';
import Link from 'next/link';
import { buttonVariants } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { AlertModal } from '@/components/modal/alert-modal';
import { SimplePagination } from '@/components/simple-pagination';
import { StatusBadge } from '@/components/status-badge';
import { Button } from '@/components/ui/button';
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
import { Money } from '@/components/money';
import { mediaUrl } from '@/lib/media';
import { productMutations, productQueries, categoryQueries } from '../api/queries';
import type { Product } from '../api/types';

const PER_PAGE = 10;

const STATUS_OPTIONS = [
  { value: 'all', label: 'All status' },
  { value: 'draft', label: 'Draft' },
  { value: 'active', label: 'Active' },
  { value: 'archived', label: 'Archived' }
];

export function ProductList() {
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [categoryId, setCategoryId] = useState('all');
  const [status, setStatus] = useState('all');
  const [deleteTarget, setDeleteTarget] = useState<Product | null>(null);
  const queryClient = useQueryClient();

  const filters = {
    page,
    per_page: PER_PAGE,
    search: search || undefined,
    category_id: categoryId === 'all' ? undefined : categoryId,
    status: status === 'all' ? undefined : status
  };

  const { data, isLoading } = useQuery(productQueries.list(filters));
  const { data: categories = [] } = useQuery(categoryQueries.list());
  const categoryOptions = [
    { value: 'all', label: 'All categories' },
    ...categories.map((category) => ({ value: category.id, label: category.name }))
  ];

  const deleteMutation = useMutation({
    ...productMutations.delete(),
    onSuccess: () => {
      toast.success('Product deleted');
      setDeleteTarget(null);
      queryClient.invalidateQueries({ queryKey: productQueries.all() });
    },
    onError: (error) => toast.error(error.message)
  });

  const items = data?.items ?? [];
  const pagination = data?.pagination;

  return (
    <div className='space-y-4'>
      <div className='grid grid-cols-1 gap-2 sm:grid-cols-2 lg:flex lg:items-center'>
        <div className='relative min-w-0 sm:col-span-2 lg:flex-1'>
          <Icons.search className='text-muted-foreground absolute top-1/2 left-3 size-4 -translate-y-1/2' />
          <Input
            value={search}
            onChange={(event) => {
              setSearch(event.target.value);
              setPage(1);
            }}
            placeholder='Search products...'
            className='pl-9'
          />
        </div>
        <Select
          items={categoryOptions}
          value={categoryId}
          onValueChange={(value) => {
            setCategoryId(value ?? 'all');
            setPage(1);
          }}
        >
          <SelectTrigger className='w-full lg:w-48'>
            <SelectValue placeholder='Category' />
          </SelectTrigger>
          <SelectContent>
            {categoryOptions.map((option) => (
              <SelectItem key={option.value} value={option.value}>
                {option.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select
          items={STATUS_OPTIONS}
          value={status}
          onValueChange={(value) => {
            setStatus(value ?? 'all');
            setPage(1);
          }}
        >
          <SelectTrigger className='w-full lg:w-40'>
            <SelectValue placeholder='Status' />
          </SelectTrigger>
          <SelectContent>
            {STATUS_OPTIONS.map((option) => (
              <SelectItem key={option.value} value={option.value}>
                {option.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <Card>
        <CardContent className='p-0'>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className='w-16'>Image</TableHead>
                <TableHead>Product</TableHead>
                <TableHead>Category</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className='text-right'>Variants</TableHead>
                <TableHead className='text-right'>Stock</TableHead>
                <TableHead className='text-right'>Price</TableHead>
                <TableHead className='w-24 text-right'>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading && (
                <TableRow>
                  <TableCell colSpan={8} className='text-muted-foreground h-24 text-center'>
                    Loading products...
                  </TableCell>
                </TableRow>
              )}
              {!isLoading && items.length === 0 && (
                <TableRow>
                  <TableCell colSpan={8} className='text-muted-foreground h-24 text-center'>
                    No products found.
                  </TableCell>
                </TableRow>
              )}
              {items.map((product) => {
                const primary =
                  product.images.find((image) => image.is_primary) ?? product.images[0];
                const stock = product.variants.reduce((total, variant) => total + variant.stock, 0);
                const prices = product.variants.map((variant) => variant.price);
                const priceLabel =
                  prices.length === 0 ? (
                    '-'
                  ) : Math.min(...prices) === Math.max(...prices) ? (
                    <Money value={prices[0]} />
                  ) : (
                    <span className='inline-flex items-center gap-1'>
                      <Money value={Math.min(...prices)} />
                      <span>-</span>
                      <Money value={Math.max(...prices)} />
                    </span>
                  );

                return (
                  <TableRow key={product.id}>
                    <TableCell>
                      <div className='bg-muted flex size-10 items-center justify-center overflow-hidden rounded-md'>
                        {mediaUrl(primary?.url, primary?.object_key) ? (
                          // oxlint-disable-next-line next/no-img-element
                          <img
                            src={mediaUrl(primary.url, primary.object_key)}
                            alt={product.name}
                            className='size-full object-cover'
                          />
                        ) : (
                          <Icons.product className='text-muted-foreground size-5' />
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className='flex flex-col'>
                        <Link
                          href={`/dashboard/products/${product.id}`}
                          className='font-medium hover:underline'
                        >
                          {product.name}
                        </Link>
                        <span className='text-muted-foreground text-xs'>{product.slug}</span>
                      </div>
                    </TableCell>
                    <TableCell>{product.category?.name ?? '-'}</TableCell>
                    <TableCell>
                      <StatusBadge value={product.status} />
                    </TableCell>
                    <TableCell className='text-right'>{product.variants.length}</TableCell>
                    <TableCell className='text-right'>{stock}</TableCell>
                    <TableCell className='text-right'>{priceLabel}</TableCell>
                    <TableCell className='text-right'>
                      <div className='flex justify-end gap-1'>
                        <Link
                          href={`/dashboard/products/${product.id}`}
                          aria-label='Edit product'
                          className={cn(buttonVariants({ variant: 'ghost', size: 'icon' }))}
                        >
                          <Icons.edit className='size-4' />
                        </Link>
                        <Button
                          variant='ghost'
                          size='icon'
                          aria-label='Delete product'
                          onClick={() => setDeleteTarget(product)}
                        >
                          <Icons.trash className='size-4' />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                );
              })}
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

      <AlertModal
        isOpen={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={() => deleteTarget && deleteMutation.mutate(deleteTarget.id)}
        loading={deleteMutation.isPending}
      />
    </div>
  );
}
