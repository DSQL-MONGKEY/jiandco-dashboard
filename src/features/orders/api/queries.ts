import { mutationOptions, queryOptions } from '@tanstack/react-query';
import {
  createOrder,
  deleteOrder,
  getOrder,
  getOrders,
  updateOrder,
  updateOrderItems,
  updateOrderPayment,
  updateOrderShipping,
  updateOrderStatus
} from './service';
import type {
  CreateOrderPayload,
  OrderFilters,
  UpdateOrderItemsPayload,
  UpdateOrderPayload
} from './types';

export const orderQueries = {
  all: () => ['orders'] as const,
  list: (filters: OrderFilters) =>
    queryOptions({
      queryKey: [...orderQueries.all(), 'list', filters] as const,
      queryFn: () => getOrders(filters)
    }),
  detail: (id: string) =>
    queryOptions({
      queryKey: [...orderQueries.all(), 'detail', id] as const,
      queryFn: () => getOrder(id)
    })
};

export const orderMutations = {
  create: () =>
    mutationOptions({ mutationFn: (payload: CreateOrderPayload) => createOrder(payload) }),
  update: () =>
    mutationOptions({
      mutationFn: ({ id, payload }: { id: string; payload: UpdateOrderPayload }) =>
        updateOrder(id, payload)
    }),
  delete: () => mutationOptions({ mutationFn: (id: string) => deleteOrder(id) }),
  updateItems: () =>
    mutationOptions({
      mutationFn: ({ id, payload }: { id: string; payload: UpdateOrderItemsPayload }) =>
        updateOrderItems(id, payload)
    }),
  updateStatus: () =>
    mutationOptions({
      mutationFn: ({ id, status }: { id: string; status: string }) => updateOrderStatus(id, status)
    }),
  updatePayment: () =>
    mutationOptions({
      mutationFn: ({
        id,
        paymentStatus,
        paymentMethod
      }: {
        id: string;
        paymentStatus: string;
        paymentMethod?: string;
      }) => updateOrderPayment(id, paymentStatus, paymentMethod)
    }),
  updateShipping: () =>
    mutationOptions({
      mutationFn: ({
        id,
        shippingStatus,
        courier,
        trackingNumber
      }: {
        id: string;
        shippingStatus: string;
        courier?: string;
        trackingNumber?: string;
      }) => updateOrderShipping(id, shippingStatus, courier, trackingNumber)
    })
};
