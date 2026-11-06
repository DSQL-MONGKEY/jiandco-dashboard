'use client';

import { Button } from '@/components/ui/button';
import { Icons } from '@/components/icons';

export function SimplePagination({
  page,
  totalPages,
  total,
  onPageChange
}: {
  page: number;
  totalPages: number;
  total: number;
  onPageChange: (page: number) => void;
}) {
  return (
    <div className='flex items-center justify-between gap-3 py-4'>
      <p className='text-muted-foreground text-sm'>
        {total} data · halaman {page} dari {Math.max(totalPages, 1)}
      </p>
      <div className='flex items-center gap-2'>
        <Button
          variant='outline'
          size='sm'
          disabled={page <= 1}
          onClick={() => onPageChange(page - 1)}
        >
          <Icons.chevronLeft className='mr-1 size-4' />
          Previous
        </Button>
        <Button
          variant='outline'
          size='sm'
          disabled={page >= totalPages}
          onClick={() => onPageChange(page + 1)}
        >
          Next
          <Icons.chevronRight className='ml-1 size-4' />
        </Button>
      </div>
    </div>
  );
}
