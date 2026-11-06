import PageContainer from '@/components/layout/page-container';
import { RequirePermission } from '@/features/auth/components/require-permission';
import { OrderForm } from '@/features/orders/components/order-form';

export const metadata = {
  title: 'Create Order'
};

export default function NewOrderPage() {
  return (
    <PageContainer
      pageTitle='Create order'
      pageDescription='Create an order from an existing customer.'
    >
      <RequirePermission page='orders' action='create'>
        <OrderForm />
      </RequirePermission>
    </PageContainer>
  );
}
