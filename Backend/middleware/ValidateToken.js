import jwt from "jsonwebtoken";
import jwksRsa from "jwks-rsa";
import dotenv from "dotenv";
dotenv.config();

const tenantId = process.env.TENANT_ID;
const clientId = process.env.CLIENT_ID;

const jwksClient = jwksRsa({
  cache: true,
  rateLimit: true,
  jwksRequestsPerMinute: 5,
  jwksUri: `https://login.microsoftonline.com/${tenantId}/discovery/v2.0/keys`,
});

function getKey(header, callback) {
  jwksClient.getSigningKey(header.kid, (err, key) => {
    if (err) return callback(err);
    callback(null, key.getPublicKey());
  });
}

export function validateEntraToken(req, res, next) {
  console.log("Validating Entra ID token...");

  const authHeader = req.headers.authorization;
  if (!authHeader?.startsWith("Bearer ")) {
    return res.status(401).json({ error: "Unauthorized: Missing token" });
  }

  const token = authHeader.split(" ")[1];

  // Always log what arrived (remove when stable)
  const preview = jwt.decode(token);
  console.log("Incoming token claims:", {
    aud: preview?.aud,
    iss: preview?.iss,
    scp: preview?.scp,
    roles: preview?.roles,
    ver: preview?.ver,
  });

  jwt.verify(
    token,
    getKey,
    {
      audience: [
        clientId,                // 9ef56e2f-efac-4517-8589-5baaf36fe9f2
        `api://${clientId}`,     // api://9ef56e2f-efac-4517-8589-5baaf36fe9f2
      ],
      issuer: [
        `https://login.microsoftonline.com/${tenantId}/v2.0`,
        `https://sts.windows.net/${tenantId}/`, // trailing slash matters
      ],
      algorithms: ["RS256"],
    },
    (err, decodedToken) => {
      if (err) {
        console.error("Token validation failed:", err.message);
        return res.status(401).json({
          error: "Unauthorized: Invalid token",
          details: err.message,
        });
      }

      // Block Microsoft Graph tokens if the SPA sends the wrong one
      if (
        decodedToken.aud === "00000003-0000-0000-c000-000000000000" ||
        decodedToken.aud === "https://graph.microsoft.com"
      ) {
        return res.status(401).json({
          error:
            "Unauthorized: Microsoft Graph token received. Request scope api://.../access_as_user instead.",
        });
      }

      console.log("Token validated successfully:", {
        aud: decodedToken.aud,
        iss: decodedToken.iss,
        roles: decodedToken.roles,
        scp: decodedToken.scp,
        name: decodedToken.name,
      });

      req.authClaims = decodedToken;
      next();
    }
  );
}