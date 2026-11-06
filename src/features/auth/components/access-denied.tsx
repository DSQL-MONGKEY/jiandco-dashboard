import { Icons } from '@/components/icons';
import { Card, CardContent } from '@/components/ui/card';

export function AccessDenied() {
  return (
    <div className='flex flex-1 items-center justify-center p-6'>
      <Card className='max-w-md'>
        <CardContent className='flex flex-col items-center gap-3 p-8 text-center'>
          <div className='bg-muted flex size-12 items-center justify-center rounded-full'>
            <Icons.lock className='size-6' />
          </div>
          <h2 className='text-lg font-semibold'>Access denied</h2>
          <p className='text-muted-foreground text-sm'>
            You do not have permission to access this page. Contact a developer or super admin if
            you need access.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
