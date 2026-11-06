'use client';

import { cn } from '@/lib/utils';
import { formatIDR } from '@/lib/format';
import { useMoneyVisibility } from './money-visibility-provider';

type MoneyProps = {
  value: number | null | undefined;
  className?: string;
  force?: boolean;
};

export function Money({ value, className, force = false }: MoneyProps) {
  const { hidden } = useMoneyVisibility();
  const isHidden = hidden && !force;
  const text = formatIDR(value);

  return (
    <span
      className={cn(
        'inline-block transition-[filter] duration-200',
        isHidden && 'select-none blur-[5px]',
        className
      )}
    >
      <span aria-hidden={isHidden || undefined}>{text}</span>
      {isHidden && <span className='sr-only'>Amount hidden</span>}
    </span>
  );
}
