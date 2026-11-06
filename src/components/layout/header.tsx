'use client';

import React from 'react';
import { SidebarTrigger } from '../ui/sidebar';
import { Separator } from '../ui/separator';
import { Breadcrumbs } from '../breadcrumbs';
import SearchInput from '../search-input';
import { ThemeSelector } from '../themes/theme-selector';
import { ThemeModeToggle } from '../themes/theme-mode-toggle';
import { Button } from '../ui/button';
import { Icons } from '../icons';
import { useMoneyVisibility } from '../money-visibility-provider';

export default function Header() {
  const { hidden, toggle } = useMoneyVisibility();

  return (
    <header className='bg-background/60 sticky top-0 z-20 flex h-16 shrink-0 items-center justify-between gap-2 backdrop-blur-md md:h-14'>
      <div className='flex items-center gap-2 px-4'>
        <SidebarTrigger className='-ml-1' />
        <Separator orientation='vertical' className='mr-2 h-4 data-vertical:self-center' />
        <Breadcrumbs />
      </div>

      <div className='flex items-center gap-2 px-4'>
        <div className='hidden md:flex'>
          <SearchInput />
        </div>
        <Button
          variant='ghost'
          size='icon'
          aria-label={hidden ? 'Show amounts' : 'Hide amounts'}
          title={hidden ? 'Show amounts' : 'Hide amounts'}
          onClick={toggle}
        >
          {hidden ? <Icons.eyeOff className='size-4' /> : <Icons.eye className='size-4' />}
        </Button>
        <ThemeModeToggle />
        <ThemeSelector />
      </div>
    </header>
  );
}
