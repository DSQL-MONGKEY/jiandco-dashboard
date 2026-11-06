import PageContainer from '@/components/layout/page-container';
import { RequirePermission } from '@/features/auth/components/require-permission';
import { UsersView } from '@/features/users/components/users-view';

export const metadata = {
  title: 'Users',
  description: 'Manage Ji&Co dashboard users and access.'
};

export default function UsersPage() {
  return (
    <PageContainer
      pageTitle='Users'
      pageDescription='Manage dashboard users, roles, and account status.'
    >
      <RequirePermission page='users' action='view'>
        <UsersView />
      </RequirePermission>
    </PageContainer>
  );
}
