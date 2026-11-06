'use client';
// oxlint-disable react/set-state-in-effect -- settings form syncs fetched values when opened

import { useEffect, useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { LoadingButton } from '@/components/ui/loading-button';
import { Textarea } from '@/components/ui/textarea';
import { FieldHint } from '@/components/form-field-hint';
import { useAuth } from '@/features/auth/context/auth-provider';
import { catalogSettingsMutations, catalogSettingsQueries } from '../api/queries';
import type { CatalogSettings } from '@/types/api';

const EMPTY: CatalogSettings = {
  promo_badge: '',
  promo_title: '',
  promo_description: '',
  promo_note: '',
  promo_cta_label: '',
  page_eyebrow: '',
  page_title: '',
  page_title_accent: '',
  page_description: '',
  page_footnote: '',
  cta_eyebrow: '',
  cta_title: '',
  cta_title_accent: '',
  cta_description: '',
  cta_label: '',
  cta_image_url: '',
  cta_secondary_image_url: '',
  shopee_store_url: ''
};

export function CatalogSettingsForm() {
  const queryClient = useQueryClient();
  const { can } = useAuth();
  const canUpdate = can('products', 'update');
  const { data } = useQuery(catalogSettingsQueries.detail());
  const [form, setForm] = useState<CatalogSettings>(EMPTY);

  useEffect(() => {
    if (data) setForm({ ...EMPTY, ...data });
  }, [data]);

  const mutation = useMutation({
    ...catalogSettingsMutations.update(),
    onSuccess: () => {
      toast.success('Catalog settings updated');
      queryClient.invalidateQueries({ queryKey: catalogSettingsQueries.all() });
    },
    onError: (error) => toast.error(error.message)
  });

  function update<K extends keyof CatalogSettings>(key: K, value: CatalogSettings[K]) {
    setForm((current) => ({ ...current, [key]: value }));
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Catalog page settings</CardTitle>
        <CardDescription>
          These texts are used by the public catalog page and promo banner.
        </CardDescription>
      </CardHeader>
      <CardContent className='space-y-8'>
        <section className='space-y-4'>
          <h3 className='font-medium'>Promo banner</h3>
          <div className='grid gap-4 md:grid-cols-2'>
            <div className='space-y-2'>
              <Label>Badge</Label>
              <Input
                value={form.promo_badge}
                disabled={!canUpdate}
                onChange={(event) => update('promo_badge', event.target.value)}
              />
              <FieldHint>Small label above the promo title.</FieldHint>
            </div>
            <div className='space-y-2'>
              <Label>CTA label</Label>
              <Input
                value={form.promo_cta_label}
                disabled={!canUpdate}
                onChange={(event) => update('promo_cta_label', event.target.value)}
              />
              <FieldHint>Button text for the WhatsApp promo.</FieldHint>
            </div>
            <div className='space-y-2 md:col-span-2'>
              <Label>Title</Label>
              <Input
                value={form.promo_title}
                disabled={!canUpdate}
                onChange={(event) => update('promo_title', event.target.value)}
              />
              <FieldHint>Main promo headline on the catalog page.</FieldHint>
            </div>
            <div className='space-y-2 md:col-span-2'>
              <Label>Description</Label>
              <Textarea
                value={form.promo_description}
                disabled={!canUpdate}
                onChange={(event) => update('promo_description', event.target.value)}
                rows={3}
              />
              <FieldHint>Explain the WhatsApp offer in one or two sentences.</FieldHint>
            </div>
            <div className='space-y-2 md:col-span-2'>
              <Label>Note</Label>
              <Textarea
                value={form.promo_note}
                disabled={!canUpdate}
                onChange={(event) => update('promo_note', event.target.value)}
                rows={2}
              />
              <FieldHint>Optional small print below the promo.</FieldHint>
            </div>
          </div>
        </section>

        <section className='space-y-4'>
          <h3 className='font-medium'>Catalog page</h3>
          <div className='grid gap-4 md:grid-cols-2'>
            <div className='space-y-2'>
              <Label>Eyebrow</Label>
              <Input
                value={form.page_eyebrow}
                disabled={!canUpdate}
                onChange={(event) => update('page_eyebrow', event.target.value)}
              />
              <FieldHint>Small uppercase text above the catalog title.</FieldHint>
            </div>
            <div className='space-y-2'>
              <Label>Title accent</Label>
              <Input
                value={form.page_title_accent}
                disabled={!canUpdate}
                onChange={(event) => update('page_title_accent', event.target.value)}
              />
              <FieldHint>Italic part of the catalog title.</FieldHint>
            </div>
            <div className='space-y-2'>
              <Label>Title</Label>
              <Input
                value={form.page_title}
                disabled={!canUpdate}
                onChange={(event) => update('page_title', event.target.value)}
              />
              <FieldHint>Main catalog title.</FieldHint>
            </div>
            <div className='space-y-2 md:col-span-2'>
              <Label>Description</Label>
              <Textarea
                value={form.page_description}
                disabled={!canUpdate}
                onChange={(event) => update('page_description', event.target.value)}
                rows={3}
              />
              <FieldHint>Intro text shown beside the catalog title.</FieldHint>
            </div>
            <div className='space-y-2 md:col-span-2'>
              <Label>Footnote</Label>
              <Textarea
                value={form.page_footnote}
                disabled={!canUpdate}
                onChange={(event) => update('page_footnote', event.target.value)}
                rows={2}
              />
              <FieldHint>Small note below the product grid.</FieldHint>
            </div>
          </div>
        </section>

        <section className='space-y-4'>
          <h3 className='font-medium'>Home catalog CTA</h3>
          <div className='grid gap-4 md:grid-cols-2'>
            <div className='space-y-2'>
              <Label>Eyebrow</Label>
              <Input
                value={form.cta_eyebrow}
                disabled={!canUpdate}
                onChange={(event) => update('cta_eyebrow', event.target.value)}
              />
              <FieldHint>Small label above the home CTA.</FieldHint>
            </div>
            <div className='space-y-2'>
              <Label>CTA label</Label>
              <Input
                value={form.cta_label}
                disabled={!canUpdate}
                onChange={(event) => update('cta_label', event.target.value)}
              />
              <FieldHint>Button text for the home CTA.</FieldHint>
            </div>
            <div className='space-y-2'>
              <Label>Title</Label>
              <Input
                value={form.cta_title}
                disabled={!canUpdate}
                onChange={(event) => update('cta_title', event.target.value)}
              />
              <FieldHint>Main home CTA headline.</FieldHint>
            </div>
            <div className='space-y-2'>
              <Label>Title accent</Label>
              <Input
                value={form.cta_title_accent}
                disabled={!canUpdate}
                onChange={(event) => update('cta_title_accent', event.target.value)}
              />
              <FieldHint>Italic part of the home CTA title.</FieldHint>
            </div>
            <div className='space-y-2 md:col-span-2'>
              <Label>Description</Label>
              <Textarea
                value={form.cta_description}
                disabled={!canUpdate}
                onChange={(event) => update('cta_description', event.target.value)}
                rows={3}
              />
              <FieldHint>Short description for the home CTA.</FieldHint>
            </div>
            <div className='space-y-2'>
              <Label>Image URL</Label>
              <Input
                value={form.cta_image_url}
                disabled={!canUpdate}
                onChange={(event) => update('cta_image_url', event.target.value)}
              />
              <FieldHint>Absolute URL or public media path for the main image.</FieldHint>
            </div>
            <div className='space-y-2'>
              <Label>Secondary image URL</Label>
              <Input
                value={form.cta_secondary_image_url}
                disabled={!canUpdate}
                onChange={(event) => update('cta_secondary_image_url', event.target.value)}
              />
              <FieldHint>Optional secondary image URL.</FieldHint>
            </div>
            <div className='space-y-2 md:col-span-2'>
              <Label>Shopee store URL</Label>
              <Input
                value={form.shopee_store_url}
                disabled={!canUpdate}
                onChange={(event) => update('shopee_store_url', event.target.value)}
              />
              <FieldHint>Shopee store link used by checkout actions.</FieldHint>
            </div>
          </div>
        </section>

        <div className='flex justify-end'>
          <LoadingButton
            loading={mutation.isPending}
            disabled={!canUpdate}
            onClick={() => mutation.mutate(form)}
          >
            Save settings
          </LoadingButton>
        </div>
      </CardContent>
    </Card>
  );
}
