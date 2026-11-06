import { NextResponse, type NextRequest } from 'next/server';
import { backendProxy } from '@/lib/backend';

const ALLOWED_PREFIXES = [
  'products',
  'catalog',
  'public',
  'categories',
  'sizes',
  'colors',
  'customers',
  'orders',
  'expenses',
  'accounting',
  'overview',
  'users',
  'roles',
  'permissions'
];

type RouteContext = {
  params: Promise<{ path: string[] }>;
};

async function handle(request: NextRequest, context: RouteContext) {
  const { path } = await context.params;
  const pathname = path.join('/');
  const prefix = path[0];

  if (!prefix || !ALLOWED_PREFIXES.includes(prefix)) {
    return NextResponse.json(
      { success: false, code: 404, message: 'route not found' },
      { status: 404 }
    );
  }

  const method = request.method;
  const init: RequestInit = { method };

  if (method !== 'GET' && method !== 'HEAD') {
    const contentType = request.headers.get('content-type') ?? '';
    if (contentType.includes('multipart/form-data')) {
      init.body = await request.formData();
    } else {
      const body = await request.text();
      if (body) {
        init.body = body;
        init.headers = { 'Content-Type': contentType || 'application/json' };
      }
    }
  }

  return backendProxy(request, `/${pathname}${request.nextUrl.search}`, init);
}

export const GET = handle;
export const POST = handle;
export const PUT = handle;
export const PATCH = handle;
export const DELETE = handle;

export const dynamic = 'force-dynamic';
