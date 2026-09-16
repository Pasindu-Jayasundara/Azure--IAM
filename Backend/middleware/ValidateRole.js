// Role Authorization Middleware
export function checkRole(requiredRole) {
  console.log(`Checking for role: ${requiredRole}`);
  return (req, res, next) => {
    // Entra ID populates assigned App Roles inside the 'roles' array claim
    const roles = req.authClaims && req.authClaims.roles;

    if (roles && roles.includes(requiredRole)) {
      console.log(`Role check passed for role: ${requiredRole}`);
      return next();
    }

    return res.status(403).json({ error: 'Forbidden: Missing required role' });
  };
}