import jwt from "jsonwebtoken";
import jwksRsa from "jwks-rsa";
import dotenv from "dotenv";
dotenv.config();

// 1. Configure the JWKS client to fetch Microsoft Entra ID's public signing keys
const jwksClient = jwksRsa({
  cache: true,
  rateLimit: true,
  jwksRequestsPerMinute: 5,
  jwksUri: `https://login.microsoftonline.com/${process.env.TENANT_ID}/discovery/v2.0/keys`
});

// Helper function to dynamically retrieve the specific signing key for a token header
function getKey(header, callback) {
  jwksClient.getSigningKey(header.kid, (err, key) => {
    if (err) {
      return callback(err);
    }
    const signingKey = key.getPublicKey();
    callback(null, signingKey);
  });
}

// 2. Middleware to extract and validate the Microsoft Entra ID token
export function validateEntraToken(req, res, next) {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Unauthorized: Missing token' });
  }

  const token = authHeader.split(' ')[1];

  // Verify signature, expiration, issuer, and audience
  jwt.verify(
    token, 
    getKey, 
    {
      audience: process.env.CLIENT_ID,
      issuer: `https://login.microsoftonline.com/${process.env.TENANT_ID}/v2.0`,
      algorithms: ['RS256']
    }, 
    (err, decodedToken) => {
      if (err) {
        return res.status(401).json({ error: 'Unauthorized: Invalid token', details: err.message });
      }

      // Attach decoded Entra claims (like roles, name, oid) to the request object
      req.authClaims = decodedToken;
      next();
    }
  );
}