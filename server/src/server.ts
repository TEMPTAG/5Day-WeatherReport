import dotenv from "dotenv";
import express from "express";
dotenv.config(); // Load environment variables from .env file

// Import the routes from the routes folder
import routes from "./routes/index.js";

// Initialize the express application
const app = express();

// Set the port, defaulting to 3001 if not provided in the .env file
const PORT = process.env.PORT || 3001;

// Serve static files from the client dist folder (for the frontend)
// This makes the built frontend accessible through the express server
app.use(express.static("../client/dist"));

// Middleware to parse URL-encoded form data (used for forms with extended URL-encoded data)
app.use(express.urlencoded({ extended: true }));

// Middleware to parse incoming JSON data
app.use(express.json());

// Middleware to connect the imported routes to the express app
app.use(routes);

// Start the server and listen on the specified port
app.listen(PORT, () => console.log(`Listening on PORT: ${PORT}`));
