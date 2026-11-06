import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import type { AuthUser } from '@/types/api';
import { cn } from '@/lib/utils';
import { mediaUrl } from '@/lib/media';

export function UserAvatar({
  user,
  className,
  showInfo = false
}: {
  user: AuthUser | null;
  className?: string;
  showInfo?: boolean;
}) {
  const initials = user?.name
    ?.split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0])
    .join('')
    .toUpperCase();

  return (
    <div className='flex min-w-0 items-center gap-2'>
      <Avatar className={cn('size-8 rounded-lg', className)}>
        <AvatarImage src={mediaUrl(user?.avatar_url, user?.avatar_key)} alt={user?.name || ''} />
        <AvatarFallback className='rounded-lg'>{initials || 'JD'}</AvatarFallback>
      </Avatar>
      {showInfo && (
        <div className='grid min-w-0 flex-1 text-left text-sm leading-tight'>
          <span className='truncate font-semibold'>{user?.name || 'Jiandco User'}</span>
          <span className='text-muted-foreground truncate text-xs'>
            {user?.email || user?.username || ''}
          </span>
        </div>
      )}
    </div>
  );
}
