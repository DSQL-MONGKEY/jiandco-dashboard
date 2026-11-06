import PageContainer from '@/components/layout/page-container';
import { RequirePermission } from '@/features/auth/components/require-permission';
import { CatalogView } from '@/features/products/components/catalog-view';

export const metadata = {
  title: 'Catalog'
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
