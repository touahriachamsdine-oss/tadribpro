import { NextResponse } from 'next/server';
import { destroySession, getTokenFromRequest, SESSION_COOKIE } from '@/lib/serverAuth';

export async function POST(request: Request) {
  const token = getTokenFromRequest(request);
  if (token) {
    await destroySession(token);
  }
  const res = NextResponse.json({ success: true });
  res.cookies.set(SESSION_COOKIE, '', {
    httpOnly: true,
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production',
    path: '/',
    maxAge: 0,
  });
  return res;
}