const ApiError = require("../utils/ApiError");

const roleCheck = (requiredRole) => {
  return (req, res, next) => {
    try {
      if (req.user.role !== requiredRole) {
        throw new ApiError(403, `Forbidden: Requires ${requiredRole} role`);
      }
      next();
    } catch (error) {
      next(error);
    }
  };
};

module.exports = roleCheck;
