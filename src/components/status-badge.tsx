import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

const variantMap: Record<string, 'default' | 'secondary' | 'outline' | 'destructive'> = {
  active: 'default',
  completed: 'default',
  paid: 'default',
  delivered: 'default',
  draft: 'secondary',
  pending: 'secondary',
  unpaid: 'secondary',
  picked_up: 'outline',
  in_transit: 'outline',
  processing: 'outline',
  confirmed: 'outline',
  shipped: 'outline',
  archived: 'secondary',
  cancelled: 'destructive',
  refunded: 'destructive',
  returned: 'destructive'
};

export function StatusBadge({
  value,
  className
}: {
  value: string | null | undefined;
  className?: string;
}) {
  if (!value) return <span className='text-muted-foreground'>-</span>;
  return (
    <Badge variant={variantMap[value] ?? 'outline'} className={cn('capitalize', className)}>
      {value.replaceAll('_', ' ')}
    </Badge>
  );
}
