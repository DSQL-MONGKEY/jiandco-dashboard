import PageContainer from '@/components/layout/page-container';
import { ProfileView } from '@/features/profile/components/profile-view';

export const metadata = {
  title: 'Profile',
  description: 'Manage your Ji&Co dashboard account.'
};

export default function ProfilePage() {
  return (
    <PageContainer
      pageTitle='Profile'
      pageDescription='Manage your account information and password.'
    >
      <ProfileView />
    </PageContainer>
  );
}
