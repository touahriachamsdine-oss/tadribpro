import { NextResponse } from 'next/server';
import { neon } from '@neondatabase/serverless';
import { getSessionUser, getTokenFromRequest, type SessionUser } from '@/lib/serverAuth';

const databaseUrl = process.env.DATABASE_URL;
const isLiveNeon = !!databaseUrl;

// Initialize serverless SQL client
const sql = isLiveNeon ? neon(databaseUrl) : null;

// Public actions (certificate verification portal) - no session required
const PUBLIC_ACTIONS = new Set(['verifyCertificate']);

// Certificate record reads are authenticated and scoped (own certificate / own trainees)

// Platform-admin only actions
const SUPER_ADMIN_ONLY = new Set(['addCompany', 'deleteCompany']);

// Company-admin write actions (on own data)
const COMPANY_WRITE = new Set([
  'assignTrainee',
  'updateTraineeModule',
  'updateTraineeTrack',
  'deleteTrainee',
  'addTicket',
  'updateTicketStatus',
  'addCourseEvaluation',
  'addLesson',
  'deleteLesson',
  'addCompanyMessage',
  'deleteCompanyMessage',
  'saveCompanyTracks',
  'updateCompany'
]);

// Actions a trainee may perform on their own record only
const TRAINEE_SELF_WRITE = new Set(['updateTraineeModule', 'addTicket', 'addCourseEvaluation', 'addCertificate']);

// Certificate reads a signed-in user may perform (scoped to self / own company)
const CERT_OWN_READ = new Set(['getCertificate', 'getCertificateByTrainee']);

// Read actions a trainee may perform (scoped to their company)
const TRAINEE_READ = new Set([
  'getTrainees',
  'getTickets',
  'getCourseEvaluations',
  'getLessons',
  'getCompanyMessages',
  'getCompanyTracks',
  'getTraineeByEmail'
]);

interface AuthzResult {
  allowed: boolean;
  companyScope?: string;
  traineeScope?: string;
}

