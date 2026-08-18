import { neon } from '@neondatabase/serverless';
import { getSessionUser, getTokenFromRequest } from '@/lib/serverAuth';

const databaseUrl = process.env.DATABASE_URL;
const sql = databaseUrl ? neon(databaseUrl) : null;

export async function GET(request: Request) {
  try {
    const token = getTokenFromRequest(request);
    const user = token ? await getSessionUser(token) : null;
    if (!user) {
      return new Response(JSON.stringify({ error: 'UNAUTHORIZED' }), {
        status: 401,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    if (!id) {
      return new Response(JSON.stringify({ error: 'MISSING_ID' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    if (!sql) {
      return new Response(JSON.stringify({ error: 'NO_DATABASE_URL' }), {
        status: 500,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    const rows = await sql`
      SELECT file_data, file_name, file_content FROM lessons WHERE id = ${id} LIMIT 1
    `;
    const row = rows[0];
    if (!row) {
      return new Response(JSON.stringify({ error: 'NOT_FOUND' }), {
        status: 404,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    const fileName = row.file_name || 'document.pdf';
    const encoded = encodeURIComponent(fileName);
    const disposition = `inline; filename="document.pdf"; filename*=UTF-8''${encoded}`;

    if (row.file_data) {
      let b64 = row.file_data;
      if (b64.startsWith('data:')) b64 = b64.split(',')[1] || '';
      const buf = Buffer.from(b64, 'base64');
      const isPdf = buf.length > 4 && buf[0] === 0x25 && buf[1] === 0x50 && buf[2] === 0x44 && buf[3] === 0x46;
      return new Response(new Uint8Array(buf), {
        status: 200,
        headers: {
          'Content-Type': isPdf ? 'application/pdf' : 'application/octet-stream',
          'Content-Disposition': disposition,
          'Cache-Control': 'private, max-age=300'
        }
      });
    }

    // Fallback: no binary file stored, serve the text content
    return new Response(row.file_content || '', {
      status: 200,
      headers: {
        'Content-Type': 'text/plain; charset=utf-8',
        'Content-Disposition': disposition
      }
    });
  } catch (err) {
    console.error('lesson file route failed:', err);
    return new Response(JSON.stringify({ error: 'SERVER_ERROR' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}