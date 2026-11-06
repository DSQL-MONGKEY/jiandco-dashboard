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
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from '@/components/ui/table';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Textarea } from '@/components/ui/textarea';
import { Icons } from '@/components/icons';
import { FieldHint } from '@/components/form-field-hint';
import { CatalogSettingsForm } from './catalog-settings-form';
import {
  categoryMutations,
  categoryQueries,
  colorMutations,
  colorQueries,
  sizeMutations,
  sizeQueries
} from '../api/queries';
import type { Category, Color, Size } from '../api/types';

type EditTarget =
  | { kind: 'category'; item?: Category }
  | { kind: 'size'; item?: Size }
  | { kind: 'color'; item?: Color }
  | null;

type DeleteTarget =
  | { kind: 'category'; item: Category }
  | { kind: 'size'; item: Size }
  | { kind: 'color'; item: Color }
  | null;

export function CatalogView() {
  const queryClient = useQueryClient();
  const { data: categories = [] } = useQuery(categoryQueries.list());
  const { data: sizes = [] } = useQuery(sizeQueries.list());
  const { data: colors = [] } = useQuery(colorQueries.list());
  const [editTarget, setEditTarget] = useState<EditTarget>(null);
  const [deleteTarget, setDeleteTarget] = useState<DeleteTarget>(null);

  const invalidate = () => {
    queryClient.invalidateQueries({ queryKey: categoryQueries.all() });
    queryClient.invalidateQueries({ queryKey: sizeQueries.all() });
    queryClient.invalidateQueries({ queryKey: colorQueries.all() });
  };

  const deleteCategory = useMutation({
    ...categoryMutations.delete(),
    onSuccess: () => {
      toast.success('Category deleted');
      setDeleteTarget(null);
      invalidate();
    },
    onError: (error) => toast.error(error.message)
  });
  const deleteSize = useMutation({
    ...sizeMutations.delete(),
    onSuccess: () => {
      toast.success('Size deleted');
      setDeleteTarget(null);
      invalidate();
    },
    onError: (error) => toast.error(error.message)
  });
  const deleteColor = useMutation({
    ...colorMutations.delete(),
    onSuccess: () => {
      toast.success('Color deleted');
      setDeleteTarget(null);
      invalidate();
    },
    onError: (error) => toast.error(error.message)
  });

  const deletePending = deleteCategory.isPending || deleteSize.isPending || deleteColor.isPending;

  function confirmDelete() {
    if (!deleteTarget) return;
    if (deleteTarget.kind === 'category') {
      deleteCategory.mutate(deleteTarget.item.id);
    } else if (deleteTarget.kind === 'size') {
      deleteSize.mutate(deleteTarget.item.id);
    } else {
      deleteColor.mutate(deleteTarget.item.id);
    }
  }

  return (
    <>
      <Tabs defaultValue='categories' className='space-y-4'>
        <TabsList className='w-full justify-start overflow-x-auto sm:w-fit'>
          <TabsTrigger value='categories'>Categories</TabsTrigger>
          <TabsTrigger value='sizes'>Sizes</TabsTrigger>
          <TabsTrigger value='colors'>Colors</TabsTrigger>
          <TabsTrigger value='settings'>Settings</TabsTrigger>
        </TabsList>

        <TabsContent value='categories'>
          <Card>
            <CardHeader className='flex flex-row items-center justify-between'>
              <CardTitle>Categories</CardTitle>
              <Button size='sm' onClick={() => setEditTarget({ kind: 'category' })}>
                <Icons.add className='mr-1 size-4' />
                Add category
              </Button>
            </CardHeader>
            <CardContent className='p-0'>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Slug</TableHead>
                    <TableHead>Description</TableHead>
                    <TableHead className='w-24 text-right'>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {categories.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={4} className='text-muted-foreground h-20 text-center'>
                        No categories.
                      </TableCell>
                    </TableRow>
                  )}
                  {categories.map((category) => (
                    <TableRow key={category.id}>
                      <TableCell>{category.name}</TableCell>
                      <TableCell className='text-muted-foreground font-mono text-xs'>
                        {category.slug}
                      </TableCell>
                      <TableCell className='text-muted-foreground max-w-72 truncate'>
                        {category.description || '-'}
                      </TableCell>
                      <TableCell className='text-right'>
                        <div className='flex justify-end gap-1'>
                          <Button
                            variant='ghost'
                            size='icon'
                            onClick={() => setEditTarget({ kind: 'category', item: category })}
                          >
                            <Icons.edit className='size-4' />
                          </Button>
                          <Button
                            variant='ghost'
                            size='icon'
                            onClick={() => setDeleteTarget({ kind: 'category', item: category })}
                          >
                            <Icons.trash className='size-4' />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value='sizes'>
          <Card>
            <CardHeader className='flex flex-row items-center justify-between'>
              <CardTitle>Sizes</CardTitle>
              <Button size='sm' onClick={() => setEditTarget({ kind: 'size' })}>
                <Icons.add className='mr-1 size-4' />
                Add size
              </Button>
            </CardHeader>
            <CardContent className='p-0'>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Sort order</TableHead>
                    <TableHead className='w-24 text-right'>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {sizes.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={3} className='text-muted-foreground h-20 text-center'>
                        No sizes.
                      </TableCell>
                    </TableRow>
                  )}
                  {sizes.map((size) => (
                    <TableRow key={size.id}>
                      <TableCell>{size.name}</TableCell>
                      <TableCell>{size.sort_order}</TableCell>
                      <TableCell className='text-right'>
                        <div className='flex justify-end gap-1'>
                          <Button
                            variant='ghost'
                            size='icon'
                            onClick={() => setEditTarget({ kind: 'size', item: size })}
                          >
                            <Icons.edit className='size-4' />
                          </Button>
                          <Button
                            variant='ghost'
                            size='icon'
                            onClick={() => setDeleteTarget({ kind: 'size', item: size })}
                          >
                            <Icons.trash className='size-4' />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value='settings'>
          <CatalogSettingsForm />
        </TabsContent>

        <TabsContent value='colors'>
          <Card>
            <CardHeader className='flex flex-row items-center justify-between'>
              <CardTitle>Colors</CardTitle>
              <Button size='sm' onClick={() => setEditTarget({ kind: 'color' })}>
                <Icons.add className='mr-1 size-4' />
                Add color
              </Button>
            </CardHeader>
            <CardContent className='p-0'>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Hex</TableHead>
                    <TableHead className='w-24 text-right'>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {colors.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={3} className='text-muted-foreground h-20 text-center'>
                        No colors.
                      </TableCell>
                    </TableRow>
                  )}
                  {colors.map((color) => (
                    <TableRow key={color.id}>
                      <TableCell>{color.name}</TableCell>
                      <TableCell>
                        <div className='flex items-center gap-2'>
                          <span
                            className='size-4 rounded border'
                            style={{ backgroundColor: color.hex_code || 'transparent' }}
                          />
                          <span className='font-mono text-xs'>{color.hex_code || '-'}</span>
                        </div>
                      </TableCell>
                      <TableCell className='text-right'>
                        <div className='flex justify-end gap-1'>
                          <Button
                            variant='ghost'
                            size='icon'
                            onClick={() => setEditTarget({ kind: 'color', item: color })}
                          >
                            <Icons.edit className='size-4' />
                          </Button>
                          <Button
                            variant='ghost'
                            size='icon'
                            onClick={() => setDeleteTarget({ kind: 'color', item: color })}
                          >
                            <Icons.trash className='size-4' />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <CatalogDialog
        target={editTarget}
        onClose={() => setEditTarget(null)}
        onSaved={() => {
          setEditTarget(null);
          invalidate();
        }}
      />

      <AlertModal
        isOpen={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={confirmDelete}
        loading={deletePending}
      />
    </>
  );
}

function CatalogDialog({
  target,
  onClose,
  onSaved
}: {
  target: EditTarget;
  onClose: () => void;
  onSaved: () => void;
}) {
  const kind = target?.kind ?? 'category';
  const item = target?.item;
  const [name, setName] = useState('');
  const [slug, setSlug] = useState('');
  const [description, setDescription] = useState('');
  const [sortOrder, setSortOrder] = useState(0);
  const [hexCode, setHexCode] = useState('');

  useEffect(() => {
    if (!target) return;
    setName(item?.name ?? '');
    setSlug('slug' in (item ?? {}) ? ((item as Category).slug ?? '') : '');
    setDescription('description' in (item ?? {}) ? ((item as Category).description ?? '') : '');
    setSortOrder('sort_order' in (item ?? {}) ? ((item as Size).sort_order ?? 0) : 0);
    setHexCode('hex_code' in (item ?? {}) ? ((item as Color).hex_code ?? '') : '');
  }, [target, item]);

  const createCategory = useMutation({
    ...categoryMutations.create(),
    onSuccess: () => {
      toast.success('Category saved');
      onSaved();
    },
    onError: (error) => toast.error(error.message)
  });
  const updateCategory = useMutation({
    ...categoryMutations.update(),
    onSuccess: () => {
      toast.success('Category saved');
      onSaved();
    },
    onError: (error) => toast.error(error.message)
  });
  const createSize = useMutation({
    ...sizeMutations.create(),
    onSuccess: () => {
      toast.success('Size saved');
      onSaved();
    },
    onError: (error) => toast.error(error.message)
  });
  const updateSize = useMutation({
    ...sizeMutations.update(),
    onSuccess: () => {
      toast.success('Size saved');
      onSaved();
    },
    onError: (error) => toast.error(error.message)
  });
  const createColor = useMutation({
    ...colorMutations.create(),
    onSuccess: () => {
      toast.success('Color saved');
      onSaved();
    },
    onError: (error) => toast.error(error.message)
  });
  const updateColor = useMutation({
    ...colorMutations.update(),
    onSuccess: () => {
      toast.success('Color saved');
      onSaved();
    },
    onError: (error) => toast.error(error.message)
  });

  const pending =
    createCategory.isPending ||
    updateCategory.isPending ||
    createSize.isPending ||
    updateSize.isPending ||
    createColor.isPending ||
    updateColor.isPending;

  function submit() {
    if (!name.trim()) {
      toast.error('Name is required');
      return;
    }
    if (kind === 'category') {
      const payload = { name: name.trim(), slug: slug.trim() || undefined, description };
      if (item) updateCategory.mutate({ id: item.id, payload });
      else createCategory.mutate(payload);
    } else if (kind === 'size') {
      const payload = { name: name.trim(), sort_order: sortOrder };
      if (item) updateSize.mutate({ id: item.id, payload });
      else createSize.mutate(payload);
    } else {
      const payload = { name: name.trim(), hex_code: hexCode.trim() || undefined };
      if (item) updateColor.mutate({ id: item.id, payload });
      else createColor.mutate(payload);
    }
  }

  return (
    <Dialog open={!!target} onOpenChange={(open) => !open && onClose()}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>
            {item ? 'Edit' : 'Add'} {kind}
          </DialogTitle>
          <DialogDescription>
            {kind === 'category'
              ? 'Categories group your products.'
              : kind === 'size'
                ? 'Sizes are shared across products.'
                : 'Colors are shared across products.'}
          </DialogDescription>
        </DialogHeader>
        <div className='space-y-4 py-2'>
          <div className='space-y-2'>
            <Label>Name</Label>
            <Input value={name} onChange={(event) => setName(event.target.value)} />
            <FieldHint>
              {kind === 'category'
                ? 'Collection name shown on the public catalog.'
                : kind === 'size'
                  ? 'Size label shown on product pages.'
                  : 'Color name shown on product pages.'}
            </FieldHint>
          </div>
          {kind === 'category' && (
            <>
              <div className='space-y-2'>
                <Label>Slug</Label>
                <Input
                  value={slug}
                  onChange={(event) => setSlug(event.target.value)}
                  placeholder='optional'
                />
                <FieldHint>Leave blank to generate it from the name.</FieldHint>
              </div>
              <div className='space-y-2'>
                <Label>Description</Label>
                <Textarea
                  value={description}
                  onChange={(event) => setDescription(event.target.value)}
                  rows={3}
                />
                <FieldHint>Short description shown in the catalog collection filter.</FieldHint>
              </div>
            </>
          )}
          {kind === 'size' && (
            <div className='space-y-2'>
              <Label>Sort order</Label>
              <Input
                type='number'
                value={sortOrder}
                onChange={(event) => setSortOrder(Number(event.target.value) || 0)}
              />
              <FieldHint>Lower numbers appear first in size lists.</FieldHint>
            </div>
          )}
          {kind === 'color' && (
            <div className='space-y-2'>
              <Label>Hex code</Label>
              <Input
                value={hexCode}
                onChange={(event) => setHexCode(event.target.value)}
                placeholder='#111111'
              />
              <FieldHint>Hex color used for the color swatch.</FieldHint>
            </div>
          )}
        </div>
        <DialogFooter>
          <Button variant='outline' onClick={onClose}>
            Cancel
          </Button>
          <LoadingButton loading={pending} onClick={submit}>
            Save
          </LoadingButton>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
