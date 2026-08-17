import { NextResponse } from 'next/server';
import {
  createSession,
  dbConfigured,
  getUserByEmail,
  SESSION_COOKIE,
  SESSION_MAX_AGE,
  verifyPassword,
  type Role,
} from '@/lib/serverAuth';

export async function POST(request: Request) {
  try {
    const body = await request.json().catch(() => null);
    const { email, password, role } = body ?? {};

    if (!email || !password || !(['super-admin', 'company', 'trainee'] as Role[]).includes(role)) {
      return NextResponse.json({ error: 'INVALID_INPUT', message: 'Missing email, password or role.' }, { status: 400 });
    }
    if (!dbConfigured()) {
      return NextResponse.json({ error: 'NO_DATABASE_URL', message: 'Database is not configured.' }, { status: 503 });
    }

    const user = await getUserByEmail(email, role as Role);
    if (!user || !verifyPassword(password, user.password_hash)) {
      return NextResponse.json({ error: 'INVALID_CREDENTIALS', message: 'Email or password incorrect.' }, { status: 401 });
    }

    const token = await createSession(user.id);

    const res = NextResponse.json({
      success: true,
      user: {
        id: user.id,
        email: user.email,
        role: user.role,
        name: user.name,
        company_id: user.company_id,
      },
    });
    res.cookies.set(SESSION_COOKIE, token, {
      httpOnly: true,
      sameSite: 'lax',
      secure: process.env.NODE_ENV === 'production',
      path: '/',
      maxAge: SESSION_MAX_AGE,
    });
    return res;
  } catch (err) {
    console.error('Login error:', err);
    return NextResponse.json({ error: 'SERVER_ERROR', message: 'Login failed.' }, { status: 500 });
  }
}