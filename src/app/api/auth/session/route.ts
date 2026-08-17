import { NextResponse } from 'next/server';
import { getSessionUser, getTokenFromRequest } from '@/lib/serverAuth';

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  const token = getTokenFromRequest(request);
  if (!token) return NextResponse.json({ user: null });

  const user = await getSessionUser(token);
  if (!user) return NextResponse.json({ user: null });

  return NextResponse.json({ user });
}