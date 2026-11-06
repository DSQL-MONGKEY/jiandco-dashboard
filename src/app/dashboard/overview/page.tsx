import PageContainer from '@/components/layout/page-container';
import { RequirePermission } from '@/features/auth/components/require-permission';
import { RevenueOverviewView } from '@/features/overview/components/revenue-overview-view';

export const metadata = {
  title: 'Overview',
  description: 'Review Ji&Co revenue, expenses, and order performance.'
};

export default function OverviewPage() {
  return (
    <PageContainer
      pageTitle='Overview'
      pageDescription='Revenue, expenses, and order performance by month.'
    >
      <RequirePermission page='overview' action='view'>
        <RevenueOverviewView />
      </RequirePermission>
    </PageContainer>
  );
}
