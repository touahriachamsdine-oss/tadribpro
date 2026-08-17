import { neon } from '@neondatabase/serverless';
import { randomBytes, scryptSync } from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';

// ---- Config ------------------------------------------------------------------
const envPath = path.resolve(process.cwd(), '.env');
const envContent = fs.readFileSync(envPath, 'utf8');
const dbUrlMatch = envContent.match(/^DATABASE_URL=(.+)$/m);
if (!dbUrlMatch) throw new Error('DATABASE_URL not found in .env');
const sql = neon(dbUrlMatch[1].trim());

const ADMIN_EMAIL = (envContent.match(/^ADMIN_EMAIL=(.+)$/m) || [null, 'admin@takwinpro.dz'])[1].trim();
const ADMIN_PASSWORD = (envContent.match(/^ADMIN_PASSWORD=(.+)$/m) || [null, 'admin123'])[1].trim();
const DEFAULT_PASSWORD = 'takwin123';

// ---- Password helpers ---------------------------------------------------------
function hashPassword(password) {
  const salt = randomBytes(16).toString('hex');
  const hash = scryptSync(password, salt, 64).toString('hex');
  return `${salt}:${hash}`;
}

// ---- Migration ----------------------------------------------------------------
async function run() {
  console.log('=== TakwinPro migration ===');

  // 1. Ensure core auth tables exist
  await sql`
    CREATE TABLE IF NOT EXISTS users (
      id TEXT PRIMARY KEY,
      email TEXT NOT NULL UNIQUE,
      password_hash TEXT NOT NULL,
      role TEXT NOT NULL,
      name TEXT NOT NULL,
      company_id TEXT,
      created_at TIMESTAMPTZ DEFAULT NOW()
    )
  `;
  await sql`
    CREATE TABLE IF NOT EXISTS sessions (
      token TEXT PRIMARY KEY,
      user_id TEXT NOT NULL,
      created_at TIMESTAMPTZ DEFAULT NOW(),
      expires_at TIMESTAMPTZ NOT NULL
    )
  `;
  await sql`CREATE INDEX IF NOT EXISTS idx_sessions_user ON sessions (user_id)`;
  await sql`CREATE INDEX IF NOT EXISTS idx_sessions_expires ON sessions (expires_at)`;
  await sql`CREATE INDEX IF NOT EXISTS idx_users_email ON users (LOWER(email))`;
  console.log('users/sessions tables ensured.');

  // 2. Seed super admin
  const existingAdmin = await sql`SELECT * FROM users WHERE role = 'super-admin' LIMIT 1`;
  if (existingAdmin.length === 0) {
    await sql`
      INSERT INTO users (id, email, password_hash, role, name, company_id) VALUES
      ('u-admin', ${ADMIN_EMAIL.toLowerCase()}, ${hashPassword(ADMIN_PASSWORD)}, 'super-admin', 'Platform Administrator', NULL)
    `;
    await sql`UPDATE users SET email = ${ADMIN_EMAIL.toLowerCase()} WHERE id = 'u-admin'`;
    console.log(`Super admin seeded: ${ADMIN_EMAIL.toLowerCase()} / ${ADMIN_PASSWORD}`);
  } else {
    console.log('Super admin already exists, skipping.');
  }

  // 3. Seed users for existing companies and trainees (skip if user exists for that entity id)
  const companies = await sql`SELECT * FROM companies`;
  let companyUsers = 0;
  for (const c of companies) {
    const existing = await sql`SELECT * FROM users WHERE id = ${c.id}`;
    if (existing.length === 0) {
      await sql`
        INSERT INTO users (id, email, password_hash, role, name, company_id)
        VALUES (${c.id}, ${c.email.toLowerCase()}, ${hashPassword(DEFAULT_PASSWORD)}, 'company', ${c.name}, ${c.id})
      `;
      companyUsers++;
    }
  }

  const trainees = await sql`SELECT * FROM trainees`;
  let traineeUsers = 0;
  for (const t of trainees) {
    const existing = await sql`SELECT * FROM users WHERE id = ${t.id}`;
    if (existing.length === 0) {
      await sql`
        INSERT INTO users (id, email, password_hash, role, name, company_id)
        VALUES (${t.id}, ${t.email.toLowerCase()}, ${hashPassword(DEFAULT_PASSWORD)}, 'trainee', ${t.name}, ${t.company_id})
      `;
      traineeUsers++;
    }
  }
  console.log(`Seeded user accounts -> companies: ${companyUsers}, trainees: ${traineeUsers} (default password: ${DEFAULT_PASSWORD})`);

  // 4. Cleanup expired sessions
  await sql`DELETE FROM sessions WHERE expires_at < NOW()`;
  console.log('Expired sessions cleaned.');

  console.log('=== Migration finished ===');
}

run().catch((err) => {
  console.error('Migration failed:', err);
  process.exit(1);
});