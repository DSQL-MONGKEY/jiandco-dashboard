import PageContainer from '@/components/layout/page-container';
import { RequirePermission } from '@/features/auth/components/require-permission';
import { AccountingOverviewView } from '@/features/accounting/components/accounting-overview-view';

export const metadata = {
  title: 'Accounting Overview',
  description: 'Review Ji&Co expenses by category and recent transactions.'
};

export default function AccountingOverviewPage() {
  return (
    <PageContainer
      pageTitle='Accounting Overview'
      pageDescription='Review expenses by category and recent transactions.'
    >
      <RequirePermission page='accounting' action='view'>
        <AccountingOverviewView />
      </RequirePermission>
    </PageContainer>
  );
}
