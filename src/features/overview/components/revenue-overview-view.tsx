'use client';

import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Legend,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis
} from 'recharts';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import type { Formatter } from 'recharts/types/component/DefaultTooltipContent';
import { currentMonth } from '@/lib/format';
import { Money } from '@/components/money';
import { overviewQueries } from '../api/queries';

const PIE_COLORS = [
  'var(--chart-1)',
  'var(--chart-2)',
  'var(--chart-3)',
  'var(--chart-4)',
  'var(--chart-5)',
  'var(--muted-foreground)'
];

const formatDailyTooltip: Formatter = (value, name) => [
  name === 'orders' ? (
    `${value} orders`
  ) : (
    <Money key='revenue' value={typeof value === 'number' ? value : 0} />
  ),
  name === 'orders' ? 'Orders' : 'Revenue'
];

export function RevenueOverviewView() {
  const [month, setMonth] = useState(currentMonth());
  const { data, isLoading } = useQuery(overviewQueries.revenue(month));

  const cards = [
    { label: 'Revenue', value: <Money value={data?.revenue ?? 0} /> },
    { label: 'Expenses', value: <Money value={data?.expenses ?? 0} /> },
    { label: 'Net profit', value: <Money value={data?.net_profit ?? 0} /> },
    { label: 'Total orders', value: String(data?.total_orders ?? 0) },
    { label: 'Paid orders', value: String(data?.paid_orders ?? 0) },
    { label: 'Average order', value: <Money value={data?.average_order_value ?? 0} /> }
  ];

  return (
    <div className='space-y-4'>
      <Input
        type='month'
        value={month}
        onChange={(event) => setMonth(event.target.value)}
        className='w-full sm:w-48'
      />

      <div className='grid gap-4 md:grid-cols-2 xl:grid-cols-3'>
        {cards.map((card) => (
          <Card key={card.label}>
            <CardHeader>
              <CardDescription>{card.label}</CardDescription>
              <CardTitle className='text-2xl tabular-nums'>{card.value}</CardTitle>
            </CardHeader>
          </Card>
        ))}
      </div>

      <div className='grid gap-4 xl:grid-cols-[1.2fr_0.8fr]'>
        <Card>
          <CardHeader>
            <CardTitle>Daily orders</CardTitle>
            <CardDescription>
              Orders paid per day for {data?.month ?? month}. Revenue is shown in the summary.
            </CardDescription>
          </CardHeader>
          <CardContent className='h-80'>
            {isLoading ? (
              <div className='bg-muted h-full animate-pulse rounded-lg' />
            ) : (data?.daily.length ?? 0) === 0 ? (
              <div className='text-muted-foreground flex h-full items-center justify-center text-sm'>
                No paid orders this month.
              </div>
            ) : (
              <ResponsiveContainer width='100%' height='100%'>
                <BarChart data={data?.daily ?? []}>
                  <CartesianGrid strokeDasharray='3 3' vertical={false} />
                  <XAxis dataKey='date' tickLine={false} axisLine={false} fontSize={12} />
                  <YAxis allowDecimals={false} tickLine={false} axisLine={false} fontSize={12} />
                  <Tooltip formatter={formatDailyTooltip} />
                  <Bar dataKey='orders' fill='var(--chart-1)' radius={[6, 6, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Order status</CardTitle>
            <CardDescription>Distribution of orders created this month.</CardDescription>
          </CardHeader>
          <CardContent className='h-80'>
            {isLoading ? (
              <div className='bg-muted h-full animate-pulse rounded-lg' />
            ) : (data?.order_status_breakdown?.length ?? 0) === 0 ? (
              <div className='text-muted-foreground flex h-full items-center justify-center text-sm'>
                No orders this month.
              </div>
            ) : (
              <ResponsiveContainer width='100%' height='100%'>
                <PieChart>
                  <Pie
                    data={data?.order_status_breakdown ?? []}
                    dataKey='count'
                    nameKey='status'
                    cx='50%'
                    cy='45%'
                    outerRadius={95}
                    innerRadius={45}
                    paddingAngle={2}
                  >
                    {(data?.order_status_breakdown ?? []).map((entry, index) => (
                      // oxlint-disable-next-line typescript/no-deprecated
                      <Cell key={entry.status} fill={PIE_COLORS[index % PIE_COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value) => [`${value} orders`, 'Orders']} />
                  <Legend
                    formatter={(value) => String(value).replaceAll('_', ' ')}
                    iconType='circle'
                  />
                </PieChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
