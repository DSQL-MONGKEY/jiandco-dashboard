import type { Metadata } from 'next';
import { brand } from '@/config/brand';
import '@/styles/print.css';

export const metadata: Metadata = {
  title: 'Print | Ji&Co',
  description: `Ji&Co invoice and receipt — ${brand.companyName}`,
  robots: { index: false, follow: false, nocache: true }
};

export default function PrintLayout({ children }: { children: React.ReactNode }) {
  return <div className='min-h-screen bg-white p-6 print:p-0'>{children}</div>;
}
