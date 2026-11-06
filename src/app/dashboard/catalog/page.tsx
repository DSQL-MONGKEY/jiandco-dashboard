import PageContainer from '@/components/layout/page-container';
import { RequirePermission } from '@/features/auth/components/require-permission';
import { CatalogView } from '@/features/products/components/catalog-view';

export const metadata = {
  title: 'Catalog',
  description: 'Manage Ji&Co catalog categories, sizes, colors, and public page settings.'
};

export default function CatalogPage() {
  return (
    <PageContainer
      pageTitle='Catalog'
      pageDescription='Manage product categories, sizes, and colors.'
    >
      <RequirePermission page='products' action='view'>
        <CatalogView />
      </RequirePermission>
    </PageContainer>
  );
}
