// Role Authorization Middleware
export function checkRole(requiredRole) {
  return (req, res, next) => {
    // Entra ID stores assigned App Roles inside the 'roles' array claim
    const roles = req.authClaims && req.authClaims.roles;

    if (roles && roles.includes(requiredRole)) {
      return next();
    }

    return res.status(403).json({ error: 'Forbidden: Missing required role' });
  };
}