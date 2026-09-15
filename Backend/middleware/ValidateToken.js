import { TokenValidator } from "@azure/msal-node";
import dotenv from "dotenv";
dotenv.config();

// Initialize the official Microsoft Token Validator
const tokenValidator = new TokenValidator({
  auth: {
    clientId: process.env.CLIENT_ID,
    authority: `https://microsoftonline.com/${process.env.TENANT_ID}`
  }
});

// Authentication Middleware
export async function validateEntraToken(req, res, next) {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Unauthorized: Missing token' });
  }

  const rawToken = authHeader.split(' ')[1];

  try {
    // Cryptographically validates signature, expiration, issuer, and audience
    const validatedToken = await tokenValidator.validateAccessToken(rawToken);
    
    // Attach the validated claims (including roles) to the request object
    req.authClaims = validatedToken.claims;
    next();
  } catch (error) {
    return res.status(401).json({ error: 'Unauthorized: Invalid token', details: error.message });
  }
}