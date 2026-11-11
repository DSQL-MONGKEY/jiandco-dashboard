import { apiClient } from '@/lib/api-client';
import { uploadWithProgress } from '@/lib/upload-client';
import { toQueryString } from '@/lib/query-string';
import type { CatalogSettings, Paginated, StockMovement } from '@/types/api';
import type {
  Category,
  CategoryPayload,
  Color,
  ColorPayload,
  Product,
  ProductFilters,
  ProductColor,
  ProductColorPayload,
  ProductImage,
  ProductPayload,
  ProductVariant,
  Size,
  SizePayload,
  StockUpdatePayload,
  VariantPayload,
  VariantUpdatePayload
} from './types';

export function getCatalogSettings() {
  return apiClient<CatalogSettings>('/catalog/settings');
}

export function updateCatalogSettings(payload: CatalogSettings) {
  return apiClient<CatalogSettings>('/catalog/settings', {
    method: 'PUT',
    body: JSON.stringify(payload)
  });
}

export function getProducts(filters: ProductFilters) {
  return apiClient<Paginated<Product>>(`/products${toQueryString(filters)}`);
}

export function getProduct(id: string) {
  return apiClient<Product>(`/products/${id}`);
}

export function createProduct(payload: ProductPayload) {
  return apiClient<Product>('/products', {
    method: 'POST',
    body: JSON.stringify(payload)
  });
}

export function updateProduct(id: string, payload: ProductPayload) {
  return apiClient<Product>(`/products/${id}`, {
    method: 'PUT',
    body: JSON.stringify(payload)
  });
}

export function deleteProduct(id: string) {
  return apiClient<{ message: string }>(`/products/${id}`, { method: 'DELETE' });
}

export function getProductColors(productId: string) {
  return apiClient<ProductColor[]>(`/products/${productId}/colors`);
}

export function createProductColor(productId: string, payload: ProductColorPayload) {
  return apiClient<ProductColor>(`/products/${productId}/colors`, {
    method: 'POST',
    body: JSON.stringify(payload)
  });
}

export function updateProductColor(
  productId: string,
  colorId: string,
  payload: ProductColorPayload
) {
  return apiClient<ProductColor>(`/products/${productId}/colors/${colorId}`, {
    method: 'PUT',
    body: JSON.stringify(payload)
  });
}

export function deleteProductColor(productId: string, colorId: string) {
  return apiClient<{ message: string }>(`/products/${productId}/colors/${colorId}`, {
    method: 'DELETE'
  });
}

export function uploadProductColorImage(
  productId: string,
  colorId: string,
  file: File,
  onProgress?: (percent: number) => void
) {
  const formData = new FormData();
  formData.append('image', file);
  return uploadWithProgress<ProductColor>(
    `/products/${productId}/colors/${colorId}/image`,
    formData,
    onProgress
  );
}

export function deleteProductColorImage(productId: string, colorId: string) {
  return apiClient<{ message: string }>(`/products/${productId}/colors/${colorId}/image`, {
    method: 'DELETE'
  });
}

export function uploadProductImages(
  productId: string,
  files: File[],
  onProgress?: (percent: number) => void
) {
  const formData = new FormData();
  files.forEach((file) => formData.append('images', file));
  return uploadWithProgress<ProductImage[]>(`/products/${productId}/images`, formData, onProgress);
}

export function deleteProductImage(productId: string, imageId: string) {
  return apiClient<{ message: string }>(`/products/${productId}/images/${imageId}`, {
    method: 'DELETE'
  });
}

export function setPrimaryProductImage(productId: string, imageId: string) {
  return apiClient<{ message: string }>(`/products/${productId}/images/${imageId}/primary`, {
    method: 'PUT'
  });
}

export function createVariant(productId: string, payload: VariantPayload) {
  return apiClient<ProductVariant>(`/products/${productId}/variants`, {
    method: 'POST',
    body: JSON.stringify(payload)
  });
}

export function updateVariant(productId: string, variantId: string, payload: VariantUpdatePayload) {
  return apiClient<ProductVariant>(`/products/${productId}/variants/${variantId}`, {
    method: 'PUT',
    body: JSON.stringify(payload)
  });
}

export function deleteVariant(productId: string, variantId: string) {
  return apiClient<{ message: string }>(`/products/${productId}/variants/${variantId}`, {
    method: 'DELETE'
  });
}

export function updateVariantStock(
  productId: string,
  variantId: string,
  payload: StockUpdatePayload
) {
  return apiClient<ProductVariant>(`/products/${productId}/variants/${variantId}/stock`, {
    method: 'PATCH',
    body: JSON.stringify(payload)
  });
}

export function getStockMovements(productId: string, variantId: string, page = 1, perPage = 20) {
  return apiClient<Paginated<StockMovement>>(
    `/products/${productId}/variants/${variantId}/movements${toQueryString({ page, per_page: perPage })}`
  );
}

export function getCategories(search?: string) {
  return apiClient<Category[]>(`/categories${toQueryString({ search })}`);
}

export function createCategory(payload: CategoryPayload) {
  return apiClient<Category>('/categories', {
    method: 'POST',
    body: JSON.stringify(payload)
  });
}

export function updateCategory(id: string, payload: CategoryPayload) {
  return apiClient<Category>(`/categories/${id}`, {
    method: 'PUT',
    body: JSON.stringify(payload)
  });
}

export function deleteCategory(id: string) {
  return apiClient<{ message: string }>(`/categories/${id}`, { method: 'DELETE' });
}

export function getSizes() {
  return apiClient<Size[]>('/sizes');
}

export function createSize(payload: SizePayload) {
  return apiClient<Size>('/sizes', {
    method: 'POST',
    body: JSON.stringify(payload)
  });
}

export function updateSize(id: string, payload: SizePayload) {
  return apiClient<Size>(`/sizes/${id}`, {
    method: 'PUT',
    body: JSON.stringify(payload)
  });
}

export function deleteSize(id: string) {
  return apiClient<{ message: string }>(`/sizes/${id}`, { method: 'DELETE' });
}

export function getColors() {
  return apiClient<Color[]>('/colors');
}

export function createColor(payload: ColorPayload) {
  return apiClient<Color>('/colors', {
    method: 'POST',
    body: JSON.stringify(payload)
  });
}

export function updateColor(id: string, payload: ColorPayload) {
  return apiClient<Color>(`/colors/${id}`, {
    method: 'PUT',
    body: JSON.stringify(payload)
  });
}

export function deleteColor(id: string) {
  return apiClient<{ message: string }>(`/colors/${id}`, { method: 'DELETE' });
}
