import { ReceiptPrintView } from '@/features/orders/components/print/receipt-document';

export default async function ReceiptPrintPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return <ReceiptPrintView orderId={id} />;
}
