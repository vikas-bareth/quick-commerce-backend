const JWT = require("jsonwebtoken");
const User = require("../models/user");
const ApiError = require("../utils/ApiError"); // Assuming you have this

const userAuth = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      throw new ApiError(401, "No token provided");
    }

    const token = authHeader.split(" ")[1];

    const decoded = JWT.verify(token, process.env.JWT_SECRET);

    const user = await User.findById(decoded.id).select("-password");
    if (!user) {
      throw new ApiError(404, "User not found");
    }

    req.user = user;
    next();
  } catch (error) {
    next(error);
  }
};

module.exports = userAuth;
