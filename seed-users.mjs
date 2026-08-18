import { neon } from '@neondatabase/serverless';
import crypto from 'crypto';
import fs from 'fs';
import path from 'path';

const envPath = path.resolve(process.cwd(), '.env');
const envContent = fs.readFileSync(envPath, 'utf8');
const dbUrlMatch = envContent.match(/^DATABASE_URL=(.+)$/m);
if (!dbUrlMatch) throw new Error('DATABASE_URL not found in .env');
const sql = neon(dbUrlMatch[1].trim());

const DEFAULT_PASSWORD = process.env.SEED_PASSWORD || 'Tadrib@2026';

function hashPassword(password) {
  const salt = crypto.randomBytes(16).toString('hex');
  const buf = crypto.scryptSync(password, salt, 64);
  return `${salt}:${buf.toString('hex')}`;
}

async function upsertUser(id, email, role, name, companyId) {
  await sql`
    INSERT INTO users (id, email, password_hash, role, name, company_id)
    VALUES (${id}, ${email}, ${hash}, ${role}, ${name}, ${companyId})
    ON CONFLICT (email) DO UPDATE
      SET password_hash = EXCLUDED.password_hash, role = EXCLUDED.role, name = EXCLUDED.name, company_id = EXCLUDED.company_id
  `;
  console.log(`  user up: ${email} (${role})`);
}

let hash;
async function run() {
  hash = hashPassword(DEFAULT_PASSWORD);

  // Super admins
  await upsertUser('usr-admin', 'admin@tadribpro.dz', 'super-admin', 'Super Admin (TadribPro)', null);
  await upsertUser('usr-overseer', 'overseer@tadribpro.dz', 'super-admin', 'Overseer', null);

  // Company users
  const companies = await sql`SELECT id, name, email FROM companies`;
  console.log(`Seeding ${companies.length} company accounts...`);
  for (const c of companies) {
    const email = (c.email && c.email.includes('@')) ? c.email : `${c.id}@tadribpro.dz`;
    await upsertUser('usr-' + c.id, email.toLowerCase(), 'company', c.name, c.id);
  }

  // Trainee users
  const trainees = await sql`SELECT id, name, email, company_id FROM trainees`;
  console.log(`Seeding ${trainees.length} trainee accounts...`);
  let skipped = 0;
  for (const t of trainees) {
    if (!t.email || !t.email.includes('@')) { skipped++; continue; }
    await upsertUser('usr-' + t.id, t.email.toLowerCase(), 'trainee', t.name, t.company_id);
  }
  if (skipped) console.log(`  skipped ${skipped} trainees without email.`);

  console.log(`\nDONE. Default password for all accounts: ${DEFAULT_PASSWORD}`);
}

run().then(() => process.exit(0))
  .catch((e) => { console.error('SEED FAILED', e); process.exit(1); });