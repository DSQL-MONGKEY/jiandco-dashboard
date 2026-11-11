import { mutationOptions, queryOptions } from '@tanstack/react-query';
import {
  createCategory,
  createColor,
  createProduct,
  createProductColor,
  createSize,
  createVariant,
  deleteCategory,
  deleteColor,
  deleteProduct,
  deleteProductColor,
  deleteProductColorImage,
  deleteProductImage,
  deleteSize,
  deleteVariant,
  getCatalogSettings,
  getCategories,
  getColors,
  getProduct,
  getProductColors,
  getProducts,
  getSizes,
  getStockMovements,
  setPrimaryProductImage,
  updateCatalogSettings,
  updateCategory,
  updateColor,
  updateProduct,
  updateProductColor,
  updateSize,
  updateVariant,
  updateVariantStock,
  uploadProductColorImage,
  uploadProductImages
} from './service';
import type {
  CategoryPayload,
  ColorPayload,
  ProductFilters,
  ProductColorPayload,
  ProductPayload,
  SizePayload,
  StockUpdatePayload,
  VariantPayload,
  VariantUpdatePayload
} from './types';

export const productQueries = {
  all: () => ['products'] as const,
  list: (filters: ProductFilters) =>
    queryOptions({
      queryKey: [...productQueries.all(), 'list', filters] as const,
      queryFn: () => getProducts(filters)
    }),
  detail: (id: string) =>
    queryOptions({
      queryKey: [...productQueries.all(), 'detail', id] as const,
      queryFn: () => getProduct(id)
    }),
  movements: (productId: string, variantId: string, page = 1) =>
    queryOptions({
      queryKey: [...productQueries.all(), 'movements', productId, variantId, page] as const,
      queryFn: () => getStockMovements(productId, variantId, page)
    })
};

export const productColorQueries = {
  all: (productId: string) => ['product-colors', productId] as const,
  list: (productId: string) =>
    queryOptions({
      queryKey: [...productColorQueries.all(productId), 'list'] as const,
      queryFn: () => getProductColors(productId)
    })
};

export const catalogSettingsQueries = {
  all: () => ['catalog-settings'] as const,
  detail: () =>
    queryOptions({
      queryKey: [...catalogSettingsQueries.all(), 'detail'] as const,
      queryFn: getCatalogSettings
    })
};

export const categoryQueries = {
  all: () => ['categories'] as const,
  list: () =>
    queryOptions({
      queryKey: [...categoryQueries.all(), 'list'] as const,
      queryFn: () => getCategories()
    })
};

export const sizeQueries = {
  all: () => ['sizes'] as const,
  list: () =>
    queryOptions({
      queryKey: [...sizeQueries.all(), 'list'] as const,
      queryFn: getSizes
    })
};

export const colorQueries = {
  all: () => ['colors'] as const,
  list: () =>
    queryOptions({
      queryKey: [...colorQueries.all(), 'list'] as const,
      queryFn: getColors
    })
};

export const productMutations = {
  create: () =>
    mutationOptions({ mutationFn: (payload: ProductPayload) => createProduct(payload) }),
  update: () =>
    mutationOptions({
      mutationFn: ({ id, payload }: { id: string; payload: ProductPayload }) =>
        updateProduct(id, payload)
    }),
  delete: () => mutationOptions({ mutationFn: (id: string) => deleteProduct(id) }),

  createColor: () =>
    mutationOptions({
      mutationFn: ({ productId, payload }: { productId: string; payload: ProductColorPayload }) =>
        createProductColor(productId, payload)
    }),
  updateColor: () =>
    mutationOptions({
      mutationFn: ({
        productId,
        colorId,
        payload
      }: {
        productId: string;
        colorId: string;
        payload: ProductColorPayload;
      }) => updateProductColor(productId, colorId, payload)
    }),
  deleteColor: () =>
    mutationOptions({
      mutationFn: ({ productId, colorId }: { productId: string; colorId: string }) =>
        deleteProductColor(productId, colorId)
    }),
  uploadColorImage: () =>
    mutationOptions({
      mutationFn: ({
        productId,
        colorId,
        file,
        onProgress
      }: {
        productId: string;
        colorId: string;
        file: File;
        onProgress?: (percent: number) => void;
      }) => uploadProductColorImage(productId, colorId, file, onProgress)
    }),
  deleteColorImage: () =>
    mutationOptions({
      mutationFn: ({ productId, colorId }: { productId: string; colorId: string }) =>
        deleteProductColorImage(productId, colorId)
    }),
  uploadImages: () =>
    mutationOptions({
      mutationFn: ({
        productId,
        files,
        onProgress
      }: {
        productId: string;
        files: File[];
        onProgress?: (percent: number) => void;
      }) => uploadProductImages(productId, files, onProgress)
    }),
  deleteImage: () =>
    mutationOptions({
      mutationFn: ({ productId, imageId }: { productId: string; imageId: string }) =>
        deleteProductImage(productId, imageId)
    }),
  setPrimaryImage: () =>
    mutationOptions({
      mutationFn: ({ productId, imageId }: { productId: string; imageId: string }) =>
        setPrimaryProductImage(productId, imageId)
    }),
  createVariant: () =>
    mutationOptions({
      mutationFn: ({ productId, payload }: { productId: string; payload: VariantPayload }) =>
        createVariant(productId, payload)
    }),
  updateVariant: () =>
    mutationOptions({
      mutationFn: ({
        productId,
        variantId,
        payload
      }: {
        productId: string;
        variantId: string;
        payload: VariantUpdatePayload;
      }) => updateVariant(productId, variantId, payload)
    }),
  deleteVariant: () =>
    mutationOptions({
      mutationFn: ({ productId, variantId }: { productId: string; variantId: string }) =>
        deleteVariant(productId, variantId)
    }),
  updateStock: () =>
    mutationOptions({
      mutationFn: ({
        productId,
        variantId,
        payload
      }: {
        productId: string;
        variantId: string;
        payload: StockUpdatePayload;
      }) => updateVariantStock(productId, variantId, payload)
    })
};

export const catalogSettingsMutations = {
  update: () =>
    mutationOptions({
      mutationFn: (payload: import('@/types/api').CatalogSettings) => updateCatalogSettings(payload)
    })
};

export const categoryMutations = {
  create: () =>
    mutationOptions({ mutationFn: (payload: CategoryPayload) => createCategory(payload) }),
  update: () =>
    mutationOptions({
      mutationFn: ({ id, payload }: { id: string; payload: CategoryPayload }) =>
        updateCategory(id, payload)
    }),
  delete: () => mutationOptions({ mutationFn: (id: string) => deleteCategory(id) })
};

export const sizeMutations = {
  create: () => mutationOptions({ mutationFn: (payload: SizePayload) => createSize(payload) }),
  update: () =>
    mutationOptions({
      mutationFn: ({ id, payload }: { id: string; payload: SizePayload }) => updateSize(id, payload)
    }),
  delete: () => mutationOptions({ mutationFn: (id: string) => deleteSize(id) })
};

export const colorMutations = {
  create: () => mutationOptions({ mutationFn: (payload: ColorPayload) => createColor(payload) }),
  update: () =>
    mutationOptions({
      mutationFn: ({ id, payload }: { id: string; payload: ColorPayload }) =>
        updateColor(id, payload)
    }),
  delete: () => mutationOptions({ mutationFn: (id: string) => deleteColor(id) })
};
