// Import necessary modules
import express from "express";
import Tesseract from "tesseract.js";
import next from "next";
import multer from "multer";
import cors from 'cors';
import fs from "fs";
import { createRequire } from 'module';
const require = createRequire(import.meta.url);
const pdfParse = require('pdf-parse');
// Node.js utility to convert module URL to file path (used to emulate __dirname in ESM)
import { fileURLToPath } from "url";

// Node.js path module for resolving directory paths
import path from "path";

// Determine if the environment in development mode
const dev = process.env.NODE_ENV !== "production";

// Reconstruct __filename and __dirname in ESM context (not available by default)
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Initialize the Next.js frontend application with the correct working directory
const app = next({ dev, dir: path.resolve(__dirname, "../") });

// Next.js request handler to handle routes through Next
const handle = app.getRequestHandler();

// Create an instance of an Express server
const server = express();

server.use(cors());

const uploadPath = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadPath)) fs.mkdirSync(uploadPath);

// Extend multer to ensure only valid file types are accepted and protect against oversized uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, uploadPath),
  filename: (req, file, cb) => cb(null, Date.now() + '-' + file.originalname),
});

const upload = multer({
  storage,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB
  fileFilter: (req, file, cb) => {
    const allowed = ['image/jpeg', 'image/png', 'image/jpg', 'application/pdf'];
    if (allowed.includes(file.mimetype)) cb(null, true);
    else cb(new Error('Invalid file type'));
  },
});


// Custom API route using Express

server.post('/process', upload.single('file'), async (req, res) => {
  const file = req.file;
  const body = req.body;
  // console.log(body);

  if (!file || !fs.existsSync(file.path)) {
    return res.status(400).json({ error: "File not found or invalid" });
  }

  let extractedText = "";

  try {
    if (file.mimetype === "application/pdf") {
      const buffer = fs.readFileSync(file.path);
      const data = await pdfParse(buffer) as { text: string };
      extractedText = data.text;
    } else if (file.mimetype.startsWith("image/")) {
      const result = await Tesseract.recognize(file.path, "eng", {
        logger: m => console.log(m.status, m.progress),
      });
      extractedText = result.data.text;
    } else {
      return res.status(400).json({ error: "Unsupported file type" });
    }
// console.log(extractedText);
    return res.status(200).json({ text: extractedText.trim() });
  } catch (err: any) {
    console.error('Processing error:', err.message);
    return res.status(500).json({ error: 'Server error' });
  }
});

// Fallback route handler to handle requests not matched by the Express server
server.use((req, res) => {
  return handle(req, res);
});

// Prepare the Next.js frontend application
app.prepare().then(() => {
  // start Express server on specified port
  server.listen(3000, () => {
    console.log("✅ Server running at http://localhost:3000");
  });
});