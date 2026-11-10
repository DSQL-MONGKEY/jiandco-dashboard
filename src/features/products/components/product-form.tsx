'use client';

import { useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { LoadingButton } from '@/components/ui/loading-button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Icons } from '@/components/icons';
import { FieldHint } from '@/components/form-field-hint';
import { categoryQueries, productMutations, productQueries, sizeQueries } from '../api/queries';
import type { Product, ProductColorPayload, VariantPayload } from '../api/types';

type VariantDraft = VariantPayload & { key: string };
type ColorDraft = ProductColorPayload & { key: string };

const STATUS_OPTIONS = [
  { value: 'draft', label: 'Draft' },
  { value: 'active', label: 'Active' },
  { value: 'archived', label: 'Archived' }
];

const BADGE_TONE_OPTIONS = [
  { value: 'light', label: 'Light' },
  { value: 'accent', label: 'Accent' }
];

function emptyVariant(): VariantDraft {
  return {
    key: crypto.randomUUID(),
    size_id: '',
    product_color_id: '',
    sku: '',
    price: 0,
    stock: 0,
    is_active: true
  };
}

function emptyColor(): ColorDraft {
  return {
    key: crypto.randomUUID(),
    name: '',
    hex_code: '#8B5E3C',
    sort_order: 0
  };
}

export function ProductForm({ initialData }: { initialData?: Product | null }) {
  const router = useRouter();
  const queryClient = useQueryClient();
  const isEdit = !!initialData;

  const [name, setName] = useState(initialData?.name ?? '');
  const [slug, setSlug] = useState(initialData?.slug ?? '');
  const [categoryId, setCategoryId] = useState(initialData?.category_id ?? 'none');
  const [description, setDescription] = useState(initialData?.description ?? '');
  const [status, setStatus] = useState<'draft' | 'active' | 'archived'>(
    initialData?.status ?? 'active'
  );
  const [shopeeURL, setShopeeURL] = useState(initialData?.shopee_url ?? '');
  const [shopeePrice, setShopeePrice] = useState(initialData?.shopee_price ?? 0);
  const [details, setDetails] = useState((initialData?.details ?? []).join('\n'));
  const [badge, setBadge] = useState(initialData?.badge ?? '');
  const [badgeTone, setBadgeTone] = useState<'light' | 'accent'>(
    initialData?.badge_tone ?? 'light'
  );
  const [sortOrder, setSortOrder] = useState(initialData?.sort_order ?? 0);
  const [colors, setColors] = useState<ColorDraft[]>([emptyColor()]);
  const [variants, setVariants] = useState<VariantDraft[]>([emptyVariant()]);

  const { data: categories = [] } = useQuery(categoryQueries.list());
  const { data: sizes = [] } = useQuery(sizeQueries.list());

  const categoryOptions = [
    { value: 'none', label: 'No category' },
    ...categories.map((category) => ({ value: category.id, label: category.name }))
  ];
  const sizeOptions = sizes.map((size) => ({ value: size.id, label: size.name }));
  const colorOptions = colors
    .filter((color) => color.name.trim())
    .map((color) => ({ value: color.key, label: color.name }));

  const createMutation = useMutation({
    ...productMutations.create(),
    onSuccess: (product) => {
      toast.success('Product created');
      queryClient.invalidateQueries({ queryKey: productQueries.all() });
      router.push(`/dashboard/products/${product.id}`);
    },
    onError: (error) => toast.error(error.message)
  });

  const updateMutation = useMutation({
    ...productMutations.update(),
    onSuccess: () => {
      toast.success('Product updated');
      queryClient.invalidateQueries({ queryKey: productQueries.all() });
      router.refresh();
    },
    onError: (error) => toast.error(error.message)
  });

  const pending = createMutation.isPending || updateMutation.isPending;

  function updateVariant(key: string, patch: Partial<VariantDraft>) {
    setVariants((current) =>
      current.map((variant) => (variant.key === key ? { ...variant, ...patch } : variant))
    );
  }

  function updateColor(key: string, patch: Partial<ColorDraft>) {
    setColors((current) =>
      current.map((color) => (color.key === key ? { ...color, ...patch } : color))
    );
  }

  function submit() {
    if (!name.trim()) {
      toast.error('Product name is required');
      return;
    }

    const payload = {
      category_id: categoryId === 'none' ? null : categoryId,
      name: name.trim(),
      slug: slug.trim() || undefined,
      description: description.trim(),
      status,
      shopee_url: shopeeURL.trim(),
      shopee_price: shopeePrice,
      details: details
        .split('\n')
        .map((item) => item.trim())
        .filter(Boolean),
      badge: badge.trim(),
      badge_tone: badgeTone,
      sort_order: sortOrder
    };

    if (initialData) {
      updateMutation.mutate({ id: initialData.id, payload });
      return;
    }

    const validColors = colors
      .filter((color) => color.name.trim())
      .map(({ key, name, hex_code, sort_order }) => ({
        id: key,
        name: name.trim(),
        hex_code: hex_code?.trim() || undefined,
        sort_order
      }));

    if (validColors.length === 0) {
      toast.error('Add at least one product color.');
      return;
    }
    if (new Set(validColors.map((color) => color.name.toLowerCase())).size !== validColors.length) {
      toast.error('Color names must be unique.');
      return;
    }

    const validVariants = variants
      .filter((variant) => variant.size_id && variant.product_color_id && variant.sku.trim())
      .map(({ key: _key, ...variant }) => ({
        ...variant,
        sku: variant.sku.trim().toUpperCase()
      }));

    if (validVariants.length === 0) {
      toast.error('Add at least one complete variant with size, color, and SKU.');
      return;
    }
    if (
      validVariants.some(
        (variant) => !validColors.some((color) => color.id === variant.product_color_id)
      )
    ) {
      toast.error('Each variant must use a color defined for this product.');
      return;
    }
    if (validVariants.some((variant) => variant.price <= 0)) {
      toast.error('Each variant price must be greater than 0.');
      return;
    }

    createMutation.mutate({ ...payload, colors: validColors, variants: validVariants });
  }

  return (
    <Card className='mx-auto w-full max-w-4xl'>
      <CardHeader>
        <CardTitle>{isEdit ? 'Edit product' : 'Create product'}</CardTitle>
      </CardHeader>
      <CardContent className='space-y-6'>
        <div className='grid gap-4 md:grid-cols-2'>
          <div className='space-y-2'>
            <Label htmlFor='name'>Name *</Label>
            <Input
              id='name'
              value={name}
              onChange={(event) => setName(event.target.value)}
              placeholder='Kaos Oversize'
            />
            <FieldHint>Shown in the dashboard and public catalog.</FieldHint>
          </div>
          <div className='space-y-2'>
            <Label htmlFor='slug'>Slug</Label>
            <Input
              id='slug'
              value={slug}
              onChange={(event) => setSlug(event.target.value)}
              placeholder='kaos-oversize'
            />
            <FieldHint>Leave blank to generate it from the product name.</FieldHint>
          </div>
          <div className='space-y-2'>
            <Label>Category</Label>
            <Select
              items={categoryOptions}
              value={categoryId}
              onValueChange={(value) => setCategoryId(value ?? 'none')}
            >
              <SelectTrigger>
                <SelectValue placeholder='Select category' />
              </SelectTrigger>
              <SelectContent>
                {categoryOptions.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <FieldHint>Determines the catalog collection this product belongs to.</FieldHint>
          </div>
          <div className='space-y-2'>
            <Label>Status</Label>
            <Select
              items={STATUS_OPTIONS}
              value={status}
              onValueChange={(value) => setStatus((value ?? 'active') as typeof status)}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {STATUS_OPTIONS.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <FieldHint>Only Active products appear in the public catalog.</FieldHint>
          </div>
        </div>

        <div className='space-y-2'>
          <Label htmlFor='description'>Description</Label>
          <Textarea
            id='description'
            value={description}
            onChange={(event) => setDescription(event.target.value)}
            placeholder='Product description'
            rows={4}
          />
          <FieldHint>Short product description shown on the catalog detail page.</FieldHint>
        </div>

        <div className='grid gap-4 md:grid-cols-2'>
          <div className='space-y-2'>
            <Label htmlFor='shopee-url'>Shopee URL</Label>
            <Input
              id='shopee-url'
              value={shopeeURL}
              onChange={(event) => setShopeeURL(event.target.value)}
              placeholder='https://shopee.co.id/...'
            />
            <FieldHint>Optional link to the same product on Shopee.</FieldHint>
          </div>
          <div className='space-y-2'>
            <Label htmlFor='shopee-price'>Shopee price</Label>
            <Input
              id='shopee-price'
              type='number'
              min={0}
              value={shopeePrice}
              onChange={(event) => setShopeePrice(Number(event.target.value) || 0)}
            />
            <FieldHint>In rupiah. Set 0 to follow the WhatsApp price.</FieldHint>
          </div>
          <div className='space-y-2'>
            <Label htmlFor='badge'>Badge</Label>
            <Input
              id='badge'
              value={badge}
              onChange={(event) => setBadge(event.target.value)}
              placeholder='New / Bestseller / Limited'
            />
            <FieldHint>Optional short label shown on the catalog card.</FieldHint>
          </div>
          <div className='space-y-2'>
            <Label>Badge tone</Label>
            <Select
              items={BADGE_TONE_OPTIONS}
              value={badgeTone}
              onValueChange={(value) => setBadgeTone((value ?? 'light') as 'light' | 'accent')}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {BADGE_TONE_OPTIONS.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <FieldHint>Choose the badge color style.</FieldHint>
          </div>
          <div className='space-y-2'>
            <Label htmlFor='sort-order'>Catalog sort order</Label>
            <Input
              id='sort-order'
              type='number'
              value={sortOrder}
              onChange={(event) => setSortOrder(Number(event.target.value) || 0)}
            />
            <FieldHint>Lower numbers appear first in the catalog.</FieldHint>
          </div>
        </div>

        <div className='space-y-2'>
          <Label htmlFor='details'>Catalog details</Label>
          <Textarea
            id='details'
            value={details}
            onChange={(event) => setDetails(event.target.value)}
            placeholder={'One detail per line\n100% linen\nRelaxed fit'}
            rows={4}
          />
          <FieldHint>One detail per line, for example fabric or fit.</FieldHint>
        </div>

        {!isEdit && (
          <div className='space-y-3'>
            <div className='flex items-center justify-between'>
              <div>
                <h3 className='font-medium'>Colors</h3>
                <p className='text-muted-foreground text-sm'>
                  Define the colors available for this product. Upload one preview image per color
                  after saving.
                </p>
              </div>
              <Button
                type='button'
                variant='outline'
                size='sm'
                onClick={() => setColors((current) => [...current, emptyColor()])}
              >
                <Icons.add className='mr-1 size-4' />
                Add color
              </Button>
            </div>
            <div className='space-y-3'>
              {colors.map((color) => (
                <div
                  key={color.key}
                  className='grid gap-3 rounded-lg border p-3 md:grid-cols-[1fr_120px_100px_auto]'
                >
                  <div className='space-y-1'>
                    <Label className='text-xs'>Color name</Label>
                    <Input
                      value={color.name}
                      onChange={(event) => updateColor(color.key, { name: event.target.value })}
                      placeholder='e.g. Cocoa'
                    />
                  </div>
                  <div className='space-y-1'>
                    <Label className='text-xs'>Hex</Label>
                    <div className='flex gap-2'>
                      <Input
                        type='color'
                        className='w-12 p-1'
                        value={color.hex_code || '#8B5E3C'}
                        onChange={(event) =>
                          updateColor(color.key, { hex_code: event.target.value })
                        }
                      />
                      <Input
                        value={color.hex_code ?? ''}
                        onChange={(event) =>
                          updateColor(color.key, { hex_code: event.target.value })
                        }
                        placeholder='#8B5E3C'
                      />
                    </div>
                  </div>
                  <div className='space-y-1'>
                    <Label className='text-xs'>Sort</Label>
                    <Input
                      type='number'
                      value={color.sort_order ?? 0}
                      onChange={(event) =>
                        updateColor(color.key, { sort_order: Number(event.target.value) || 0 })
                      }
                    />
                  </div>
                  <Button
                    type='button'
                    variant='ghost'
                    size='icon'
                    onClick={() =>
                      setColors((current) =>
                        current.length === 1
                          ? current
                          : current.filter((item) => item.key !== color.key)
                      )
                    }
                  >
                    <Icons.trash className='size-4' />
                  </Button>
                </div>
              ))}
            </div>
            <FieldHint>
              Each color becomes a swatch on the public product page. Add at least one variant per
              color.
            </FieldHint>
          </div>
        )}

        {!isEdit && (
          <div className='space-y-3'>
            <div className='flex items-center justify-between'>
              <div>
                <h3 className='font-medium'>Variants</h3>
                <p className='text-muted-foreground text-sm'>
                  Add at least one complete size/color variant with SKU and price.
                </p>
              </div>
              <Button
                type='button'
                variant='outline'
                size='sm'
                onClick={() => setVariants((current) => [...current, emptyVariant()])}
              >
                <Icons.add className='mr-1 size-4' />
                Add variant
              </Button>
            </div>

            <div className='space-y-3'>
              {variants.map((variant) => (
                <div
                  key={variant.key}
                  className='grid gap-3 rounded-lg border p-3 md:grid-cols-[1fr_1fr_1.2fr_0.8fr_0.7fr_auto]'
                >
                  <div className='space-y-1'>
                    <Label className='text-xs'>Size</Label>
                    <Select
                      items={sizeOptions}
                      value={variant.size_id}
                      onValueChange={(value) =>
                        updateVariant(variant.key, { size_id: value ?? '' })
                      }
                    >
                      <SelectTrigger>
                        <SelectValue placeholder='Select size' />
                      </SelectTrigger>
                      <SelectContent>
                        {sizeOptions.map((option) => (
                          <SelectItem key={option.value} value={option.value}>
                            {option.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className='space-y-1'>
                    <Label className='text-xs'>Color</Label>
                    <Select
                      items={colorOptions}
                      value={variant.product_color_id}
                      onValueChange={(value) =>
                        updateVariant(variant.key, { product_color_id: value ?? '' })
                      }
                    >
                      <SelectTrigger>
                        <SelectValue placeholder='Select color' />
                      </SelectTrigger>
                      <SelectContent>
                        {colorOptions.map((option) => (
                          <SelectItem key={option.value} value={option.value}>
                            {option.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className='space-y-1'>
                    <Label className='text-xs'>SKU</Label>
                    <Input
                      value={variant.sku}
                      onChange={(event) => updateVariant(variant.key, { sku: event.target.value })}
                      placeholder='e.g. CHONG-M-COCOA'
                    />
                  </div>
                  <div className='space-y-1'>
                    <Label className='text-xs'>Price (IDR)</Label>
                    <Input
                      type='number'
                      min={0}
                      value={variant.price}
                      onChange={(event) =>
                        updateVariant(variant.key, { price: Number(event.target.value) })
                      }
                      placeholder='Selling price'
                    />
                  </div>
                  <div className='space-y-1'>
                    <Label className='text-xs'>Stock</Label>
                    <Input
                      type='number'
                      min={0}
                      value={variant.stock}
                      onChange={(event) =>
                        updateVariant(variant.key, { stock: Number(event.target.value) })
                      }
                      placeholder='Initial stock'
                    />
                  </div>
                  <Button
                    type='button'
                    variant='ghost'
                    size='icon'
                    onClick={() =>
                      setVariants((current) =>
                        current.length === 1
                          ? current
                          : current.filter((item) => item.key !== variant.key)
                      )
                    }
                  >
                    <Icons.trash className='size-4' />
                  </Button>
                </div>
              ))}
            </div>
            <FieldHint>
              After creating the product, upload images from the product detail page.
            </FieldHint>
          </div>
        )}

        {isEdit && (
          <p className='text-muted-foreground text-sm'>
            Variants, images, and stock are managed below.
          </p>
        )}

        <div className='flex justify-end gap-2'>
          <Button type='button' variant='outline' onClick={() => router.back()}>
            Cancel
          </Button>
          <LoadingButton loading={pending} type='button' onClick={submit}>
            {isEdit ? 'Save changes' : 'Create product'}
          </LoadingButton>
        </div>
      </CardContent>
    </Card>
  );
}