function authorize(action: string, user: SessionUser): AuthzResult {
  const { role, company_id } = user;
  const ownCompany = company_id ?? null;

  if (role === 'super-admin') return { allowed: true };

  if (role === 'company') {
    if (SUPER_ADMIN_ONLY.has(action)) return { allowed: false };
    if (!ownCompany) return { allowed: false };
    return { allowed: true, companyScope: ownCompany };
  }

  // trainee
  if (SUPER_ADMIN_ONLY.has(action)) return { allowed: false };
  if (TRAINEE_SELF_WRITE.has(action) || CERT_OWN_READ.has(action)) {
    return { allowed: true, companyScope: ownCompany ?? undefined, traineeScope: user.id };
  }
  if (COMPANY_WRITE.has(action)) return { allowed: false };
  if (TRAINEE_READ.has(action)) {
    return { allowed: true, companyScope: ownCompany ?? undefined };
  }
  return { allowed: false };
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { action } = body;
    let payload: any = body.payload;

    if (!isLiveNeon) {
      return NextResponse.json(
        { error: 'NO_DATABASE_URL', message: 'Neon DATABASE_URL is not configured.' },
        { status: 200 } // Return 200 so client knows it should gracefully fallback to localStorage
      );
    }

    if (!sql) {
      throw new Error('Database client failed to initialize');
    }

    // ---- Authorization -------------------------------------------------
    if (!PUBLIC_ACTIONS.has(action)) {
      const token = getTokenFromRequest(request);
      const user = token ? await getSessionUser(token) : null;
      if (!user) {
        return NextResponse.json({ error: 'UNAUTHORIZED', message: 'Please log in first.' }, { status: 401 });
      }
      const authz = authorize(action, user);
      if (!authz.allowed) {
        return NextResponse.json({ error: 'FORBIDDEN', message: 'You do not have permission for this action.' }, { status: 403 });
      }
      // Server-side data scoping: derive company/trainee from the session, never from the client
      const scopedByCompany = ['getTrainees', 'getTickets', 'getCourseEvaluations', 'getCompanyMessages'];
      if (authz.companyScope && !authz.traineeScope) {
        if (!payload || typeof payload !== 'object') payload = {};
        if (scopedByCompany.includes(action)) payload.companyId = authz.companyScope;
        if (action === 'getLessons' || action === 'getCompanyTracks') {
          // Allow the 'global' sentinel, otherwise force the session company
          if (!payload.companyId || (payload.companyId !== 'global' && payload.companyId !== authz.companyScope)) {
            payload.companyId = authz.companyScope;
          }
        }
        if (['addLesson', 'addCompanyMessage', 'assignTrainee', 'addTicket', 'addCertificate'].includes(action)) {
          payload.companyId = authz.companyScope;
        }
        if (['updateCompany', 'getCompany'].includes(action)) payload.id = authz.companyScope;
        if (action === 'getCompanyByEmail') {
          const [c] = await sql`SELECT email FROM companies WHERE id = ${authz.companyScope}`;
          if (c) payload.email = c.email;
        }
        if (action === 'addCertificate') {
          const [comp] = await sql`SELECT name FROM companies WHERE id = ${authz.companyScope}`;
          if (comp) payload.companyName = comp.name;
        }

        // Ownership guard: actions referencing a specific record must stay inside the session company
        const ownership: Record<string, { table: string; pk: string; col: string } | null> = {
          updateTraineeModule: { table: 'trainees', pk: 'traineeId', col: 'id' },
          updateTraineeTrack: { table: 'trainees', pk: 'traineeId', col: 'id' },
          addTicket: { table: 'trainees', pk: 'traineeId', col: 'id' },
          addCourseEvaluation: { table: 'trainees', pk: 'traineeId', col: 'id' },
          addCertificate: { table: 'trainees', pk: 'traineeId', col: 'id' },
          getCertificate: { table: 'trainees', pk: 'traineeId', col: 'id' },
          getCertificateByTrainee: { table: 'trainees', pk: 'traineeId', col: 'id' },
          getTraineeByEmail: { table: 'trainees', pk: 'email', col: 'email' },
          deleteTrainee: { table: 'trainees', pk: 'id', col: 'id' },
          deleteLesson: { table: 'lessons', pk: 'id', col: 'id' },
          deleteCompanyMessage: { table: 'company_messages', pk: 'id', col: 'id' },
          updateTicketStatus: { table: 'support_tickets', pk: 'ticketId', col: 'id' }
        };
        const chk = ownership[action];
        if (chk) {
          const pkValue = payload ? payload[chk.pk] : undefined;
          if (!pkValue) {
            return NextResponse.json({ error: 'FORBIDDEN', message: 'You do not have permission for this action.' }, { status: 403 });
          }
          const ownedRows = await sql.query(
            `SELECT company_id FROM ${chk.table} WHERE ${chk.col} = $1 LIMIT 1`,
            [pkValue]
          );
          const owned = Array.isArray(ownedRows) && ownedRows.length ? ownedRows[0] : null;
          if (!owned || owned.company_id !== authz.companyScope) {
            return NextResponse.json({ error: 'FORBIDDEN', message: 'You do not have permission for this action.' }, { status: 403 });
          }
        }
      }

      if (authz.traineeScope) {
        if (!payload || typeof payload !== 'object') payload = {};
        if (['updateTraineeModule', 'addTicket', 'addCourseEvaluation', 'addCertificate', 'getCertificate', 'getCertificateByTrainee'].includes(action)) {
          payload.traineeId = authz.traineeScope;
        }
        if (action === 'getTraineeByEmail') payload.email = user.email;
        if (action === 'addTicket' || action === 'addCourseEvaluation' || action === 'addCertificate') {
          payload.traineeName = user.name;
          payload.companyId = authz.companyScope ?? payload.companyId;
        }
        if (action === 'addCertificate') {
          const [comp0] = await sql`SELECT name FROM companies WHERE id = ${payload.companyId}`;
          if (comp0) payload.companyName = comp0.name;
        }
      }
    }

    switch (action) {
      case 'getCompanies': {
        // Fetch companies with trainee counts
        const rows = await sql`
          SELECT c.*, COALESCE(t.cnt, 0)::integer as "traineeCount"
          FROM companies c
          LEFT JOIN (
            SELECT company_id, COUNT(*) as cnt
            FROM trainees
            GROUP BY company_id
          ) t ON c.id = t.company_id
          ORDER BY c.name ASC
        `;
        // Normalize fields (e.g. created_at -> createdAt)
        const normalized = rows.map(r => ({
          id: r.id,
          name: r.name,
          sector: r.sector,
          email: r.email,
          traineeCount: r.traineeCount,
          createdAt: r.created_at
        }));
        return NextResponse.json({ success: true, data: normalized });
      }

      case 'addCompany': {
        const { id, name, sector, email } = payload;
        const [row] = await sql`
          INSERT INTO companies (id, name, sector, email, created_at)
          VALUES (${id}, ${name}, ${sector}, ${email}, NOW())
          RETURNING *
        `;
        return NextResponse.json({
          success: true,
          data: {
            id: row.id,
            name: row.name,
            sector: row.sector,
            email: row.email,
            traineeCount: 0,
            createdAt: row.created_at
          }
        });
      }

      case 'deleteCompany': {
        const { id } = payload;
        // Cascade delete on trainees is handled by database foreign key constraints
        await sql`DELETE FROM companies WHERE id = ${id}`;
        return NextResponse.json({ success: true });
      }

      case 'getTrainees': {
        const { companyId } = payload || {};
        let rows;
        if (companyId) {
          rows = await sql`SELECT * FROM trainees WHERE company_id = ${companyId} ORDER BY name ASC`;
        } else {
          rows = await sql`SELECT * FROM trainees ORDER BY name ASC`;
        }

        const normalized = rows.map(r => ({
          id: r.id,
          name: r.name,
          email: r.email,
          companyId: r.company_id,
          companyName: r.company_name,
          trackId: r.track_id,
          trackTitleAr: r.track_title_ar,
          trackTitleFr: r.track_title_fr,
          progress: r.progress,
          status: r.status,
          deadline: r.deadline,
          completedModules: r.completed_modules || []
        }));
        return NextResponse.json({ success: true, data: normalized });
      }

      case 'assignTrainee': {
        const { id, name, email, companyId, companyName, trackId, trackTitleAr, trackTitleFr, deadline } = payload;
        const [row] = await sql`
          INSERT INTO trainees (id, name, email, company_id, company_name, track_id, track_title_ar, track_title_fr, progress, status, deadline, completed_modules, created_at)
          VALUES (${id}, ${name}, ${email}, ${companyId}, ${companyName}, ${trackId}, ${trackTitleAr}, ${trackTitleFr}, 0, 'active', ${deadline}, '{}', NOW())
          RETURNING *
        `;
        return NextResponse.json({
          success: true,
          data: {
            id: row.id,
            name: row.name,
            email: row.email,
            companyId: row.company_id,
            companyName: row.company_name,
            trackId: row.track_id,
            trackTitleAr: row.track_title_ar,
            trackTitleFr: row.track_title_fr,
            progress: row.progress,
            status: row.status,
            deadline: row.deadline,
            completedModules: row.completed_modules || []
          }
        });
      }

      case 'updateTraineeModule': {
        const { traineeId, completedModules, progress, status } = payload;
        const [row] = await sql`
          UPDATE trainees
          SET completed_modules = ${completedModules}, progress = ${progress}, status = ${status}
          WHERE id = ${traineeId}
          RETURNING *
        `;
        if (!row) {
          return NextResponse.json({ success: false, error: 'Trainee not found' }, { status: 404 });
        }
        return NextResponse.json({
          success: true,
          data: {
            id: row.id,
            name: row.name,
            email: row.email,
            companyId: row.company_id,
            companyName: row.company_name,
            trackId: row.track_id,
            trackTitleAr: row.track_title_ar,
            trackTitleFr: row.track_title_fr,
            progress: row.progress,
            status: row.status,
            deadline: row.deadline,
            completedModules: row.completed_modules || []
          }
        });
      }

      case 'deleteTrainee': {
        const { id } = payload;
        await sql`DELETE FROM trainees WHERE id = ${id}`;
        return NextResponse.json({ success: true });
      }

      case 'getTickets': {
        const { companyId } = payload || {};
        let rows;
        if (companyId) {
          rows = await sql`SELECT * FROM support_tickets WHERE company_id = ${companyId} ORDER BY created_at DESC`;
        } else {
          rows = await sql`SELECT * FROM support_tickets ORDER BY created_at DESC`;
        }
        const normalized = rows.map(r => ({
          id: r.id,
          traineeId: r.trainee_id,
          traineeName: r.trainee_name,
          companyId: r.company_id,
          subject: r.subject,
          message: r.message,
          status: r.status,
          createdAt: r.created_at
        }));
        return NextResponse.json({ success: true, data: normalized });
      }

      case 'addTicket': {
        const { id, traineeId, traineeName, companyId, subject, message } = payload;
        const [row] = await sql`
          INSERT INTO support_tickets (id, trainee_id, trainee_name, company_id, subject, message, status, created_at)
          VALUES (${id}, ${traineeId}, ${traineeName}, ${companyId}, ${subject}, ${message}, 'pending', NOW())
          RETURNING *
        `;
        return NextResponse.json({
          success: true,
          data: {
            id: row.id,
            traineeId: row.trainee_id,
            traineeName: row.trainee_name,
            companyId: row.company_id,
            subject: row.subject,
            message: row.message,
            status: row.status,
            createdAt: row.created_at
          }
        });
      }

      case 'updateTicketStatus': {
        const { ticketId, status } = payload;
        await sql`UPDATE support_tickets SET status = ${status} WHERE id = ${ticketId}`;
        return NextResponse.json({ success: true });
      }

      case 'getCourseEvaluations': {
        const { companyId } = payload || {};
        let rows;
        if (companyId) {
          rows = await sql`SELECT * FROM course_evaluations WHERE company_id = ${companyId} ORDER BY created_at DESC`;
        } else {
          rows = await sql`SELECT * FROM course_evaluations ORDER BY created_at DESC`;
        }
        const normalized = rows.map(r => ({
          id: r.id,
          traineeId: r.trainee_id,
          traineeName: r.trainee_name,
          companyId: r.company_id,
          trackId: r.track_id,
          moduleTitle: r.module_title,
          ratingCourseQuality: r.rating_course_quality,
          ratingTechnicalPerformance: r.rating_technical_performance,
          ratingGeneralUtility: r.rating_general_utility,
          feedback: r.feedback,
          createdAt: r.created_at
        }));
        return NextResponse.json({ success: true, data: normalized });
      }

      case 'addCourseEvaluation': {
        const { id, traineeId, traineeName, companyId, trackId, moduleTitle, ratingCourseQuality, ratingTechnicalPerformance, ratingGeneralUtility, feedback } = payload;
        const [row] = await sql`
          INSERT INTO course_evaluations (id, trainee_id, trainee_name, company_id, track_id, module_title, rating_course_quality, rating_technical_performance, rating_general_utility, feedback, created_at)
          VALUES (${id}, ${traineeId}, ${traineeName}, ${companyId}, ${trackId}, ${moduleTitle}, ${ratingCourseQuality}, ${ratingTechnicalPerformance}, ${ratingGeneralUtility}, ${feedback}, NOW())
          RETURNING *
        `;
        return NextResponse.json({
          success: true,
          data: {
            id: row.id,
            traineeId: row.trainee_id,
            traineeName: row.trainee_name,
            companyId: row.company_id,
            trackId: row.track_id,
            moduleTitle: row.module_title,
            ratingCourseQuality: row.rating_course_quality,
            ratingTechnicalPerformance: row.rating_technical_performance,
            ratingGeneralUtility: row.rating_general_utility,
            feedback: row.feedback,
            createdAt: row.created_at
          }
        });
      }

      case 'getCertificate': {
        const { id } = payload;
        const [row] = await sql`SELECT * FROM certificates WHERE id = ${id}`;
        if (!row) return NextResponse.json({ success: true, data: null });
        return NextResponse.json({
          success: true,
          data: {
            id: row.id,
            traineeId: row.trainee_id,
            traineeName: row.trainee_name,
            companyId: row.company_id,
            companyName: row.company_name,
            trackId: row.track_id,
            trackTitleAr: row.track_title_ar,
            trackTitleFr: row.track_title_fr,
            issueDate: row.issue_date,
            hash: row.hash
          }
        });
      }

      case 'getCertificateByTrainee': {
        const { traineeId } = payload;
        const [row] = await sql`SELECT * FROM certificates WHERE trainee_id = ${traineeId}`;
        if (!row) return NextResponse.json({ success: true, data: null });
        return NextResponse.json({
          success: true,
          data: {
            id: row.id,
            traineeId: row.trainee_id,
            traineeName: row.trainee_name,
            companyId: row.company_id,
            companyName: row.company_name,
            trackId: row.track_id,
            trackTitleAr: row.track_title_ar,
            trackTitleFr: row.track_title_fr,
            issueDate: row.issue_date,
            hash: row.hash
          }
        });
      }

      case 'addCertificate': {
        const { id, traineeId, traineeName, companyId, companyName, trackId, trackTitleAr, trackTitleFr, issueDate, hash } = payload;
        const [row] = await sql`
          INSERT INTO certificates (id, trainee_id, trainee_name, company_id, company_name, track_id, track_title_ar, track_title_fr, issue_date, hash)
          VALUES (${id}, ${traineeId}, ${traineeName}, ${companyId}, ${companyName}, ${trackId}, ${trackTitleAr}, ${trackTitleFr}, ${issueDate}, ${hash})
          RETURNING *
        `;
        return NextResponse.json({
          success: true,
          data: {
            id: row.id,
            traineeId: row.trainee_id,
            traineeName: row.trainee_name,
            companyId: row.company_id,
            companyName: row.company_name,
            trackId: row.track_id,
            trackTitleAr: row.track_title_ar,
            trackTitleFr: row.track_title_fr,
            issueDate: row.issue_date,
            hash: row.hash
          }
        });
      }

      case 'verifyCertificate': {
        const { code } = payload;
        const uppercaseCode = code.toUpperCase().trim();
        const [row] = await sql`
          SELECT * FROM certificates 
          WHERE UPPER(id) = ${uppercaseCode} OR hash = ${code.trim()}
        `;
        if (!row) return NextResponse.json({ success: true, data: null });
        return NextResponse.json({
          success: true,
          data: {
            id: row.id,
            traineeId: row.trainee_id,
            traineeName: row.trainee_name,
            companyId: row.company_id,
            companyName: row.company_name,
            trackId: row.track_id,
            trackTitleAr: row.track_title_ar,
            trackTitleFr: row.track_title_fr,
            issueDate: row.issue_date,
            hash: row.hash
          }
        });
      }

      case 'getLessons': {
        const { companyId } = payload;
        const rows = await sql`
          SELECT * FROM lessons 
          WHERE company_id = ${companyId} 
          ORDER BY created_at DESC
        `;
        const normalized = rows.map(r => ({
          id: r.id,
          companyId: r.company_id,
          title: r.title,
          moduleTitle: r.module_title,
          trackIds: r.track_ids ? JSON.parse(r.track_ids) : [],
          fileName: r.file_name,
          fileContent: r.file_content,
          createdAt: r.created_at
        }));
        return NextResponse.json({ success: true, data: normalized });
      }

      case 'addLesson': {
        const { id, companyId, title, moduleTitle, trackIds, fileName, fileContent } = payload;
        const [row] = await sql`
          INSERT INTO lessons (id, company_id, title, module_title, track_ids, file_name, file_content, created_at)
          VALUES (${id}, ${companyId}, ${title}, ${moduleTitle}, ${JSON.stringify(trackIds || [])}, ${fileName}, ${fileContent}, NOW())
          RETURNING *
        `;
        return NextResponse.json({
          success: true,
          data: {
            id: row.id,
            companyId: row.company_id,
            title: row.title,
            moduleTitle: row.module_title,
            trackIds: row.track_ids ? JSON.parse(row.track_ids) : [],
            fileName: row.file_name,
            fileContent: row.file_content,
            createdAt: row.created_at
          }
        });
      }

      case 'deleteLesson': {
        const { id } = payload;
        await sql`DELETE FROM lessons WHERE id = ${id}`;
        return NextResponse.json({ success: true });
      }

      case 'getCompanyMessages': {
        const { companyId } = payload;
        const rows = await sql`
          SELECT * FROM company_messages 
          WHERE company_id = ${companyId} 
          ORDER BY created_at DESC
        `;
        const normalized = rows.map(r => ({
          id: r.id,
          companyId: r.company_id,
          title: r.title,
          content: r.content,
          createdAt: r.created_at
        }));
        return NextResponse.json({ success: true, data: normalized });
      }

      case 'addCompanyMessage': {
        const { id, companyId, title, content } = payload;
        const [row] = await sql`
          INSERT INTO company_messages (id, company_id, title, content, created_at)
          VALUES (${id}, ${companyId}, ${title}, ${content}, NOW())
          RETURNING *
        `;
        return NextResponse.json({
          success: true,
          data: {
            id: row.id,
            companyId: row.company_id,
            title: row.title,
            content: row.content,
            createdAt: row.created_at
          }
        });
      }

      case 'deleteCompanyMessage': {
        const { id } = payload;
        await sql`DELETE FROM company_messages WHERE id = ${id}`;
        return NextResponse.json({ success: true });
      }

      case 'getCompanyTracks': {
        const { companyId } = payload;
        const rows = await sql`
          SELECT * FROM company_tracks 
          WHERE company_id = ${companyId} 
          ORDER BY sort_order ASC
        `;
        const normalized = rows.map(r => ({
          id: r.track_id,
          title_ar: r.title_ar,
          title_fr: r.title_fr,
          sector_ar: r.sector_ar,
          sector_fr: r.sector_fr,
          category: r.category,
          modules_ar: r.modules_ar || [],
          modules_fr: r.modules_fr || []
        }));
        return NextResponse.json({ success: true, data: normalized });
      }

      case 'saveCompanyTracks': {
        const { companyId, tracks } = payload;
        await sql`DELETE FROM company_tracks WHERE company_id = ${companyId}`;
        for (let i = 0; i < tracks.length; i++) {
          const t = tracks[i];
          await sql`
            INSERT INTO company_tracks 
              (company_id, track_id, title_ar, title_fr, sector_ar, sector_fr, category, modules_ar, modules_fr, sort_order)
            VALUES 
              (${companyId}, ${t.id}, ${t.title_ar}, ${t.title_fr}, ${t.sector_ar}, ${t.sector_fr}, ${t.category}, ${t.modules_ar}, ${t.modules_fr}, ${i})
          `;
        }
        return NextResponse.json({ success: true });
      }

      case 'getCompany': {
        const { id } = payload;
        const [row] = await sql`SELECT * FROM companies WHERE id = ${id}`;
        if (!row) return NextResponse.json({ success: true, data: null });
        return NextResponse.json({
          success: true,
          data: {
            id: row.id,
            name: row.name,
            sector: row.sector,
            email: row.email,
            createdAt: row.created_at
          }
        });
      }

      case 'getCompanyByEmail': {
        const { email } = payload;
        const [row] = await sql`SELECT * FROM companies WHERE email = ${email}`;
        if (!row) return NextResponse.json({ success: true, data: null });
        return NextResponse.json({
          success: true,
          data: {
            id: row.id,
            name: row.name,
            sector: row.sector,
            email: row.email,
            createdAt: row.created_at
          }
        });
      }

      case 'updateCompany': {
        const { id, name, sector, email } = payload;
        if (email) {
          await sql`
            UPDATE companies 
            SET name = ${name}, sector = ${sector}, email = ${email}
            WHERE id = ${id}
          `;
        } else {
          await sql`
            UPDATE companies 
            SET name = ${name}, sector = ${sector}
            WHERE id = ${id}
          `;
        }
        return NextResponse.json({ success: true });
      }

      case 'getTraineeByEmail': {
        const { email } = payload;
        const [row] = await sql`SELECT * FROM trainees WHERE email = ${email}`;
        if (!row) return NextResponse.json({ success: true, data: null });
        return NextResponse.json({
          success: true,
          data: {
            id: row.id,
            name: row.name,
            email: row.email,
            companyId: row.company_id,
            companyName: row.company_name,
            trackId: row.track_id,
            trackTitleAr: row.track_title_ar,
            trackTitleFr: row.track_title_fr,
            progress: row.progress,
            status: row.status,
            deadline: row.deadline,
            completedModules: row.completed_modules || []
          }
        });
      }

      case 'updateTraineeTrack': {
        const { traineeId, trackId, trackTitleAr, trackTitleFr } = payload;
        const [row] = await sql`
          UPDATE trainees
          SET track_id = ${trackId}, track_title_ar = ${trackTitleAr}, track_title_fr = ${trackTitleFr}, progress = 0, completed_modules = '{}', status = 'active'
          WHERE id = ${traineeId}
          RETURNING *
        `;
        if (!row) {
          return NextResponse.json({ success: false, error: 'NOT_FOUND' });
        }
        return NextResponse.json({
          success: true,
          data: {
            id: row.id,
            name: row.name,
            email: row.email,
            companyId: row.company_id,
            companyName: row.company_name,
            trackId: row.track_id,
            trackTitleAr: row.track_title_ar,
            trackTitleFr: row.track_title_fr,
            progress: row.progress,
            status: row.status,
            deadline: row.deadline,
            completedModules: row.completed_modules || []
          }
        });
      }

      default:
        return NextResponse.json({ error: 'INVALID_ACTION', message: `Unknown action: ${action}` }, { status: 400 });
    }
  } catch (error) {
    console.error('Neon API Bridge Error:', error);
    return NextResponse.json(
      { error: 'SERVER_ERROR', message: error instanceof Error ? error.message : String(error) },
      { status: 500 }
    );
  }
}
