import PageContainer from '@/components/layout/page-container';
import { RequirePermission } from '@/features/auth/components/require-permission';
import { ExpensesView } from '@/features/accounting/components/expenses-view';

export const metadata = {
  title: 'Expenses',
  description: 'Record and review Ji&Co operational expenses.'
};

export default function ExpensesPage() {
  return (
    <PageContainer
      pageTitle='Expenses'
      pageDescription='Record operational expenses, shopping notes, and receipts.'
    >
      <RequirePermission page='accounting' action='view'>
        <ExpensesView />
      </RequirePermission>
    </PageContainer>
  );
}
