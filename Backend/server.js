import cors from "cors";
import express from "express";
import dotenv from "dotenv";
import { validateEntraToken } from "./middleware/ValidateToken";
import { checkRole } from "./middleware/ValidateRole";

dotenv.config();

const app = express();
const port = process.env.PORT || 3000;

app.use(cors());

app.get("/", (req, res) => {
  res.send("Hello, World!");
});

// Example Protected Route
app.get('/api/secure-data', validateEntraToken, checkRole('Admin'), (req, res) => {
  res.json({ 
    message: "Authorized!", 
    user: req.authClaims.name 
  });
});

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});