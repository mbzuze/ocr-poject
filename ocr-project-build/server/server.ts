// -------------------------
// Import necessary modules
// -------------------------
import express from "express";
import Tesseract from "tesseract.js";
import next from "next";
import multer from "multer";
import cors from 'cors';
import fs from "fs";
import { createRequire } from 'module';
import { fileURLToPath } from "url";
import path from "path";
import { GoogleGenerativeAI } from '@google/generative-ai';

const require = createRequire(import.meta.url);
const pdfParse = require('pdf-parse');

// -------------------------------------------
// Determine environment and Next.js setup
// -------------------------------------------
const dev = process.env.NODE_ENV !== "production";

// Emulate __filename and __dirname in ESM
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Initialize Next.js app, pointing to frontend directory
const app = next({
  dev,
  dir: path.resolve(__dirname, "../"),
});
const handle = app.getRequestHandler();

// -----------------------------
// Create and configure Express
// -----------------------------
const server = express();

// Enable CORS for all routes
server.use(cors());

// Ensure upload directory exists
const uploadPath = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadPath)) {
  fs.mkdirSync(uploadPath);
}

// --------------------------------------------
// Multer memory storage config for file uploads
// --------------------------------------------
const storage = multer.memoryStorage();      // Keep files in RAM
const upload = multer({ storage });

// ------------------------------------
// POST /process — file processing route
// ------------------------------------
server.post('/process', upload.single('file'), async (req, res) => {
  // Extract uploaded file and form fields
  const file = req.file;
  const { firstName, lastName, dob, extractionMethod } = req.body;

  // Validate required fields
  if (!firstName || !lastName || !dob) {
    return res.status(400).json({
      error: "Missing required fields: First Name, Last Name, or Date of Birth"
    });
  }

  // Parse and validate DOB, then calculate age
  const dobTemp = new Date(dob);
  if (isNaN(dobTemp.getTime())) {
    throw new Error("Invalid date format for Date of Birth");
  }

  // Calculate age
  const today = new Date();
  let age = today.getFullYear() - dobTemp.getFullYear();
  const monthDiff = today.getMonth() - dobTemp.getMonth();
  const dayDiff = today.getDate() - dobTemp.getDate();
  if (monthDiff < 0 || (monthDiff === 0 && dayDiff < 0)) {
    age--;
  }

  // Concatenate full name
  const fullName = `${firstName.trim()} ${lastName.trim()}`;

  // Ensure file exists in memory
  if (!file || !file.buffer) {
    return res.status(400).json({
      error: "No file uploaded or file is empty"
    });
  }

  // Prepare placeholders for AI and parser outputs
  let aiText: string | null = null;
  let parserText: string = "";

  try {
    // AI-based extraction path
    if (extractionMethod === "ai-method") {

        // Build prompt for Gemini
        const prompt = `You are an intelligent document parser. This document is for ${fullName}, DOB ${dob}. Extract the full text to the best of your abilities.`;

        // Validate API Key
        const apiKey = process.env.GOOGLE_GEMINI_API;
        if (!apiKey) {
          throw new Error("❌ Missing GOOGLE_GEMINI_API in environment");
        }

        // Instantiate Gemini client
        const genAI = new GoogleGenerativeAI(apiKey);
        const model = genAI.getGenerativeModel({ model: "gemini-1.5-pro" });

        // Call Gemini Vision and pass base64 data
        const result = await model.generateContent([
          { text: prompt },
          {
            inlineData: {
              mimeType: file.mimetype,
              data: file.buffer.toString("base64"),
            },
          },
        ]);

        // Capture Gemini AI response text
        aiText = result.response.text();
        
      }

    // Fallback: PDF text extraction
    if (file.mimetype === "application/pdf") {
      const data = await pdfParse(file.buffer);
      parserText = data.text;

    // Fallback: Image OCR
    } else if (file.mimetype.startsWith("image/")) {
      const result = await Tesseract.recognize(file.buffer, "eng", {
        logger: m => console.log(m.status, m.progress),
      });
      parserText = result.data.text;
    }
    
     // If neither AI nor parser ran, invalid method
    if (!aiText && !parserText) {
      return res.status(400).json({ error: "Unsupported extraction method or file type" });
    }

    // Respond with combined data:
    // - age and fullName
    // - AI text (if selected)
    // - parser text 
    return res.status(200).json({
      fullName,
      age,
      extractionMethod,
      aiText,
      parserText: parserText.trim(),
    });

  } catch (err: any) {
    console.error('Processing error:', err.message);
    return res.status(500).json({ error: 'Server error' });
  }
});

// -------------------------------------
// Fallback route for Next.js pages
// -------------------------------------
server.use((req, res) => {
  return handle(req, res);
});

// ---------------------
// Start Express server
// ---------------------
app.prepare().then(() => {
  server.listen(3000, () => {
    console.log("✅ Server running at http://localhost:3000");
  });
});
