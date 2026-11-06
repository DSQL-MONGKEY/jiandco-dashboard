import { cn } from '@/lib/utils';

export function FieldHint({ className, ...props }: React.ComponentProps<'p'>) {
  return (
    <p className={cn('text-muted-foreground text-xs leading-relaxed', className)} {...props} />
  );
}
