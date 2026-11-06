import PageContainer from '@/components/layout/page-container';
import { RequirePermission } from '@/features/auth/components/require-permission';
import { CustomersView } from '@/features/customers/components/customers-view';

export const metadata = {
  title: 'Customers',
  description: 'Manage Ji&Co customer and shipping information.'
};

export default function CustomersPage() {
  return (
    <PageContainer
      pageTitle='Customers'
      pageDescription='Manage customer master data and shipping addresses.'
    >
      <RequirePermission page='customers' action='view'>
        <CustomersView />
      </RequirePermission>
    </PageContainer>
  );
}
