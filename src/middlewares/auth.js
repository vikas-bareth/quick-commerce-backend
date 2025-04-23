const JWT = require("jsonwebtoken");
const User = require("../models/user");
const logger = require("../utils/logger");

const userAuth = async (req, res, next) => {
  try {
    const token = req.cookies.token;

    if (!token) {
      logger.warn("Unauthorized access attempt. No token provided.");
      return res.status(401).json({ message: "Please login to continue." });
    }

    const decoded = JWT.verify(token, process.env.JWT_SECRET);

    const user = await User.findById(decoded?._id);
    if (!user) {
      logger.warn("Token valid but user not found.");
      return res.status(404).json({ message: "User not found." });
    }

    logger.info(
      `🔐 Authenticated request by: ${user.firstName} ${user.lastName}`
    );
    req.user = user;
    return next();
  } catch (error) {
    logger.error("❌ Auth error: ", error.message);
    return res.status(401).json({ error: "Invalid or expired token." });
  }
};

module.exports = { userAuth };
