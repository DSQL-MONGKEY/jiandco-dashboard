# RBAC

## Permission source

The backend returns effective permissions from `GET /auth/me`:

```json
{
  "user": { "...": "..." },
  "permissions": ["products.view", "orders.create"]
}
```

Level 0 Developer and level 1 Super Admin bypass permission checks.

## Frontend usage

```ts
const { can, isSuperAdmin } = useAuth();
can('products', 'create');
```

Page guard:

```tsx
<RequirePermission page='products' action='update'>
  <ProductEditView />
</RequirePermission>
```

Navigation:

```ts
{
  title: 'Products',
  url: '/dashboard/products',
  access: { permission: 'products.view' }
}
```

`use-nav.ts` filters navigation groups using `AuthProvider`.

## Pages and permissions

| Page | View | Create | Update | Delete |
|---|---|---|---|---|
| Overview | `overview.view` | - | - | - |
| Products | `products.view` | `products.create` | `products.update` | `products.delete` |
| Orders | `orders.view` | `orders.create` | `orders.update` | `orders.delete` |
| Customers | `customers.view` | `customers.create` | `customers.update` | `customers.delete` |
| Accounting | `accounting.view` | `accounting.create` | `accounting.update` | `accounting.delete` |
| Users | `users.view` | `users.create` | `users.update` | `users.delete` |
| Roles | `roles.view` | - | `roles.update` | - |

`products.*` also covers catalog categories, sizes, colors, variants, images, and stock.

## Rules

- The backend is the security boundary; frontend guards are UX and defense in depth.
- Role permissions can be customized on `/dashboard/roles` by level 0/1.
- Level 2/3 permissions are read from `role_permissions`.
- Hide navigation items without permission; also guard the page itself.
- After changing role permissions, refresh `/auth/me` (the roles page invalidates the auth query).
