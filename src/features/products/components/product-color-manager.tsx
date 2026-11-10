'use client';

import { useEffect, useRef, useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
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
import { Icons } from '@/components/icons';
import { FieldHint } from '@/components/form-field-hint';
import { mediaUrl } from '@/lib/media';
import { MAX_IMAGE_SIZE, MAX_UPLOAD_LABEL } from '@/lib/upload';
import { productMutations, productQueries } from '../api/queries';
import type { Product, ProductColor, ProductColorPayload } from '../api/types';

type EditTarget = ProductColor | 'new' | null;

export function ProductColorManager({ product }: { product: Product }) {
  const colors = product.colors ?? [];
  const queryClient = useQueryClient();
  const inputRef = useRef<HTMLInputElement>(null);
  const uploadTargetRef = useRef<ProductColor | null>(null);
  const [uploadTarget, setUploadTarget] = useState<ProductColor | null>(null);
  const [editTarget, setEditTarget] = useState<EditTarget>(null);
  const [deleteTarget, setDeleteTarget] = useState<ProductColor | null>(null);

  const invalidate = () => {
    queryClient.invalidateQueries({ queryKey: productQueries.all() });
  };

  const createMutation = useMutation({
    ...productMutations.createColor(),
    onSuccess: () => {
      toast.success('Color added');
      setEditTarget(null);
      invalidate();
    },
    onError: (error) => toast.error(error.message)
  });

  const updateMutation = useMutation({
    ...productMutations.updateColor(),
    onSuccess: () => {
      toast.success('Color updated');
      setEditTarget(null);
      invalidate();
    },
    onError: (error) => toast.error(error.message)
  });

  const deleteMutation = useMutation({
    ...productMutations.deleteColor(),
    onSuccess: () => {
      toast.success('Color deleted');
      setDeleteTarget(null);
      invalidate();
    },
    onError: (error) => toast.error(error.message)
  });

  const uploadMutation = useMutation({
    ...productMutations.uploadColorImage(),
    onSuccess: () => {
      toast.success('Color preview updated');
      uploadTargetRef.current = null;
      setUploadTarget(null);
      invalidate();
    },
    onError: (error) => toast.error(error.message)
  });

  const deleteImageMutation = useMutation({
    ...productMutations.deleteColorImage(),
    onSuccess: () => {
      toast.success('Color preview removed');
      invalidate();
    },
    onError: (error) => toast.error(error.message)
  });

  function onFileSelected(files: FileList | null) {
    const file = files?.[0];
    const target = uploadTargetRef.current ?? uploadTarget;
    if (!file || !target) return;
    if (file.size > MAX_IMAGE_SIZE) {
      toast.error(`Color preview must be at most ${MAX_UPLOAD_LABEL}.`);
    } else {
      uploadMutation.mutate({
        productId: product.id,
        colorId: target.id,
        file
      });
    }
    if (inputRef.current) inputRef.current.value = '';
  }

  function chooseImage(color: ProductColor) {
    uploadTargetRef.current = color;
    setUploadTarget(color);
    inputRef.current?.click();
  }

  return (
    <Card>
      <CardHeader className='flex flex-row items-start justify-between gap-4'>
        <div>
          <CardTitle>Colors</CardTitle>
          <p className='text-muted-foreground mt-1 text-xs'>
            One preview image per color. JPEG, PNG, or WebP · max {MAX_UPLOAD_LABEL}.
          </p>
        </div>
        <Button size='sm' onClick={() => setEditTarget('new')}>
          <Icons.add className='mr-1 size-4' />
          Add color
        </Button>
      </CardHeader>
      <CardContent>
        <input
          ref={inputRef}
          type='file'
          accept='image/jpeg,image/png,image/webp'
          className='hidden'
          onChange={(event) => onFileSelected(event.target.files)}
        />

        {colors.length === 0 ? (
          <div className='border-muted text-muted-foreground flex h-28 items-center justify-center rounded-lg border border-dashed text-sm'>
            No colors yet. Add a color and upload its preview image.
          </div>
        ) : (
          <div className='grid gap-3 sm:grid-cols-2 xl:grid-cols-3'>
            {colors.map((color) => {
              const image = mediaUrl(color.image_url, color.image_key);
              return (
                <div key={color.id} className='overflow-hidden rounded-lg border'>
                  <div className='bg-muted relative aspect-[4/3]'>
                    {image ? (
                      // oxlint-disable-next-line next/no-img-element
                      <img
                        src={image}
                        alt={`${product.name} ${color.name}`}
                        className='size-full object-cover'
                      />
                    ) : (
                      <div className='text-muted-foreground grid size-full place-items-center text-xs'>
                        No preview image
                      </div>
                    )}
                  </div>
                  <div className='space-y-2 p-3'>
                    <div className='flex items-center gap-2'>
                      <span
                        className='size-4 shrink-0 rounded-full border'
                        style={{ backgroundColor: color.hex_code || 'transparent' }}
                      />
                      <p className='min-w-0 truncate font-medium'>{color.name}</p>
                      <span className='text-muted-foreground ml-auto font-mono text-[10px]'>
                        {color.hex_code || '-'}
                      </span>
                    </div>
                    <div className='flex flex-wrap gap-1'>
                      <Button
                        size='xs'
                        variant='outline'
                        onClick={() => chooseImage(color)}
                        disabled={uploadMutation.isPending}
                      >
                        <Icons.upload className='mr-1 size-3' />
                        {image ? 'Replace' : 'Upload'}
                      </Button>
                      <Button size='xs' variant='ghost' onClick={() => setEditTarget(color)}>
                        <Icons.edit className='mr-1 size-3' />
                        Edit
                      </Button>
                      {image && (
                        <Button
                          size='xs'
                          variant='ghost'
                          onClick={() =>
                            deleteImageMutation.mutate({
                              productId: product.id,
                              colorId: color.id
                            })
                          }
                        >
                          Remove image
                        </Button>
                      )}
                      <Button
                        size='xs'
                        variant='ghost'
                        className='text-destructive'
                        onClick={() => setDeleteTarget(color)}
                      >
                        <Icons.trash className='mr-1 size-3' />
                        Delete
                      </Button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </CardContent>

      <ProductColorDialog
        target={editTarget}
        onClose={() => setEditTarget(null)}
        onSubmit={(payload) => {
          if (editTarget === 'new') {
            createMutation.mutate({ productId: product.id, payload });
          } else if (editTarget) {
            updateMutation.mutate({
              productId: product.id,
              colorId: editTarget.id,
              payload
            });
          }
        }}
        pending={createMutation.isPending || updateMutation.isPending}
      />

      <AlertModal
        isOpen={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={() =>
          deleteTarget && deleteMutation.mutate({ productId: product.id, colorId: deleteTarget.id })
        }
        loading={deleteMutation.isPending}
      />
    </Card>
  );
}

function ProductColorDialog({
  target,
  onClose,
  onSubmit,
  pending
}: {
  target: EditTarget;
  onClose: () => void;
  onSubmit: (payload: ProductColorPayload) => void;
  pending: boolean;
}) {
  const color = target && target !== 'new' ? target : null;
  const [name, setName] = useState('');
  const [hexCode, setHexCode] = useState('#8B5E3C');
  const [sortOrder, setSortOrder] = useState(0);

  const open = target !== null;

  useEffect(() => {
    if (!target) return;
    // oxlint-disable-next-line react/set-state-in-effect -- sync dialog fields with selected color
    setName(color?.name ?? '');
    setHexCode(color?.hex_code || '#8B5E3C');
    setSortOrder(color?.sort_order ?? 0);
  }, [target, color]);

  return (
    <Dialog
      open={open}
      onOpenChange={(nextOpen) => {
        if (!nextOpen) onClose();
      }}
    >
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{color ? 'Edit color' : 'Add color'}</DialogTitle>
          <DialogDescription>
            Colors are specific to this product and appear as swatches on the public page.
          </DialogDescription>
        </DialogHeader>
        <div className='space-y-4 py-2'>
          <div className='space-y-2'>
            <Label>Name</Label>
            <Input
              value={name}
              onChange={(event) => setName(event.target.value)}
              placeholder='e.g. Cocoa'
            />
          </div>
          <div className='space-y-2'>
            <Label>Hex code</Label>
            <div className='flex gap-2'>
              <Input
                type='color'
                className='w-14 p-1'
                value={hexCode}
                onChange={(event) => setHexCode(event.target.value)}
              />
              <Input
                value={hexCode}
                onChange={(event) => setHexCode(event.target.value)}
                placeholder='#8B5E3C'
              />
            </div>
            <FieldHint>Used for the color swatch on the product page.</FieldHint>
          </div>
          <div className='space-y-2'>
            <Label>Sort order</Label>
            <Input
              type='number'
              value={sortOrder}
              onChange={(event) => setSortOrder(Number(event.target.value) || 0)}
            />
            <FieldHint>Lower numbers appear first.</FieldHint>
          </div>
        </div>
        <DialogFooter>
          <Button variant='outline' onClick={onClose}>
            Cancel
          </Button>
          <LoadingButton
            loading={pending}
            onClick={() =>
              onSubmit({
                name: name.trim(),
                hex_code: hexCode.trim() || undefined,
                sort_order: sortOrder
              })
            }
            disabled={!name.trim()}
          >
            Save
          </LoadingButton>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
