import { apiClient } from '@/lib/api-client';
import { toQueryString } from '@/lib/query-string';
import type { RevenueOverview } from '@/types/api';

export function getRevenueOverview(month?: string) {
  return apiClient<RevenueOverview>(`/overview/revenue${toQueryString({ month })}`);
}
