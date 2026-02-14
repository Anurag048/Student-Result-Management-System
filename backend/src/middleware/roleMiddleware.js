const authorizeRoles = (...allowedRoles) => {
  return (req, res, next) => {
    try {
      // verifyToken must run before this middleware
      if (!req.user || !req.user.role) {
        return res.status(401).json({
          success: false,
          message: "Unauthorized access"
        });
      }

      if (!allowedRoles.includes(req.user.role)) {
        return res.status(403).json({
          success: false,
          message: "You do not have permission to perform this action"
        });
      }

      next();
    } catch (error) {
      return res.status(500).json({
        success: false,
        message: "Authorization failed"
      });
    }
  };
};

export default authorizeRoles;
