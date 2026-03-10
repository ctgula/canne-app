import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// Simple in-memory rate limiter (per-instance, resets on deploy)
const rateLimitMap = new Map<string, { count: number; resetAt: number }>();
const RATE_LIMIT_WINDOW = 60_000; // 1 minute
const RATE_LIMIT_MAX_PUBLIC = 30; // 30 requests/min for public routes
const RATE_LIMIT_MAX_AUTH = 5; // 5 attempts/min for auth

function isRateLimited(key: string, max: number): boolean {
  const now = Date.now();
  const entry = rateLimitMap.get(key);
  if (!entry || now > entry.resetAt) {
    rateLimitMap.set(key, { count: 1, resetAt: now + RATE_LIMIT_WINDOW });
    return false;
  }
  entry.count++;
  return entry.count > max;
}

function getClientIp(request: NextRequest): string {
  return request.headers.get('x-forwarded-for')?.split(',')[0]?.trim()
    || request.headers.get('x-real-ip')
    || 'unknown';
}

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const ip = getClientIp(request);

  // Rate limit auth endpoint aggressively
  if (pathname === '/api/admin/auth') {
    if (request.method === 'POST' && isRateLimited(`auth:${ip}`, RATE_LIMIT_MAX_AUTH)) {
      return NextResponse.json({ error: 'Too many attempts. Try again later.' }, { status: 429 });
    }
    return NextResponse.next();
  }

  // Protect all /api/admin/* routes
  if (pathname.startsWith('/api/admin')) {
    const sessionToken = request.cookies.get('admin_session')?.value;

    if (!sessionToken) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Validate: token must match ADMIN_SESSION_SECRET
    const secret = process.env.ADMIN_SESSION_SECRET;
    if (secret && sessionToken !== secret) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
  }

  // Rate limit public order/payment endpoints
  if (pathname.startsWith('/api/orders') || pathname.startsWith('/api/place-order')) {
    if (isRateLimited(`public:${ip}`, RATE_LIMIT_MAX_PUBLIC)) {
      return NextResponse.json({ error: 'Rate limit exceeded' }, { status: 429 });
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/api/:path*'],
};
