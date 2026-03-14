import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';

export async function POST(request: NextRequest) {
  try {
    const { password } = await request.json();

    if (!password) {
      return NextResponse.json({ error: 'Password required' }, { status: 400 });
    }

    // Validate against server-side env var (NOT the NEXT_PUBLIC_ one)
    const adminPassword = process.env.ADMIN_PASSWORD;
    if (!adminPassword) {
      console.error('ADMIN_PASSWORD env var not set');
      return NextResponse.json({ error: 'Server configuration error' }, { status: 500 });
    }

    // Constant-time comparison to prevent timing attacks
    const inputBuf = Buffer.from(password);
    const expectedBuf = Buffer.from(adminPassword);
    if (inputBuf.length !== expectedBuf.length || !crypto.timingSafeEqual(inputBuf, expectedBuf)) {
      return NextResponse.json({ error: 'Invalid password' }, { status: 401 });
    }

    // Generate session token (or use the pre-configured secret)
    const sessionToken = process.env.ADMIN_SESSION_SECRET || crypto.randomBytes(32).toString('hex');

    const response = NextResponse.json({ success: true });

    // Set HttpOnly cookie — can't be read by client-side JS (XSS-safe)
    response.cookies.set('admin_session', sessionToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: 60 * 60 * 24 * 30, // 30 days
    });

    return response;
  } catch (error) {
    console.error('Auth error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function DELETE() {
  const response = NextResponse.json({ success: true });
  response.cookies.set('admin_session', '', {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    maxAge: 0,
  });
  return response;
}
