import PageContainer from '@/components/layout/page-container';
import { ProductForm } from '@/features/products/components/product-form';
import { RequirePermission } from '@/features/auth/components/require-permission';

export const metadata = {
  title: 'New Product',
  description: 'Create a new Ji&Co catalog product.'
};

export default function NewProductPage() {
  return (
    <PageContainer
      pageTitle='New product'
      pageDescription='Create a product and its initial variants.'
    >
      <RequirePermission page='products' action='create'>
        <ProductForm />
      </RequirePermission>
    </PageContainer>
  );
}
