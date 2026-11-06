import { NavGroup } from '@/types';

export const navGroups: NavGroup[] = [
  {
    label: 'Operations',
    items: [
      {
        title: 'Overview',
        url: '/dashboard/overview',
        icon: 'dashboard',
        shortcut: ['o', 'o'],
        access: { permission: 'overview.view' }
      },
      {
        title: 'Products',
        url: '/dashboard/products',
        icon: 'product',
        shortcut: ['p', 'p'],
        access: { permission: 'products.view' }
      },
      {
        title: 'Catalog',
        url: '/dashboard/catalog',
        icon: 'catalog',
        shortcut: ['c', 'c'],
        access: { permission: 'products.view' }
      },
      {
        title: 'Orders',
        url: '/dashboard/orders',
        icon: 'orders',
        shortcut: ['r', 'r'],
        access: { permission: 'orders.view' }
      },
      {
        title: 'Customers',
        url: '/dashboard/customers',
        icon: 'teams',
        shortcut: ['u', 'u'],
        access: { permission: 'customers.view' }
      }
    ]
  },
  {
    label: 'Finance',
    items: [
      {
        title: 'Expenses',
        url: '/dashboard/accounting/expenses',
        icon: 'receipt',
        shortcut: ['e', 'e'],
        access: { permission: 'accounting.view' }
      },
      {
        title: 'Accounting Overview',
        url: '/dashboard/accounting/overview',
        icon: 'accounting',
        shortcut: ['a', 'a'],
        access: { permission: 'accounting.view' }
      }
    ]
  },
  {
    label: 'Administration',
    items: [
      {
        title: 'Users',
        url: '/dashboard/users',
        icon: 'teams',
        shortcut: ['s', 's'],
        access: { permission: 'users.view' }
      },
      {
        title: 'Roles & Permissions',
        url: '/dashboard/roles',
        icon: 'roles',
        shortcut: ['l', 'l'],
        access: { permission: 'roles.view' }
      }
    ]
  },
  {
    label: 'Account',
    items: [
      {
        title: 'Profile',
        url: '/dashboard/profile',
        icon: 'profile',
        shortcut: ['m', 'm']
      }
    ]
  }
];
