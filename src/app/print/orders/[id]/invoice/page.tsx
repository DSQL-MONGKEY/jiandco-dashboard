import { InvoicePrintView } from '@/features/orders/components/print/invoice-document';

export default async function InvoicePrintPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return <InvoicePrintView orderId={id} />;
}
