import { NextRequest, NextResponse } from 'next/server';   // Next.js request/response types
import formidable from 'formidable';                      // multipart form parser
import fs from 'fs';                                       // filesystem access
import path from 'path';                                   // filesystem path utilities
import axios from 'axios';                                 // HTTP client
import { IncomingMessage } from 'http';                    // Node.js HTTP request type
import { Readable } from 'stream';                         // creates stream from buffer
import FormData from 'form-data';                          // builds multipart/form-data bodies

// Disable Next.js built-in body parsing so we can stream raw request to formidable
export const config = {
  api: {
    bodyParser: false,
  },
};

/**
 * Convert a NextRequest (Web Streams API) into a Node.js IncomingMessage
 * so that formidable can parse it. We buffer all chunks and reconstruct
 * headers, method, URL on a Readable stream.
 */
async function toIncomingMessage(req: NextRequest): Promise<IncomingMessage> {
  const reader = req.body?.getReader();
  if (!reader) throw new Error('No request body found');

  // Read all Uint8Array chunks from the request stream
  const chunks: Uint8Array[] = [];
  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    if (value) chunks.push(value);
  }

  // Concatenate into one Buffer and wrap in a Readable stream
  const buffer = Buffer.concat(chunks);
  const stream = Readable.from([buffer]);

  // Copy over relevant headers
  const headers = Object.fromEntries(req.headers);
  const contentLength = req.headers.get('content-length');
  const contentType = req.headers.get('content-type');
  if (contentLength) headers['content-length'] = contentLength;
  if (contentType) headers['content-type'] = contentType;

  // Assign method, url, headers onto the stream to mimic IncomingMessage
  const incoming = Object.assign(stream, {
    headers,
    method: req.method,
    url: req.url || '',
  });
  Object.setPrototypeOf(incoming, IncomingMessage.prototype);

  return incoming as IncomingMessage;
}

/** Normalize a form field value (string | string[] | undefined) to a single string */
function getFieldValue(field: string | string[] | undefined): string {
  if (Array.isArray(field)) return field[0] ?? '';
  return field ?? '';
}

/**
 * Handle POST /api/upload
 * 1. Convert to Node req for formidable
 * 2. Parse multipart form & save to disk
 * 3. Validate fields and file
 * 4. Forward to backend service
 * 5. Redirect to results page with encoded payload
 */
export async function POST(req: NextRequest) {
  try {
    // 1. Turn NextRequest into Node IncomingMessage for formidable
    const nodeReq = await toIncomingMessage(req);

    // 2. Ensure the 'uploads' directory exists
    const uploadDir = path.join(process.cwd(), 'uploads');
    if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir);

    // 3. Parse form fields & files
    const form = formidable({
      multiples: false,
      keepExtensions: true,
      uploadDir,
    });
    const { fields, files } = await new Promise<{
      fields: formidable.Fields;
      files: formidable.Files;
    }>((resolve, reject) => {
      form.parse(nodeReq, (err, flds, fls) => {
        if (err) return reject(err);
        resolve({ fields: flds, files: fls });
      });
    });

    // 4. Extract metadata fields from parsed form
    const firstName = getFieldValue(fields['first-name']);
    const lastName = getFieldValue(fields['last-name']);
    const dob = getFieldValue(fields['dob']);
    const extractionMethod = getFieldValue(fields['extraction-method']);

    // 5. Retrieve the single uploaded file
    const uploaded = Array.isArray(files.file) ? files.file[0] : files.file;
    if (!uploaded || typeof uploaded !== 'object') {
      return NextResponse.json({ error: 'No valid file uploaded' }, { status: 400 });
    }

    // 6. Validate file MIME type and size (max 10MB)
    const allowed = ['image/jpeg', 'image/png', 'application/pdf'];
    const maxBytes = 10 * 1024 * 1024;
    if (!uploaded.mimetype || !allowed.includes(uploaded.mimetype)) {
      return NextResponse.json({ error: 'Only JPEG, PNG or PDF allowed' }, { status: 400 });
    }
    if (uploaded.size > maxBytes) {
      return NextResponse.json({ error: 'File too large (max 10MB)' }, { status: 400 });
    }

    // 7. Forward parsed data + file to downstream Express backend
    const forward = new FormData();
    const ext = uploaded.mimetype.split('/')[1] ?? 'bin';
    const filename = uploaded.originalFilename || `upload.${ext}`;
    forward.append('file', fs.createReadStream(uploaded.filepath), filename);
    forward.append('firstName', firstName);
    forward.append('lastName', lastName);
    forward.append('dob', dob);
    forward.append('extractionMethod', extractionMethod);

    const resp = await axios.post('http://localhost:3000/process', forward, {
      headers: forward.getHeaders(),
    });
    const result = resp.data;

    // 8. Encode the entire JSON result into a URL-safe payload
    const payload = encodeURIComponent(JSON.stringify(result));

    // 9. Redirect to /results, passing payload as query param
    const redirectUrl = new URL(`/results?payload=${payload}`, req.url);
    return NextResponse.redirect(redirectUrl, 303);

  } catch (err: any) {
    // Log and return a 500 on unexpected errors
    console.error('❌ upload error:', err);
    return NextResponse.json(
      { error: err.message || 'Unexpected upload failure' },
      { status: 500 }
    );
  }
}