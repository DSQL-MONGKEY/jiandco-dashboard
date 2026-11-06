# API Integration

The dashboard calls the Jiandco API through the Next.js BFF at `/api/*`.

## Envelope

Success:

```json
{ "success": true, "data": {} }
```

Error:

```json
{ "success": false, "code": 400, "message": "..." }
```

Lists:

```json
{
  "success": true,
  "data": {
    "items": [],
    "pagination": { "page": 1, "per_page": 20, "total": 0, "total_pages": 0 }
  }
}
```

## Mapping

| Frontend | Backend endpoints |
|---|---|
| Auth | `/auth/login`, `/auth/refresh`, `/auth/logout`, `/auth/me`, `/auth/profile`, `/auth/password`, `/auth/avatar` |
| Overview | `/overview/revenue` |
| Products | `/products`, `/products/:id`, `/products/:id/variants`, `/products/:id/variants/:variantId/stock`, `/products/:id/variants/:variantId/movements`, `/products/:id/images` |
| Catalog settings | `/catalog/settings` |
| Public catalog | `/public/catalog`, `/public/catalog/products/:slug`, `/public/media/*` |
| Catalog | `/categories`, `/sizes`, `/colors` |
| Customers | `/customers` |
| Orders | `/orders`, `/orders/:id`, `/orders/:id/items`, `/orders/:id/status`, `/orders/:id/payment`, `/orders/:id/shipping` |
| Expenses | `/expenses`, `/expenses/:id`, `/expenses/:id/receipt` |
| Accounting | `/accounting/overview` |
| Users | `/users`, `/users/:id`, `/users/:id/password` |
| Roles | `/roles`, `/permissions`, `/roles/:id/permissions` |

## Query parameters

- Pagination: `page`, `per_page`.
- Products: `search`, `category_id`, `status`.
- Customers: `search`.
- Orders: `search`, `status`, `payment_status`, `shipping_status`, `customer_id`, `from`, `to`.
- Expenses: `month`, `category`, `search`.
- Users: `search`, `role_id`, `is_active`.
- Overview/accounting: `month` in `YYYY-MM`.

## Client rules

- Use `apiClient<T>` from `src/lib/api-client.ts` on the client.
- Use `toQueryString` for query params.
- Feature layers follow `types.ts` → `service.ts` → `queries.ts`.
- Invalidate `<feature>Queries.all()` after mutations.
- Backend amounts are integer IDR; format with `formatIDR`.
- Backend timestamps are RFC3339; format with `formatDateTime`.
