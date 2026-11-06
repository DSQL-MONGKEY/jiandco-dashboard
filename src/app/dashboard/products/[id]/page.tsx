import PageContainer from '@/components/layout/page-container';
import { RequirePermission } from '@/features/auth/components/require-permission';
import { ProductEditView } from '@/features/products/components/product-edit-view';

export const metadata = {
  title: 'Product Detail'
};

type PageProps = {
  params: Promise<{ id: string }>;
};

export default async function ProductDetailPage({ params }: PageProps) {
  const { id } = await params;

  return (
    <PageContainer
      pageTitle='Product detail'
      pageDescription='Manage product data, variants, images, and stock.'
    >
      <RequirePermission page='products' action='update'>
        <ProductEditView productId={id} />
      </RequirePermission>
    </PageContainer>
  );
}
