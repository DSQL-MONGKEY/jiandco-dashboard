import { queryOptions } from '@tanstack/react-query';
import { getRevenueOverview } from './service';

export const overviewQueries = {
  all: () => ['overview'] as const,
  revenue: (month?: string) =>
    queryOptions({
      queryKey: [...overviewQueries.all(), 'revenue', month] as const,
      queryFn: () => getRevenueOverview(month)
    })
};
