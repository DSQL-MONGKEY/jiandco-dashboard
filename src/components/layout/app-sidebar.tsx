'use client';

import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger
} from '@/components/ui/dropdown-menu';
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
  SidebarRail,
  useSidebar
} from '@/components/ui/sidebar';
import { UserAvatar } from '@/components/user-avatar';
import { BrandLogo } from '@/components/brand-logo';
import { navGroups } from '@/config/nav-config';
import { useAuth } from '@/features/auth/context/auth-provider';
import { useFilteredNavGroups } from '@/hooks/use-nav';
import type { NavItem } from '@/types';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { Icons } from '../icons';

export default function AppSidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const { user, logout } = useAuth();
  const filteredGroups = useFilteredNavGroups(navGroups);

  return (
    <Sidebar collapsible='icon'>
      <SidebarHeader className='group-data-[collapsible=icon]:pt-4'>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton
              size='lg'
              render={<Link href='/dashboard/overview' aria-label='Jiandco dashboard' />}
            >
              <BrandLogo size={32} />
              <div className='grid flex-1 text-left text-sm leading-tight'>
                <span className='truncate font-semibold'>Jiandco</span>
                <span className='text-muted-foreground truncate text-xs'>Internal dashboard</span>
              </div>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>

      <SidebarContent className='overflow-x-hidden'>
        {filteredGroups.map((group) => (
          <SidebarGroup key={group.label || 'ungrouped'} className='py-0'>
            {group.label && <SidebarGroupLabel>{group.label}</SidebarGroupLabel>}
            <SidebarMenu>
              {group.items.map((item) => (
                <NavMainItem key={item.title} item={item} pathname={pathname} />
              ))}
            </SidebarMenu>
          </SidebarGroup>
        ))}
      </SidebarContent>

      <SidebarFooter>
        <SidebarMenu>
          <SidebarMenuItem>
            <DropdownMenu>
              <DropdownMenuTrigger
                render={
                  <SidebarMenuButton
                    size='lg'
                    className='data-popup-open:bg-sidebar-accent data-popup-open:text-sidebar-accent-foreground'
                  />
                }
              >
                <UserAvatar user={user} showInfo />
                <Icons.chevronsDown className='ml-auto size-4' />
              </DropdownMenuTrigger>
              <DropdownMenuContent
                className='w-(--anchor-width) min-w-56 rounded-lg'
                side='bottom'
                align='end'
                sideOffset={4}
              >
                <DropdownMenuGroup>
                  <DropdownMenuLabel className='p-0 font-normal'>
                    <div className='px-1 py-1.5'>
                      <UserAvatar user={user} showInfo />
                    </div>
                  </DropdownMenuLabel>
                </DropdownMenuGroup>
                <DropdownMenuSeparator />
                <DropdownMenuGroup>
                  <DropdownMenuItem onClick={() => router.push('/dashboard/profile')}>
                    <Icons.profile className='mr-2 h-4 w-4' />
                    Profile
                  </DropdownMenuItem>
                </DropdownMenuGroup>
                <DropdownMenuSeparator />
                <DropdownMenuGroup>
                  <DropdownMenuItem onClick={() => void logout()}>
                    <Icons.logout aria-hidden className='mr-2 h-4 w-4' />
                    Sign out
                  </DropdownMenuItem>
                </DropdownMenuGroup>
              </DropdownMenuContent>
            </DropdownMenu>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  );
}

function isActivePath(pathname: string, url: string) {
  return pathname === url || (url !== '/' && pathname.startsWith(`${url}/`));
}

function NavMainItem({ item, pathname }: { item: NavItem; pathname: string }) {
  const { state, isMobile } = useSidebar();
  const Icon = item.icon ? Icons[item.icon] : Icons.logo;
  const children = item.items ?? [];

  if (children.length === 0) {
    return (
      <SidebarMenuItem>
        <SidebarMenuButton
          render={<Link href={item.url} aria-label={item.title} />}
          tooltip={item.title}
          isActive={isActivePath(pathname, item.url)}
        >
          <Icon />
          <span>{item.title}</span>
        </SidebarMenuButton>
      </SidebarMenuItem>
    );
  }

  const hasActiveChild = children.some((child) => isActivePath(pathname, child.url));

  if (state === 'collapsed' && !isMobile) {
    return (
      <SidebarMenuItem>
        <DropdownMenu>
          <DropdownMenuTrigger
            render={
              <SidebarMenuButton
                tooltip={item.title}
                isActive={hasActiveChild}
                className='data-popup-open:bg-sidebar-accent data-popup-open:text-sidebar-accent-foreground'
              />
            }
          >
            <Icon />
            <span>{item.title}</span>
          </DropdownMenuTrigger>
          <DropdownMenuContent
            side='right'
            align='start'
            sideOffset={8}
            className='w-auto min-w-48'
          >
            <DropdownMenuGroup>
              <DropdownMenuLabel>{item.title}</DropdownMenuLabel>
            </DropdownMenuGroup>
            <DropdownMenuSeparator />
            <DropdownMenuGroup>
              {children.map((child) => {
                const ChildIcon = child.icon ? Icons[child.icon] : null;
                const active = isActivePath(pathname, child.url);
                return (
                  <DropdownMenuItem
                    key={child.title}
                    render={<Link href={child.url} aria-label={child.title} />}
                    className={active ? 'bg-accent text-accent-foreground font-medium' : undefined}
                  >
                    {ChildIcon && <ChildIcon />}
                    {child.title}
                  </DropdownMenuItem>
                );
              })}
            </DropdownMenuGroup>
          </DropdownMenuContent>
        </DropdownMenu>
      </SidebarMenuItem>
    );
  }

  return (
    <Collapsible defaultOpen={item.isActive || hasActiveChild} render={<SidebarMenuItem />}>
      <CollapsibleTrigger
        render={
          <SidebarMenuButton
            tooltip={item.title}
            isActive={hasActiveChild}
            className='group/collapsible'
          />
        }
      >
        {item.icon && <Icon />}
        <span>{item.title}</span>
        <Icons.chevronRight className='ml-auto transition-transform duration-200 group-data-panel-open/collapsible:rotate-90' />
      </CollapsibleTrigger>
      <CollapsibleContent>
        <SidebarMenuSub>
          {children.map((child) => (
            <SidebarMenuSubItem key={child.title}>
              <SidebarMenuSubButton
                render={<Link href={child.url} aria-label={child.title} />}
                isActive={isActivePath(pathname, child.url)}
              >
                <span>{child.title}</span>
              </SidebarMenuSubButton>
            </SidebarMenuSubItem>
          ))}
        </SidebarMenuSub>
      </CollapsibleContent>
    </Collapsible>
  );
}
