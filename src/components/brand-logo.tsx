import Image from 'next/image';
import { cn } from '@/lib/utils';

export function BrandLogo({
  variant = 'light',
  size = 40,
  className
}: {
  variant?: 'light' | 'burgundy' | 'dark';
  size?: number;
  className?: string;
}) {
  const src =
    variant === 'burgundy'
      ? '/brand/jiandco-mark-burgundy.png'
      : variant === 'dark'
        ? '/brand/jiandco-monogram.png'
        : '/brand/jiandco-mark.png';

  return (
    <span
      className={cn(
        'inline-flex shrink-0 items-center justify-center overflow-hidden rounded-full',
        variant === 'burgundy' && 'bg-[#4D0E13]',
        className
      )}
      style={{ width: size, height: size }}
    >
      <Image
        src={src}
        alt='Ji&Co'
        width={size}
        height={size}
        className='size-full object-cover'
        priority
      />
    </span>
  );
}
