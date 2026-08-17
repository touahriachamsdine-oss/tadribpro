import { NextResponse } from 'next/server';
import { neon } from '@neondatabase/serverless';
import { randomBytes } from 'node:crypto';
import {
  createSession,
  createUser,
  dbConfigured,
  hashPassword,
  SESSION_COOKIE,
  SESSION_MAX_AGE,
} from '@/lib/serverAuth';

export async function POST(request: Request) {
  try {
    const body = await request.json().catch(() => null);
    const { companyName, sector, email, password } = body ?? {};

    if (!companyName || !sector || !email || !password) {
      return NextResponse.json({ error: 'INVALID_INPUT', message: 'All fields are required.' }, { status: 400 });
    }
    if (String(password).length < 6) {
      return NextResponse.json(
        { error: 'WEAK_PASSWORD', message: 'Password must be at least 6 characters.' },
        { status: 400 }
      );
    }
    if (!dbConfigured()) {
      return NextResponse.json({ error: 'NO_DATABASE_URL', message: 'Database is not configured.' }, { status: 503 });
    }

    const sql = neon(process.env.DATABASE_URL!);

    const companyId = 'comp-' + randomBytes(6).toString('hex');
    const normalizedEmail = String(email).toLowerCase().trim();

    const dup = await sql`SELECT id FROM companies WHERE LOWER(email) = ${normalizedEmail} LIMIT 1`;
    if (dup.length > 0) {
      return NextResponse.json({ error: 'EMAIL_TAKEN', message: 'A company with this email already exists.' }, { status: 409 });
    }

    await sql`
      INSERT INTO companies (id, name, sector, email, created_at)
      VALUES (${companyId}, ${String(companyName).trim()}, ${String(sector).trim()}, ${normalizedEmail}, NOW())
    `;

    await createUser({
      id: companyId,
      email: normalizedEmail,
      password_hash: hashPassword(String(password)),
      role: 'company',
      name: String(companyName).trim(),
      company_id: companyId,
    });

    const token = await createSession(companyId);

    const res = NextResponse.json({
      success: true,
      user: {
        id: companyId,
        email: normalizedEmail,
        role: 'company',
        name: String(companyName).trim(),
        company_id: companyId,
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
    console.error('Register error:', err);
    return NextResponse.json({ error: 'SERVER_ERROR', message: 'Registration failed.' }, { status: 500 });
  }
}