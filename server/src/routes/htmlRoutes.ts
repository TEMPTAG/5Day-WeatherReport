import path from "node:path";
import { fileURLToPath } from "node:url";
import { Router } from "express";

// Get the current file's URL
const __filename = fileURLToPath(import.meta.url);

// Get the directory name of the current file
const __dirname = path.dirname(__filename);

// Initialize a new router
const router = Router();

// Define route to serve the index.html file
router.get("*", (_req, res) => {
  // Use path.resolve to ensure an absolute path to the index.html file
  res.sendFile(path.resolve(__dirname, "../../client/dist/index.html"));
});

export default router;
