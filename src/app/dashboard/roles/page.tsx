import PageContainer from '@/components/layout/page-container';
import { RequirePermission } from '@/features/auth/components/require-permission';
import { RolesView } from '@/features/roles/components/roles-view';

export const metadata = {
  title: 'Roles & Permissions'
};

export default function RolesPage() {
  return (
    <PageContainer
      pageTitle='Roles & Permissions'
      pageDescription='Customize which pages and actions each role can access.'
    >
      <RequirePermission page='roles' action='view'>
        <RolesView />
      </RequirePermission>
    </PageContainer>
  );
}
