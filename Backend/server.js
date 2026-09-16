import cors from "cors";
import express from "express";
import dotenv from "dotenv";
import { validateEntraToken } from "./middleware/ValidateToken.js";
import { checkRole } from "./middleware/ValidateRole.js";

dotenv.config();

const app = express();
const port = process.env.PORT || 3000;

app.use(cors());

app.get("/", (req, res) => {
  res.send("Hello, World!");
});

// Role-protected routes
app.get('/api/admin-data', validateEntraToken, checkRole('ADMIN'), (req, res) => {
  res.json({
    message: "Admin endpoint access granted!",
    endpoint: "/api/admin-data",
    user: req.authClaims.name,
  });
});

app.get('/api/manager-data', validateEntraToken, checkRole('MANAGER'), (req, res) => {
  res.json({
    message: "Manager endpoint access granted!",
    endpoint: "/api/manager-data",
    user: req.authClaims.name,
  });
});

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});