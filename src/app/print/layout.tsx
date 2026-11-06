import type { Metadata } from 'next';
import '@/styles/print.css';

export const metadata: Metadata = {
  title: 'Print | Jiandco',
  robots: { index: false, follow: false }
};

export default function PrintLayout({ children }: { children: React.ReactNode }) {
  return <div className='min-h-screen bg-white p-6 print:p-0'>{children}</div>;
}
