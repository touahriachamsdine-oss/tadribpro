import { neon } from '@neondatabase/serverless';
import fs from 'fs';
import path from 'path';

const envPath = path.resolve(process.cwd(), '.env');
const envContent = fs.readFileSync(envPath, 'utf8');
const dbUrlMatch = envContent.match(/^DATABASE_URL=(.+)$/m);
if (!dbUrlMatch) throw new Error('DATABASE_URL not found in .env');
const sql = neon(dbUrlMatch[1].trim());

async function run() {
  await sql`
    CREATE TABLE IF NOT EXISTS users (
      id TEXT PRIMARY KEY,
      email TEXT UNIQUE NOT NULL,
      password_hash TEXT NOT NULL,
      role TEXT NOT NULL CHECK (role IN ('super-admin', 'company', 'trainee')),
      name TEXT NOT NULL,
      company_id TEXT,
      created_at TIMESTAMPTZ DEFAULT NOW()
    )
  `;
  console.log('users table ready.');

  await sql`
    CREATE TABLE IF NOT EXISTS sessions (
      token TEXT PRIMARY KEY,
      user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      created_at TIMESTAMPTZ DEFAULT NOW(),
      expires_at TIMESTAMPTZ NOT NULL
    )
  `;
  console.log('sessions table ready.');

  await sql`CREATE INDEX IF NOT EXISTS idx_sessions_user ON sessions(user_id)`;
  await sql`CREATE INDEX IF NOT EXISTS idx_sessions_expires ON sessions(expires_at)`;
  await sql`CREATE INDEX IF NOT EXISTS idx_trainees_email ON trainees(email)`;
  await sql`CREATE INDEX IF NOT EXISTS idx_companies_email ON companies(email)`;
  console.log('indexes ready.');
}

run().then(() => { console.log('AUTH MIGRATION DONE'); process.exit(0); })
  .catch((e) => { console.error('MIGRATION FAILED', e); process.exit(1); });