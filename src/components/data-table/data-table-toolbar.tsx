'use client';

import { type Column, type ReactTable, type RowData, Subscribe } from '@tanstack/react-table';
import { cn } from '@/lib/utils';
import * as React from 'react';

import type { DataTableFeatures } from '@/lib/data-table-features';

import { DataTableDateFilter } from '@/components/data-table/data-table-date-filter';
import { DataTableFacetedFilter } from '@/components/data-table/data-table-faceted-filter';
import { DataTableSliderFilter } from '@/components/data-table/data-table-slider-filter';
import { DataTableViewOptions } from '@/components/data-table/data-table-view-options';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { IconX } from '@tabler/icons-react';

interface DataTableToolbarProps<TData extends RowData> extends React.ComponentProps<'div'> {
  table: ReactTable<DataTableFeatures, TData, unknown>;
}

export function DataTableToolbar<TData extends RowData>({
  table,
  children,
  className,
  ...props
}: DataTableToolbarProps<TData>) {
  const columns = React.useMemo(
    () => table.getAllColumns().filter((column) => column.getCanFilter()),
    [table]
  );

  function onReset() {
    table.resetColumnFilters(true);
    table.resetJoinOperator(true);
  }

  return (
    <div
      data-slot='data-table-toolbar'
      className={cn(
        'flex w-full flex-col gap-3 p-1 sm:flex-row sm:items-start sm:justify-between',
        className
      )}
      {...props}
    >
      <div className='grid w-full grid-cols-1 gap-2 sm:flex sm:flex-1 sm:flex-wrap sm:items-center'>
        {columns.map((column) => (
          <DataTableToolbarFilter key={column.id} column={column} />
        ))}
        <Subscribe source={table.atoms.columnFilters} selector={(filters) => filters.length > 0}>
          {(isFiltered) =>
            isFiltered && (
              <Button
                aria-label='Reset filters'
                variant='outline'
                className='w-full border-dashed sm:w-auto'
                onClick={onReset}
              >
                <IconX />
                Reset
              </Button>
            )
          }
        </Subscribe>
      </div>
      <div className='flex w-full items-center justify-between gap-2 sm:w-auto sm:justify-end'>
        {children}
        <DataTableViewOptions table={table} align='end' />
      </div>
    </div>
  );
}
interface DataTableToolbarFilterProps<TData extends RowData> {
  column: Column<DataTableFeatures, TData>;
}

function DataTableToolbarFilter<TData extends RowData>({
  column
}: DataTableToolbarFilterProps<TData>) {
  const columnMeta = column.columnDef.meta;
  if (!columnMeta?.variant) return null;

  const title = columnMeta.label ?? column.id;
  const placeholder = columnMeta.placeholder ?? columnMeta.label;

  switch (columnMeta.variant) {
    case 'text':
      return (
        <DataTableFilterInput
          column={column}
          placeholder={placeholder}
          className='w-full sm:w-40 lg:w-56'
        />
      );

    case 'number':
      return (
        <div className='relative'>
          <DataTableFilterInput
            column={column}
            type='number'
            inputMode='numeric'
            placeholder={placeholder}
            className={cn('w-full sm:w-30', columnMeta.unit && 'pe-8')}
          />
          {columnMeta.unit && (
            <span className='absolute inset-e-0 top-0 bottom-0 flex items-center rounded-e-md bg-accent px-2 text-sm text-muted-foreground'>
              {columnMeta.unit}
            </span>
          )}
        </div>
      );

    case 'range':
      return <DataTableSliderFilter column={column} title={title} />;

    case 'date':
    case 'dateRange':
      return (
        <DataTableDateFilter
          column={column}
          title={title}
          multiple={columnMeta.variant === 'dateRange'}
        />
      );

    case 'select':
    case 'multiSelect':
      return (
        <DataTableFacetedFilter
          column={column}
          title={title}
          options={columnMeta.options ?? []}
          multiple={columnMeta.variant === 'multiSelect'}
        />
      );

    default:
      return null;
  }
}

function readFilterInputValue(value: unknown) {
  if (typeof value === 'string' || typeof value === 'number') {
    return String(value);
  }

  if (Array.isArray(value)) {
    return value.join(',');
  }

  return '';
}

interface DataTableFilterInputProps<TData extends RowData> extends React.ComponentProps<'input'> {
  column: Column<DataTableFeatures, TData>;
}

function DataTableFilterInput<TData extends RowData>({
  column,
  type = 'text',
  ...props
}: DataTableFilterInputProps<TData>) {
  return (
    <Subscribe source={column.table.atoms.columnFilters} selector={() => column.getFilterValue()}>
      {(filterValue) => (
        <Input
          type={type}
          {...props}
          value={readFilterInputValue(filterValue)}
          onChange={(event) => column.setFilterValue(event.target.value || undefined)}
        />
      )}
    </Subscribe>
  );
}
