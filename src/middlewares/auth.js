const JWT = require("jsonwebtoken");
const User = require("../models/user");
const ApiError = require("../utils/ApiError");

const userAuth = async (req, res, next) => {
  try {
    const token = req.cookies.token;

    if (!token) {
      throw new ApiError(401, "Not authenticated - No token found");
    }

    const decoded = JWT.verify(token, process.env.JWT_SECRET);

    const user = await User.findById(decoded.id).select("-password");
    if (!user) {
      throw new ApiError(404, "User not found");
    }

    req.user = user;
    next();
  } catch (error) {
    if (error.name === "JsonWebTokenError") {
      return next(new ApiError(401, "Invalid token"));
    }
    if (error.name === "TokenExpiredError") {
      return next(new ApiError(401, "Token expired"));
    }
    next(error);
  }
};

module.exports = userAuth;
