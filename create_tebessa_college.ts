import fs from 'fs';
import path from 'path';
import { neon } from '@neondatabase/serverless';
import { OFFICIAL_TRACKS } from './src/lib/db';

async function run() {
  console.log('Starting Tebessa College creation via TS script...');

  // 1. Read .env file for database URL
  const envPath = path.resolve(process.cwd(), '.env');
  const envContent = fs.readFileSync(envPath, 'utf8');
  const dbUrlMatch = envContent.match(/^DATABASE_URL=(.+)$/m);
  if (!dbUrlMatch) {
    throw new Error('DATABASE_URL not found in .env');
  }
  const databaseUrl = dbUrlMatch[1].trim();

  // 2. Initialize database connection
  const sql = neon(databaseUrl);

  console.log(`Loaded ${OFFICIAL_TRACKS.length} official tracks from db.ts.`);

  // Define the target track IDs based on the user's career paths request
  const targetTrackIds = [
    'track-3',   // مصرف
    'track-6',   // مساعد مصرف
    'track-2',   // ملحق الإدارة
    'track-4',   // محاسب إداري رئيسي
    'track-11',  // محاسب إداري
    'track-12',  // مساعد مهندس مستوى أول في الإحصاء
    'track-13',  // مساعد مهندس من المستوى الأول في الإعلام الآلي
    'track-14',  // تقني سامي في الإحصاء
    'track-5',   // تقني سامي في الإعلام الآلي
    'track-15',  // كاتب مديرية رئيسي
    'track-16',  // كاتب مديرية
    'track-1',   // عون إدارة
    'track-17',  // ملحق إدارة - تربص
    'track-18',  // عون مكتب - تربص
    'track-19',  // عون إدارة رئيسي - تربص
    'track-20',  // عون إدارة - تربص
    'track-7',   // مصرف البحث مستوى 1
    'track-21',  // مساعد رئيسي لتسيير البحث
    'track-8',   // مساعد تسيير البحث
    'track-22'   // مساعد تسيير البحث - تربص
  ];

  // Emails mapping for the trainees
  const traineeMapping = [
    { trackId: 'track-3', nameAr: 'تست مصرف', email: 'tebessa-admin@takwinpro.dz' },
    { trackId: 'track-6', nameAr: 'تست مساعد مصرف', email: 'tebessa-admin-assistant@takwinpro.dz' },
    { trackId: 'track-2', nameAr: 'تست ملحق الإدارة', email: 'tebessa-attache@takwinpro.dz' },
    { trackId: 'track-4', nameAr: 'تست محاسب إداري رئيسي', email: 'tebessa-comptable-principal@takwinpro.dz' },
    { trackId: 'track-11', nameAr: 'تست محاسب إداري', email: 'tebessa-comptable@takwinpro.dz' },
    { trackId: 'track-12', nameAr: 'تست مساعد مهندس مستوى أول في الإحصاء', email: 'tebessa-stat-assistant@takwinpro.dz' },
    { trackId: 'track-13', nameAr: 'تست مساعد مهندس مستوى أول في الإعلام الآلي', email: 'tebessa-info-assistant@takwinpro.dz' },
    { trackId: 'track-14', nameAr: 'تست تقني سامي في الإحصاء', email: 'tebessa-stat-tech@takwinpro.dz' },
    { trackId: 'track-5', nameAr: 'تست تقني سامي في الإعلام الآلي', email: 'tebessa-info-tech@takwinpro.dz' },
    { trackId: 'track-15', nameAr: 'تست كاتب مديرية رئيسي', email: 'tebessa-sec-ville-principal@takwinpro.dz' },
    { trackId: 'track-16', nameAr: 'تست كاتب مديرية', email: 'tebessa-sec-ville@takwinpro.dz' },
    { trackId: 'track-1', nameAr: 'تست عون إدارة', email: 'tebessa-agent-admin@takwinpro.dz' },
    { trackId: 'track-17', nameAr: 'تست ملحق إدارة (تربص)', email: 'tebessa-stage-attache@takwinpro.dz' },
    { trackId: 'track-18', nameAr: 'تست عون مكتب (تربص)', email: 'tebessa-stage-bureau@takwinpro.dz' },
    { trackId: 'track-19', nameAr: 'تست عون إدارة رئيسي (تربص)', email: 'tebessa-stage-agent-principal@takwinpro.dz' },
    { trackId: 'track-20', nameAr: 'تست عون إدارة (تربص)', email: 'tebessa-stage-agent@takwinpro.dz' },
    { trackId: 'track-7', nameAr: 'تست مصرف البحث مستوى 1', email: 'tebessa-recherche-admin@takwinpro.dz' },
    { trackId: 'track-21', nameAr: 'تست مساعد رئيسي لتسيير البحث', email: 'tebessa-recherche-assistant-principal@takwinpro.dz' },
    { trackId: 'track-8', nameAr: 'تست مساعد تسيير البحث', email: 'tebessa-recherche-assistant@takwinpro.dz' },
    { trackId: 'track-22', nameAr: 'تست مساعد تسيير البحث (تربص)', email: 'tebessa-stage-recherche-assistant@takwinpro.dz' }
  ];

  // 4. Clean up existing company with ID 'comp-tebessa' to ensure a clean start
  console.log('Cleaning up existing Tebessa College accounts...');
  await sql`DELETE FROM companies WHERE id = 'comp-tebessa'`;

  // 5. Insert Tebessa College company
  const companyName = 'جامعة العربي التبسي - تبسة (Tebessa College)';
  const companyEmail = 'tebessa@takwinpro.dz';
  const companySector = 'التعليم العالي / Recherche';
  
  console.log('Inserting company row...');
  await sql`
    INSERT INTO companies (id, name, sector, email, created_at)
    VALUES ('comp-tebessa', ${companyName}, ${companySector}, ${companyEmail}, NOW())
  `;
  console.log('Company row inserted successfully.');

  // 6. Filter and insert official tracks for this company
  console.log('Registering career tracks for Tebessa College...');
  let sortOrder = 0;
  for (const trackId of targetTrackIds) {
    const track = OFFICIAL_TRACKS.find(t => t.id === trackId);
    if (!track) {
      console.warn(`Warning: Track ${trackId} not found in official list.`);
      continue;
    }

    await sql`
      INSERT INTO company_tracks 
        (company_id, track_id, title_ar, title_fr, sector_ar, sector_fr, category, modules_ar, modules_fr, sort_order)
      VALUES 
        ('comp-tebessa', ${track.id}, ${track.title_ar}, ${track.title_fr}, ${track.sector_ar}, ${track.sector_fr}, ${track.category}, ${track.modules_ar}, ${track.modules_fr}, ${sortOrder++})
    `;
  }
  console.log(`Registered ${sortOrder} career tracks.`);

  // 7. Insert test trainees
  console.log('Creating employee accounts for each career track...');
  const deadline = '2026-12-31';
  for (const item of traineeMapping) {
    const track = OFFICIAL_TRACKS.find(t => t.id === item.trackId);
    if (!track) continue;

    const traineeId = `tr-tebessa-${item.trackId.split('-')[1]}`;
    await sql`
      INSERT INTO trainees 
        (id, name, email, company_id, company_name, track_id, track_title_ar, track_title_fr, progress, status, deadline, completed_modules, created_at)
      VALUES 
        (${traineeId}, ${item.nameAr}, ${item.email}, 'comp-tebessa', ${companyName}, ${item.trackId}, ${track.title_ar}, ${track.title_fr}, 0, 'active', ${deadline}, '{}', NOW())
    `;
  }
  console.log('Employee accounts created successfully.');
  console.log('All Tebessa College accounts created successfully!');
}

run().catch(err => {
  console.error('Failed to create Tebessa College accounts:', err);
  process.exit(1);
});
