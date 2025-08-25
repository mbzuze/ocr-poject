// Import necessary modules
import express from "express";
import next from "next";

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

// Custom API route using Express
server.get("/api/testapi", (req, res) => {
  res.json({ message: "Hello, Test API working perfectly here!" });
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