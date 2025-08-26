# OCR-Project

A Full-Stack proof-of-concept for robust document processing, combining standard OCR/PDF parsing with AI-powered extraction. This repository was created to fulfill the “Project & Assessment” stage of a Full-Stack Developer role, demonstrating end-to-end file upload, text extraction, AI integration, and dynamic results rendering.

---

## Table of Contents

- [Project Overview](#project-overview)  
- [Assessment Outline](#assessment-outline)  
- [Features](#features)  
- [Tech Stack](#tech-stack)  
- [Additional Packages](#additional-packages)  
- [Architecture & Workflow](#architecture--workflow)  
- [Getting Started](#getting-started)  
  - [Prerequisites](#prerequisites)  
  - [Installation](#installation)  
  - [Environment Variables](#environment-variables)  
  - [Running Locally](#running-locally)  
- [Resources](#resources)  
- [Challenges Faced](#challenges-faced)  
- [License](#license)  

---

## Project Overview

This project lets users upload a PDF or image, choose between:

- **Standard Extraction** using Tesseract.js or pdf-parse  
- **AI Extraction** using the Google Generative AI SDK (Gemini)  

It then calculates the uploader’s age from the provided date of birth, constructs their full name, and displays both the raw parser output and (optionally) the enriched AI interpretation side-by-side.

---

## Assessment Outline

1. **Next.js + Tailwind CSS**  
2. **Express.js API** for file upload & processing  
3. **Standard Extraction** with Tesseract.js or pdf-parse/pdf-extractor  
4. **AI Extraction** via any AI API of choice  
5. **Age Calculation** & **Full Name** construction  
6. **Dual Results Page** showing both extraction modes  
7. **Input Validation** & graceful error handling  
8. **Clean, commented code** following modern JavaScript best practices  
9. *(Optional)* Dockerize the application  
10. Deploy to GitHub with this detailed README

---

## Features

- Drag-and-drop or file-picker upload of PDF/image  
- Choice between parser-only mode and AI-enhanced mode  
- Robust server-side validation (file type, file size, required fields)  
- Seamless forwarding from Next.js API route to Express endpoint  
- Inline base64 streaming for AI model ingestion  
- Adjustable AI prompt containing user’s name, age, and context  
- Dynamic Results page built with Next.js App Router  
- Server-side redirect (303) to avoid accidental POST replays  
- Fully responsive UI styled with Tailwind CSS  

---

## Tech Stack

### Frontend

- **Next.js (App Router)**  
- **Tailwind CSS**  
- React hooks, forms, and client-side navigation  

### Backend

- **Express.js** — central `/process` endpoint  
- Node.js streams & file-system helpers  

---

## Additional Packages

- **@headlessui/react** & **@heroicons/react** — accessible UI components & icons  
- **formidable** — robust multipart/form-data parser in Next.js API  
- **axios** & **form-data** — forwarding uploads to Express  
- **multer** — memory storage for Express file handling  
- **cors** — cross-origin resource sharing  
- **pdf-parse** — fast PDF text extraction  
- **tesseract.js** — JavaScript OCR for images  
- **@google/generative-ai** — Gemini AI SDK for multimodal extraction  

---

## Architecture & Workflow

1. **User** fills out form (first name, last name, DOB, extraction mode) and uploads file  
2. **Next.js API Route**  
   - Parses form with formidable  
   - Validates inputs & file metadata  
   - Forwards data via Axios to Express `/process`  
   - Issues a 303 redirect to Next.js Results page with a URI-encoded JSON payload  
3. **Express `/process`**  
   - Receives file + metadata via FormData  
   - If “AI-method”: streams base64 payload into Gemini model, retrieves AI summary  
   - Otherwise: runs pdf-parse or Tesseract OCR  
   - Calculates age from DOB, builds full name  
   - Returns unified JSON containing frontend fields, age, fullName, `parserText`, and optional `aiText`  
4. **Next.js Results Page**  
   - Reads `payload` from `searchParams` (awaited in App Router)  
   - Decodes & parses JSON  
   - Renders personal info, age, parser output, and AI output in organized sections  

---

## Getting Started

### Prerequisites

- Node.js v18+  
- npm or Yarn  
- A Google account with Generative Language API enabled and a billing plan attached (for AI mode)  

### Installation

```bash
git clone https://github.com/mbzuze/ocr-project.git
cd ocr-project/ocr-project-build
npm install
```

### Environment Variables

Create a `.env.local` in the project root:

```bash
GOOGLE_GEMINI_API=ya29.your_api_key_here
```

### Running Locally

```bash
# Start Next.js + Express via the unified server script
node server/server.ts

# Open http://localhost:3000 in your browser
```

---

## Resources

- Next.js App Router docs  
  https://nextjs.org/docs/app/getting-started/installation  
- TailwindCSS UI Blocks & Call-to-Action patterns  
  https://tailwindcss.com/plus/ui-blocks/documentation
- Tesseract.js OCR guide  
  https://github.com/naptha/tesseract.js  
- pdf-parse usage  
  https://www.npmjs.com/package/pdf-parse  
- Google Generative AI SDK  
  https://ai.google.dev/generative-ai/docs/  

---

## Challenges Faced

> **Billing oversight with Gemini**  
> I spent several hours debugging my AI integration—only to discover my Google account lacked an active billing plan for the Generative Language API. Once I attached a billing method, requests began to succeed immediately.

---

## License

This project is licensed under the MIT License. See the [LICENSE](LICENSE) file for details.
