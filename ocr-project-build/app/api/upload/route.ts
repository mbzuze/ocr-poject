import { NextRequest, NextResponse } from 'next/server';
import formidable from 'formidable';
import fs from 'fs';
import axios from 'axios';
import { IncomingMessage } from 'http';
import { Readable } from 'stream';
import FormData from 'form-data';
import path from 'path';

// Disable Next.js default body parsing
export const config = {
  api: {
    bodyParser: false,
  },
};

// Convert NextRequest to IncomingMessage-compatible stream
const toIncomingMessage = async (req: NextRequest): Promise<IncomingMessage> => {
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
};

// Normalize field values
const getField = (field: string | string[] | undefined): string => {
  if (Array.isArray(field)) return field[0] || '';
  return field || '';
};

export async function POST(req: NextRequest) {
  try {
    const nodeReq = await toIncomingMessage(req);

    const uploadDir = path.join(process.cwd(), 'uploads');
    if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir);

    const form = formidable({
      multiples: false,
      keepExtensions: true,
      uploadDir,
    });

    // console.log('🛠️ Parsing form...');
    const { fields, files } = await new Promise<{ fields: formidable.Fields; files: formidable.Files }>((resolve, reject) => {
      form.parse(nodeReq, (err, fields, files) => {
        if (err) {
          console.error('❌ Form parse error:', err);
          reject(err);
        } else {
          console.log('✅ Form parsed successfully');
          resolve({ fields, files });
        }
      });
    });

    const firstName = getField(fields['first-name']);
    const lastName = getField(fields['last-name']);
    const dob = getField(fields['dob']);
    const extractionMethod = getField(fields['extraction-method']);

    const uploadedFile = Array.isArray(files.file) ? files.file[0] : files.file;

    if (!uploadedFile || typeof uploadedFile !== 'object') {
      return NextResponse.json({ error: 'No valid file uploaded' }, { status: 400 });
    }

    // ✅ Validate file type and size
    const allowedTypes = ['image/jpeg', 'image/png', 'image/jpg', 'application/pdf'];
    const maxSize = 10 * 1024 * 1024; // 10MB

    if (!uploadedFile.mimetype || !allowedTypes.includes(uploadedFile.mimetype)) {
      return NextResponse.json({ error: 'Only PDF and image files are allowed' }, { status: 400 });
    }

    if (uploadedFile.size > maxSize) {
      return NextResponse.json({ error: 'File too large (max 10MB)' }, { status: 400 });
    }

    // 📦 Forward to Express backend
    const formData = new FormData();
    const fallbackExt = uploadedFile.mimetype?.split('/')[1] || 'bin';
    const fallbackName = `uploaded.${fallbackExt}`;
    formData.append(
      'file',
      fs.createReadStream(uploadedFile.filepath),
      uploadedFile.originalFilename ?? fallbackName
    );
    formData.append('firstName', firstName);
    formData.append('lastName', lastName);
    formData.append('dob', dob);
    formData.append('extractionMethod', extractionMethod);

    const response = await axios.post('http://localhost:3000/process', formData, {
      headers: formData.getHeaders(),
    });

    const result = response.data;
    console.log(result);
    // 🔁 Redirect to results page with summary
    return NextResponse.redirect(new URL(`/results?summary=${encodeURIComponent(result.summary)}`, req.url));  } catch (error: any) {
    console.error('Upload error:', error);
    return NextResponse.json({ error: error.message || 'Upload failed' }, { status: 500 });
  }
}