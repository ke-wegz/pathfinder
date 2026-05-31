// Grant access to specific roles
exports.authorize = (...roles) => {
  const normalizedRoles = roles.map(role => String(role).toLowerCase());
  return (req, res, next) => {
    const userRole = String(req.user.role || '').toLowerCase();
    if (!normalizedRoles.includes(userRole)) {
      return res.status(403).json({ 
        success: false, 
        message: `User role ${req.user.role} is not authorized to access this route`
      });
    }
    next();
  };
};
