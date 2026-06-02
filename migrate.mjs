import { neon } from '@neondatabase/serverless';

const sql = neon(process.env.DATABASE_URL);

async function run() {
  console.log("Running migration...");
  
  await sql`
    CREATE TABLE IF NOT EXISTS company_messages (
      id VARCHAR PRIMARY KEY,
      company_id VARCHAR,
      title VARCHAR,
      content TEXT,
      created_at TIMESTAMP
    )
  `;
  console.log("company_messages table created or exists.");
  
  try {
    await sql`ALTER TABLE lessons ADD COLUMN track_ids TEXT`;
    console.log("track_ids column added to lessons.");
  } catch(e) {
    console.log("track_ids column might already exist:", e.message);
  }
  
  console.log("Migration finished.");
}

run().catch(console.error);
