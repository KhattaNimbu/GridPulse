import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { getToken } from 'next-auth/jwt';

// Simple in-memory rate limiter. For production, use Redis or similar.
const RATE_WINDOW_MS = Number(process.env.RATE_WINDOW_MS ?? 60_000)
const RATE_LIMIT = Number(process.env.RATE_LIMIT ?? 60)

type RateEntry = { count: number; resetAt: number };
const rateMap = new Map<string, RateEntry>();

function isRateLimited(key: string) {
  const now = Date.now();
  const entry = rateMap.get(key);
  if (!entry || now > entry.resetAt) {
    rateMap.set(key, { count: 1, resetAt: now + RATE_WINDOW_MS });
    return false;
  }
  entry.count += 1;
  return entry.count > RATE_LIMIT;
}

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // rate limit by IP for API routes and protected pages
  if (pathname.startsWith('/api') || pathname.startsWith('/operator') || pathname.startsWith('/driver')) {
    const ip = request.headers.get('x-forwarded-for') ?? 'unknown';
    if (isRateLimited(ip)) {
      return new NextResponse('Too many requests', { status: 429 });
    }
  }

  if (!pathname.startsWith('/operator') && !pathname.startsWith('/driver')) {
    return NextResponse.next();
  }

  const token = await getToken({ req: request, secret: process.env.NEXTAUTH_SECRET });
  if (!token) {
    const signInUrl = new URL('/sign-in', request.url);
    signInUrl.searchParams.set('callbackUrl', pathname);
    return NextResponse.redirect(signInUrl);
  }

  if (pathname.startsWith('/operator') && token.role !== 'OPERATOR') {
    return NextResponse.redirect(new URL('/unauthorized', request.url));
  }

  if (pathname.startsWith('/driver') && token.role !== 'DRIVER') {
    return NextResponse.redirect(new URL('/unauthorized', request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/operator/:path*', '/driver/:path*', '/api/:path*'],
};
