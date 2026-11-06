'use client';

import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from '@/components/ui/table';
import { currentMonth, formatDateOnly } from '@/lib/format';
import { Money } from '@/components/money';
import { accountingQueries } from '../api/queries';

export function AccountingOverviewView() {
  const [month, setMonth] = useState(currentMonth());
  const { data, isLoading } = useQuery(accountingQueries.overview(month));
  const maxCategory = Math.max(...(data?.by_category.map((item) => item.total) ?? [1]), 1);

  return (
    <div className='space-y-4'>
      <Input
        type='month'
        value={month}
        onChange={(event) => setMonth(event.target.value)}
        className='w-full sm:w-48'
      />

      <div className='grid gap-4 md:grid-cols-2'>
        <Card>
          <CardHeader>
            <CardDescription>Total expenses</CardDescription>
            <CardTitle className='text-3xl'>
              <Money value={data?.total_expenses ?? 0} />
            </CardTitle>
          </CardHeader>
          <CardContent className='text-muted-foreground text-sm'>
            Expenses recorded for {data?.month ?? month}.
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardDescription>Categories</CardDescription>
            <CardTitle>{data?.by_category.length ?? 0}</CardTitle>
          </CardHeader>
          <CardContent className='text-muted-foreground text-sm'>
            Expense categories with transactions this month.
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>By category</CardTitle>
          <CardDescription>Expense distribution for the selected month.</CardDescription>
        </CardHeader>
        <CardContent className='space-y-4'>
          {isLoading && <div className='bg-muted h-24 animate-pulse rounded-lg' />}
          {!isLoading && (data?.by_category.length ?? 0) === 0 && (
            <p className='text-muted-foreground text-sm'>No expenses this month.</p>
          )}
          {data?.by_category.map((item) => (
            <div key={item.category} className='space-y-1'>
              <div className='flex items-center justify-between text-sm'>
                <span className='capitalize'>{item.category}</span>
                <span className='font-medium'>
                  <Money value={item.total} />
                </span>
              </div>
              <div className='bg-muted h-2 overflow-hidden rounded-full'>
                <div
                  className='bg-primary h-full rounded-full'
                  style={{ width: `${(item.total / maxCategory) * 100}%` }}
                />
              </div>
            </div>
          ))}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Recent expenses</CardTitle>
        </CardHeader>
        <CardContent className='p-0'>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Date</TableHead>
                <TableHead>Title</TableHead>
                <TableHead>Category</TableHead>
                <TableHead>Vendor</TableHead>
                <TableHead className='text-right'>Total</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {!isLoading && (data?.recent_expenses.length ?? 0) === 0 && (
                <TableRow>
                  <TableCell colSpan={5} className='text-muted-foreground h-20 text-center'>
                    No recent expenses.
                  </TableCell>
                </TableRow>
              )}
              {data?.recent_expenses.map((expense) => (
                <TableRow key={expense.id}>
                  <TableCell className='text-xs'>{formatDateOnly(expense.expense_date)}</TableCell>
                  <TableCell>{expense.title}</TableCell>
                  <TableCell className='capitalize'>{expense.category}</TableCell>
                  <TableCell>{expense.vendor || '-'}</TableCell>
                  <TableCell className='text-right'>
                    <Money value={expense.total_amount} />
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
