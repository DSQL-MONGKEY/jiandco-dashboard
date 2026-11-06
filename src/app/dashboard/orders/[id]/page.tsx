import PageContainer from '@/components/layout/page-container';
import { RequirePermission } from '@/features/auth/components/require-permission';
import { OrderDetailView } from '@/features/orders/components/order-detail-view';

export const metadata = {
  title: 'Order Detail',
  description: 'Review and update Ji&Co order details.'
};

type PageProps = {
  params: Promise<{ id: string }>;
};

export default async function OrderDetailPage({ params }: PageProps) {
  const { id } = await params;

  return (
    <PageContainer
      pageTitle='Order detail'
      pageDescription='Manage order status, payment, shipping, and items.'
    >
      <RequirePermission page='orders' action='view'>
        <OrderDetailView orderId={id} />
      </RequirePermission>
    </PageContainer>
  );
}
