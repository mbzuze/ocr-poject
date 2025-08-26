import { NextRequest, NextResponse } from 'next/server';
import formidable from 'formidable';
import fs from 'fs';
import path from 'path';
import axios from 'axios';
import { IncomingMessage } from 'http';
import { Readable } from 'stream';
import FormData from 'form-data';

// Disable Next.js default body parsing
export const config = {
  api: {
    bodyParser: false,
  },
};

// Convert NextRequest body into an IncomingMessage-compatible stream
async function toIncomingMessage(req: NextRequest): Promise<IncomingMessage> {
  const reader = req.body?.getReader();
  if (!reader) throw new Error('No request body found');

  const chunks: Uint8Array[] = [];
  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    if (value) chunks.push(value);
  }

  const buffer = Buffer.concat(chunks);
  const stream = Readable.from([buffer]); // ✅ Emit buffer as one chunk
  const headers = Object.fromEntries(req.headers);
  const contentLength = req.headers.get('content-length');
  const contentType = req.headers.get('content-type');

  if (contentLength) headers['content-length'] = contentLength;
  if (contentType) headers['content-type'] = contentType;

  const incoming = Object.assign(stream, {
    headers,
    method: req.method,
    url: req.url || '',
  });
  Object.setPrototypeOf(incoming, IncomingMessage.prototype);
  return incoming as IncomingMessage;
}

// Helper to normalize form field
function getFieldValue(field: string | string[] | undefined): string {
  if (Array.isArray(field)) return field[0] ?? '';
  return field ?? '';
}

export async function POST(req: NextRequest) {
  try {
    // 1. Turn the NextRequest into a Node‐style request for formidable
    const nodeReq = await toIncomingMessage(req);

    // 2. Ensure upload directory exists
    const uploadDir = path.join(process.cwd(), 'uploads');
    if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir);

    // 3. Parse form with formidable
    const form = formidable({
      multiples: false,
      keepExtensions: true,
      uploadDir,
    });

    const { fields, files } = await new Promise<{
      fields: formidable.Fields;
      files: formidable.Files;
    }>((resolve, reject) => {
      form.parse(nodeReq, (err, fields, files) => {
        if (err) return reject(err);
        resolve({ fields, files });
      });
    });

    // 4. Extract metadata fields
    const firstName = getFieldValue(fields['first-name']);
    const lastName = getFieldValue(fields['last-name']);
    const dob = getFieldValue(fields['dob']);
    const extractionMethod = getFieldValue(fields['extraction-method']);

    // 5. Grab the uploaded file
    const uploaded = Array.isArray(files.file) ? files.file[0] : files.file;
    if (!uploaded || typeof uploaded !== 'object') {
      return NextResponse.json({ error: 'No valid file uploaded' }, { status: 400 });
    }

    // 6. Validate file type & size
    const allowed = ['image/jpeg', 'image/png', 'application/pdf'];
    const maxBytes = 10 * 1024 * 1024;
    if (!uploaded.mimetype || !allowed.includes(uploaded.mimetype)) {
      return NextResponse.json({ error: 'Only JPEG, PNG or PDF allowed' }, { status: 400 });
    }
    if (uploaded.size > maxBytes) {
      return NextResponse.json({ error: 'File too large (max 10MB)' }, { status: 400 });
    }

    // 7. Forward to your Express backend
    const forward = new FormData();
    const ext = uploaded.mimetype.split('/')[1] ?? 'bin';
    const filename = uploaded.originalFilename || `upload.${ext}`;

    forward.append(
      'file',
      fs.createReadStream(uploaded.filepath),
      filename
    );
    forward.append('firstName', firstName);
    forward.append('lastName', lastName);
    forward.append('dob', dob);
    forward.append('extractionMethod', extractionMethod);

     const resp = await axios.post('http://localhost:3000/process', forward, {
      headers: forward.getHeaders(),
    })

    const result = resp.data

    // 5. encode the entire JSON result
    const payload = encodeURIComponent(JSON.stringify(result))

    // 6. MUST use an absolute URL here
    const redirectUrl = new URL(`/results?payload=${payload}`, req.url)
    return NextResponse.redirect(redirectUrl, 303)
  } catch (err: any) {
    console.error('❌ upload error:', err)
    return NextResponse.json(
      { error: err.message || 'Unexpected upload failure' },
      { status: 500 }
    )
  }
}