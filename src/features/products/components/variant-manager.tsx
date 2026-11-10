'use client';
// oxlint-disable react/set-state-in-effect -- dialogs sync props into local form state when opened

import { useEffect, useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { AlertModal } from '@/components/modal/alert-modal';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle
} from '@/components/ui/dialog';
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
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle
} from '@/components/ui/sheet';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from '@/components/ui/table';
import { Icons } from '@/components/icons';
import { FieldHint } from '@/components/form-field-hint';
import { formatDateTime } from '@/lib/format';
import { Money } from '@/components/money';
import { productMutations, productQueries, sizeQueries } from '../api/queries';
import type { Product, ProductColor, ProductVariant, Size } from '../api/types';

export function VariantManager({ product }: { product: Product }) {
  const queryClient = useQueryClient();
  const { data: sizes = [] } = useQuery(sizeQueries.list());
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<ProductVariant | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<ProductVariant | null>(null);
  const [stockTarget, setStockTarget] = useState<ProductVariant | null>(null);
  const [movementTarget, setMovementTarget] = useState<ProductVariant | null>(null);

  const invalidate = () => {
    queryClient.invalidateQueries({ queryKey: productQueries.all() });
  };

  const createMutation = useMutation({
    ...productMutations.createVariant(),
    onSuccess: () => {
      toast.success('Variant added');
      setDialogOpen(false);
      invalidate();
    },
    onError: (error) => toast.error(error.message)
  });

  const updateMutation = useMutation({
    ...productMutations.updateVariant(),
    onSuccess: () => {
      toast.success('Variant updated');
      setDialogOpen(false);
      setEditing(null);
      invalidate();
    },
    onError: (error) => toast.error(error.message)
  });

  const deleteMutation = useMutation({
    ...productMutations.deleteVariant(),
    onSuccess: () => {
      toast.success('Variant deleted');
      setDeleteTarget(null);
      invalidate();
    },
    onError: (error) => toast.error(error.message)
  });

  const stockMutation = useMutation({
    ...productMutations.updateStock(),
    onSuccess: () => {
      toast.success('Stock updated');
      setStockTarget(null);
      invalidate();
    },
    onError: (error) => toast.error(error.message)
  });

  function openAdd() {
    setEditing(null);
    setDialogOpen(true);
  }

  function openEdit(variant: ProductVariant) {
    setEditing(variant);
    setDialogOpen(true);
  }

  return (
    <Card>
      <CardHeader className='flex flex-row items-center justify-between'>
        <CardTitle>Variants</CardTitle>
        <Button size='sm' onClick={openAdd}>
          <Icons.add className='mr-1 size-4' />
          Add variant
        </Button>
      </CardHeader>
      <CardContent className='p-0'>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Size / Color</TableHead>
              <TableHead>SKU</TableHead>
              <TableHead className='text-right'>Price</TableHead>
              <TableHead className='text-right'>Stock</TableHead>
              <TableHead>Active</TableHead>
              <TableHead className='w-40 text-right'>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {product.variants.length === 0 && (
              <TableRow>
                <TableCell colSpan={6} className='text-muted-foreground h-20 text-center'>
                  No variants yet.
                </TableCell>
              </TableRow>
            )}
            {product.variants.map((variant) => (
              <TableRow key={variant.id}>
                <TableCell>
                  {variant.size.name} / {variant.color.name}
                </TableCell>
                <TableCell className='font-mono text-xs'>{variant.sku}</TableCell>
                <TableCell className='text-right'>
                  <Money value={variant.price} />
                </TableCell>
                <TableCell className='text-right'>{variant.stock}</TableCell>
                <TableCell>{variant.is_active ? 'Yes' : 'No'}</TableCell>
                <TableCell className='text-right'>
                  <div className='flex justify-end gap-1'>
                    <Button
                      variant='ghost'
                      size='icon'
                      title='Stock history'
                      onClick={() => setMovementTarget(variant)}
                    >
                      <Icons.clock className='size-4' />
                    </Button>
                    <Button
                      variant='ghost'
                      size='icon'
                      title='Update stock'
                      onClick={() => setStockTarget(variant)}
                    >
                      <Icons.stock className='size-4' />
                    </Button>
                    <Button variant='ghost' size='icon' onClick={() => openEdit(variant)}>
                      <Icons.edit className='size-4' />
                    </Button>
                    <Button variant='ghost' size='icon' onClick={() => setDeleteTarget(variant)}>
                      <Icons.trash className='size-4' />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>

      <VariantDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        productId={product.id}
        variant={editing}
        sizes={sizes}
        colors={product.colors ?? []}
        onCreate={(payload) => createMutation.mutate({ productId: product.id, payload })}
        onUpdate={(variantId, payload) =>
          updateMutation.mutate({ productId: product.id, variantId, payload })
        }
        pending={createMutation.isPending || updateMutation.isPending}
      />

      <StockDialog
        open={!!stockTarget}
        onOpenChange={(open) => !open && setStockTarget(null)}
        variant={stockTarget}
        pending={stockMutation.isPending}
        onSubmit={(payload) =>
          stockTarget &&
          stockMutation.mutate({ productId: product.id, variantId: stockTarget.id, payload })
        }
      />

      <MovementSheet
        open={!!movementTarget}
        onOpenChange={(open) => !open && setMovementTarget(null)}
        productId={product.id}
        variant={movementTarget}
      />

      <AlertModal
        isOpen={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={() =>
          deleteTarget &&
          deleteMutation.mutate({ productId: product.id, variantId: deleteTarget.id })
        }
        loading={deleteMutation.isPending}
      />
    </Card>
  );
}

function VariantDialog({
  open,
  onOpenChange,
  variant,
  sizes,
  colors,
  onCreate,
  onUpdate,
  pending
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  productId: string;
  variant: ProductVariant | null;
  sizes: Size[];
  colors: ProductColor[];
  onCreate: (payload: {
    size_id: string;
    product_color_id: string;
    sku: string;
    price: number;
    stock: number;
    is_active: boolean;
  }) => void;
  onUpdate: (
    variantId: string,
    payload: {
      size_id: string;
      product_color_id: string;
      sku: string;
      price: number;
      is_active: boolean;
    }
  ) => void;
  pending: boolean;
}) {
  const [sizeId, setSizeId] = useState('');
  const [colorId, setColorId] = useState('');
  const [sku, setSku] = useState('');
  const [price, setPrice] = useState(0);
  const [stock, setStock] = useState(0);
  const [isActive, setIsActive] = useState(true);
  const sizeOptions = sizes.map((size) => ({ value: size.id, label: size.name }));
  const colorOptions = colors.map((color) => ({ value: color.id, label: color.name }));

  useEffect(() => {
    if (!open) return;
    setSizeId(variant?.size.id ?? '');
    setColorId(variant?.color.id ?? '');
    setSku(variant?.sku ?? '');
    setPrice(variant?.price ?? 0);
    setStock(variant?.stock ?? 0);
    setIsActive(variant?.is_active ?? true);
  }, [open, variant]);

  function submit() {
    if (!sizeId || !colorId || !sku.trim()) {
      toast.error('Size, color, and SKU are required');
      return;
    }
    if (variant) {
      onUpdate(variant.id, {
        size_id: sizeId,
        product_color_id: colorId,
        sku: sku.trim().toUpperCase(),
        price,
        is_active: isActive
      });
    } else {
      onCreate({
        size_id: sizeId,
        product_color_id: colorId,
        sku: sku.trim().toUpperCase(),
        price,
        stock,
        is_active: isActive
      });
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{variant ? 'Edit variant' : 'Add variant'}</DialogTitle>
          <DialogDescription>Variant price and SKU are used as order snapshots.</DialogDescription>
        </DialogHeader>
        <div className='grid gap-4 py-2 md:grid-cols-2'>
          <div className='space-y-2'>
            <Label>Size</Label>
            <Select
              items={sizeOptions}
              value={sizeId}
              onValueChange={(value) => setSizeId(value ?? '')}
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
            <FieldHint>Size shown on the product detail page.</FieldHint>
          </div>
          <div className='space-y-2'>
            <Label>Color</Label>
            <Select
              items={colorOptions}
              value={colorId}
              onValueChange={(value) => setColorId(value ?? '')}
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
            <FieldHint>Color shown on the product detail page.</FieldHint>
          </div>
          <div className='space-y-2'>
            <Label>SKU</Label>
            <Input
              value={sku}
              onChange={(event) => setSku(event.target.value)}
              placeholder='KAOS-M-BLK'
            />
            <FieldHint>Unique code for this size/color combination.</FieldHint>
          </div>
          <div className='space-y-2'>
            <Label>Price (IDR)</Label>
            <Input
              type='number'
              min={0}
              value={price}
              onChange={(event) => setPrice(Number(event.target.value) || 0)}
            />
            <FieldHint>Selling price in rupiah.</FieldHint>
          </div>
          {!variant && (
            <div className='space-y-2'>
              <Label>Initial stock</Label>
              <Input
                type='number'
                min={0}
                value={stock}
                onChange={(event) => setStock(Number(event.target.value) || 0)}
              />
              <FieldHint>Stock added to the inventory ledger.</FieldHint>
            </div>
          )}
          <div className='flex items-center gap-2 pt-6'>
            <input
              id='variant-active'
              type='checkbox'
              checked={isActive}
              onChange={(event) => setIsActive(event.target.checked)}
            />
            <div>
              <Label htmlFor='variant-active'>Active</Label>
              <FieldHint>Inactive variants stay hidden from new orders.</FieldHint>
            </div>
          </div>
        </div>
        <DialogFooter>
          <Button variant='outline' onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <LoadingButton loading={pending} onClick={submit}>
            {variant ? 'Save' : 'Add'}
          </LoadingButton>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function StockDialog({
  open,
  onOpenChange,
  variant,
  pending,
  onSubmit
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  variant: ProductVariant | null;
  pending: boolean;
  onSubmit: (payload: { stock: number; note: string }) => void;
}) {
  const [stock, setStock] = useState(0);
  const [note, setNote] = useState('');

  useEffect(() => {
    if (!open) return;
    setStock(variant?.stock ?? 0);
    setNote('');
  }, [open, variant]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Update stock</DialogTitle>
          <DialogDescription>
            {variant?.sku} · current stock {variant?.stock ?? 0}
          </DialogDescription>
        </DialogHeader>
        <div className='space-y-4 py-2'>
          <div className='space-y-2'>
            <Label>New stock</Label>
            <Input
              type='number'
              min={0}
              value={stock}
              onChange={(event) => setStock(Number(event.target.value) || 0)}
            />
            <FieldHint>Total stock after this adjustment.</FieldHint>
          </div>
          <div className='space-y-2'>
            <Label>Note</Label>
            <Input
              value={note}
              onChange={(event) => setNote(event.target.value)}
              placeholder='Stock opname'
            />
            <FieldHint>Reason for the stock change.</FieldHint>
          </div>
        </div>
        <DialogFooter>
          <Button variant='outline' onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <LoadingButton loading={pending} onClick={() => onSubmit({ stock, note })}>
            Save stock
          </LoadingButton>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function MovementSheet({
  open,
  onOpenChange,
  productId,
  variant
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  productId: string;
  variant: ProductVariant | null;
}) {
  const { data, isLoading } = useQuery({
    ...productQueries.movements(productId, variant?.id ?? '', 1),
    enabled: open && !!variant
  });

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className='sm:max-w-2xl'>
        <SheetHeader>
          <SheetTitle>Stock movements</SheetTitle>
          <SheetDescription>
            {variant?.sku} · {variant?.size.name} / {variant?.color.name}
          </SheetDescription>
        </SheetHeader>
        <div className='overflow-auto px-4 pb-4'>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Type</TableHead>
                <TableHead className='text-right'>Qty</TableHead>
                <TableHead className='text-right'>Before</TableHead>
                <TableHead className='text-right'>After</TableHead>
                <TableHead>Note</TableHead>
                <TableHead>Date</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading && (
                <TableRow>
                  <TableCell colSpan={6} className='text-muted-foreground h-20 text-center'>
                    Loading...
                  </TableCell>
                </TableRow>
              )}
              {!isLoading && (data?.items.length ?? 0) === 0 && (
                <TableRow>
                  <TableCell colSpan={6} className='text-muted-foreground h-20 text-center'>
                    No movements yet.
                  </TableCell>
                </TableRow>
              )}
              {data?.items.map((movement) => (
                <TableRow key={movement.id}>
                  <TableCell className='capitalize'>{movement.type}</TableCell>
                  <TableCell className='text-right'>{movement.quantity}</TableCell>
                  <TableCell className='text-right'>{movement.stock_before}</TableCell>
                  <TableCell className='text-right'>{movement.stock_after}</TableCell>
                  <TableCell className='text-muted-foreground max-w-48 truncate text-xs'>
                    {movement.note || movement.reference_type}
                  </TableCell>
                  <TableCell className='text-xs'>{formatDateTime(movement.created_at)}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </SheetContent>
    </Sheet>
  );
}
