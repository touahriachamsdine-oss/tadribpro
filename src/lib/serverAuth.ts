import { neon } from '@neondatabase/serverless';
import { randomBytes, scryptSync, timingSafeEqual } from 'node:crypto';

export const SESSION_COOKIE = 'takwin_session';
export const SESSION_MAX_AGE = 60 * 60 * 24 * 7;

export type Role = 'super-admin' | 'company' | 'trainee';

export interface SessionUser {
  id: string;
  email: string;
  role: Role;
  name: string;
  company_id: string | null;
}

const databaseUrl = process.env.DATABASE_URL;
const sql = databaseUrl ? neon(databaseUrl) : null;

export function dbConfigured(): boolean {
  return !!databaseUrl;
}

export function hashPassword(password: string): string {
  const salt = randomBytes(16).toString('hex');
  const hash = scryptSync(password, salt, 64).toString('hex');
  return `${salt}:${hash}`;
}

export function verifyPassword(password: string, stored: string): boolean {
  const [salt, hash] = String(stored || '').split(':');
  if (!salt || !hash) return false;
  try {
    const candidate = scryptSync(password, salt, 64);
    return timingSafeEqual(candidate, Buffer.from(hash, 'hex'));
  } catch {
    return false;
  }
}

export function getTokenFromRequest(req: Request): string | null {
  const cookieHeader = req.headers.get('cookie') ?? '';
  const match = cookieHeader.match(new RegExp(`(?:^|;\\s*)${SESSION_COOKIE}=([^;]+)`));
  return match ? decodeURIComponent(match[1]) : null;
}

export async function getSessionUser(token: string): Promise<SessionUser | null> {
  if (!sql) return null;
  try {
    const rows = await sql`
      SELECT u.id, u.email, u.role, u.name, u.company_id
      FROM sessions s
      JOIN users u ON u.id = s.user_id
      WHERE s.token = ${token} AND s.expires_at > NOW()
      LIMIT 1
    `;
    return rows.length ? (rows[0] as SessionUser) : null;
  } catch (err) {
    console.error('getSessionUser failed:', err);
    return null;
  }
}

export async function getUserByEmail(email: string, role?: Role) {
  if (!sql) return null;
  try {
    const rows = await sql`
      SELECT * FROM users WHERE LOWER(email) = ${email.toLowerCase()}${role ? sql` AND role = ${role}` : sql``} LIMIT 1
    `;
    return rows.length ? rows[0] : null;
  } catch (err) {
    console.error('getUserByEmail failed:', err);
    return null;
  }
}

export async function createSession(userId: string): Promise<string> {
  const token = randomBytes(32).toString('hex');
  if (!sql) throw new Error('Database not configured');
  await sql`
    INSERT INTO sessions (token, user_id, expires_at)
    VALUES (${token}, ${userId}, NOW() + interval '7 days')
  `;
  return token;
}

export async function destroySession(token: string): Promise<void> {
  if (!sql) return;
  try {
    await sql`DELETE FROM sessions WHERE token = ${token}`;
  } catch (err) {
    console.error('destroySession failed:', err);
  }
}

export async function createUser({
  id,
  email,
  password_hash,
  role,
  name,
  company_id,
}: {
  id: string;
  email: string;
  password_hash: string;
  role: Role;
  name: string;
  company_id?: string | null;
}) {
  if (!sql) throw new Error('Database not configured');
  await sql`
    INSERT INTO users (id, email, password_hash, role, name, company_id)
    VALUES (${id}, ${email.toLowerCase()}, ${password_hash}, ${role}, ${name}, ${company_id ?? null})
  `;
}