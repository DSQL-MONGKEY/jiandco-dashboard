import { Suspense } from 'react';
import { Metadata } from 'next';
import { LoginForm } from '@/features/auth/components/login-form';
import { BrandLogo } from '@/components/brand-logo';

export const metadata: Metadata = {
  title: 'Sign In | Jiandco Dashboard',
  description: 'Sign in to the Jiandco internal operations dashboard.'
};

export default function SignInPage() {
  return (
    <main className='grid min-h-screen bg-[#EEE4DA] text-[#111214] lg:grid-cols-[1.05fr_0.95fr]'>
      <section className='relative hidden overflow-hidden bg-[#4D0E13] px-12 py-10 text-[#EEE4DA] lg:flex lg:flex-col lg:justify-between xl:px-16'>
        <div
          aria-hidden='true'
          className='absolute inset-0 opacity-70'
          style={{
            backgroundImage:
              'radial-gradient(circle at 15% 20%, rgba(200,164,159,0.18), transparent 34%), radial-gradient(circle at 90% 85%, rgba(238,228,218,0.12), transparent 30%)'
          }}
        />
        <div
          aria-hidden='true'
          className='absolute inset-y-10 right-12 left-12 border border-[#EEE4DA]/15'
        />
        <BrandLogo size={340} className='absolute -right-24 -bottom-28 opacity-[0.07]' />

        <div className='relative z-10 flex items-center gap-3'>
          <BrandLogo size={48} />
          <div>
            <p className='font-serif text-3xl leading-none tracking-[-0.03em]'>Ji&amp;Co</p>
            <p className='mt-1 text-[0.58rem] font-semibold tracking-[0.22em] text-[#EEE4DA]/60 uppercase'>
              Internal operations
            </p>
          </div>
        </div>

        <div className='relative z-10 max-w-lg'>
          <p className='text-[0.58rem] font-semibold tracking-[0.22em] text-[#C8A49F] uppercase'>
            Everyday elegance, made to fit.
          </p>
          <h1 className='mt-5 font-serif text-[clamp(3rem,5vw,5rem)] leading-[0.92] font-normal tracking-[-0.04em]'>
            The quiet work behind every collection.
          </h1>
          <p className='mt-6 max-w-md text-sm leading-7 text-[#EEE4DA]/65'>
            Manage catalog, orders, customers, and accounting in one calm, focused workspace.
          </p>
        </div>

        <div className='relative z-10 flex items-center justify-between gap-6 border-t border-[#EEE4DA]/15 pt-5 text-[0.55rem] font-semibold tracking-[0.18em] text-[#EEE4DA]/45 uppercase'>
          <span>Authorized personnel only</span>
          <span>Ji&amp;Co · Indonesia</span>
        </div>
      </section>

      <section className='relative flex min-h-screen items-center justify-center px-5 py-10 sm:px-8 lg:px-12'>
        <div className='w-full max-w-md'>
          <div className='mb-10 flex items-center gap-3 lg:hidden'>
            <BrandLogo size={44} />
            <div>
              <p className='font-serif text-3xl leading-none tracking-[-0.03em]'>Ji&amp;Co</p>
              <p className='mt-1 text-[0.55rem] font-semibold tracking-[0.2em] text-[#6B5A4D] uppercase'>
                Internal operations
              </p>
            </div>
          </div>

          <div className='max-w-sm'>
            <p className='text-[0.58rem] font-semibold tracking-[0.22em] text-[#8C5A52] uppercase'>
              Dashboard access
            </p>
            <h2 className='mt-4 font-serif text-5xl leading-none font-normal tracking-[-0.04em] text-[#4D0E13]'>
              Welcome back.
            </h2>
            <p className='mt-4 text-sm leading-6 text-[#6B5A4D]'>
              Sign in with the account provided by your administrator.
            </p>
          </div>

          <div className='mt-9 border-t border-[#CDBAA4] pt-8'>
            <Suspense fallback={<div className='h-64 animate-pulse rounded-lg bg-[#E8DCD0]' />}>
              <LoginForm />
            </Suspense>
          </div>

          <p className='mt-8 text-xs leading-6 text-[#6B5A4D]'>
            Need access? Contact your administrator. This dashboard is for authorized Ji&amp;Co
            personnel only.
          </p>
        </div>
      </section>
    </main>
  );
}
