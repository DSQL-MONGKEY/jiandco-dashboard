// oxlint-disable next/no-img-element
'use client';

import { useRef, useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Icons } from '@/components/icons';
import { mediaUrl } from '@/lib/media';
import { MAX_IMAGE_SIZE, MAX_UPLOAD_LABEL } from '@/lib/upload';
import { productMutations, productQueries } from '../api/queries';
import type { Product } from '../api/types';

export function ImageManager({ product }: { product: Product }) {
  const queryClient = useQueryClient();
  const inputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);

  const invalidate = () => {
    queryClient.invalidateQueries({ queryKey: productQueries.all() });
  };

  const uploadMutation = useMutation({
    ...productMutations.uploadImages(),
    onSuccess: () => {
      toast.success('Images uploaded');
      invalidate();
    },
    onError: (error) => toast.error(error.message),
    onSettled: () => setUploading(false)
  });

  const deleteMutation = useMutation({
    ...productMutations.deleteImage(),
    onSuccess: () => {
      toast.success('Image deleted');
      invalidate();
    },
    onError: (error) => toast.error(error.message)
  });

  const primaryMutation = useMutation({
    ...productMutations.setPrimaryImage(),
    onSuccess: () => {
      toast.success('Primary image updated');
      invalidate();
    },
    onError: (error) => toast.error(error.message)
  });

  function onFilesSelected(files: FileList | null) {
    if (!files || files.length === 0) return;
    const selected = Array.from(files);
    const oversized = selected.find((file) => file.size > MAX_IMAGE_SIZE);
    if (oversized) {
      toast.error(`${oversized.name} exceeds the ${MAX_UPLOAD_LABEL} limit.`);
      if (inputRef.current) inputRef.current.value = '';
      return;
    }
    setUploading(true);
    uploadMutation.mutate({ productId: product.id, files: selected });
    if (inputRef.current) inputRef.current.value = '';
  }

  return (
    <Card>
      <CardHeader className='flex flex-row items-start justify-between gap-4'>
        <div>
          <CardTitle>Images</CardTitle>
          <p className='text-muted-foreground mt-1 text-xs'>
            JPEG, PNG, or WebP · max {MAX_UPLOAD_LABEL} per image.
          </p>
        </div>
        <div>
          <input
            ref={inputRef}
            type='file'
            accept='image/jpeg,image/png,image/webp'
            multiple
            className='hidden'
            onChange={(event) => onFilesSelected(event.target.files)}
          />
          <Button
            size='sm'
            variant='outline'
            disabled={uploading}
            onClick={() => inputRef.current?.click()}
          >
            <Icons.upload className='mr-1 size-4' />
            {uploading ? 'Uploading...' : 'Upload images'}
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        {product.images.length === 0 ? (
          <div className='border-muted text-muted-foreground flex h-32 items-center justify-center rounded-lg border border-dashed text-sm'>
            No images uploaded yet.
          </div>
        ) : (
          <div className='grid grid-cols-2 gap-3 md:grid-cols-4'>
            {product.images.map((image) => (
              <div key={image.id} className='group relative overflow-hidden rounded-lg border'>
                {mediaUrl(image.url, image.object_key) ? (
                  <img
                    src={mediaUrl(image.url, image.object_key)}
                    alt={image.alt_text || product.name}
                    className='aspect-square w-full object-cover'
                  />
                ) : (
                  <div className='bg-muted text-muted-foreground flex aspect-square w-full items-center justify-center p-2 text-center text-xs'>
                    {image.object_key}
                  </div>
                )}
                <div className='absolute inset-x-0 bottom-0 flex items-center justify-between gap-1 bg-black/60 p-2'>
                  {image.is_primary ? (
                    <Badge variant='default'>Primary</Badge>
                  ) : (
                    <Button
                      size='xs'
                      variant='secondary'
                      onClick={() =>
                        primaryMutation.mutate({ productId: product.id, imageId: image.id })
                      }
                    >
                      Set primary
                    </Button>
                  )}
                  <Button
                    size='icon-xs'
                    variant='destructive'
                    onClick={() =>
                      deleteMutation.mutate({ productId: product.id, imageId: image.id })
                    }
                  >
                    <Icons.trash className='size-3' />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
