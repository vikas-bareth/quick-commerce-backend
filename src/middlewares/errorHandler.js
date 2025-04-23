const logger = require("../utils/logger");

module.exports = (err, req, res, next) => {
  logger.error(`${req.method} ${req.originalUrl} - ${err.message}`);
  console.error("Error:", err);
  const status = err.status || err.statusCode || 500;
  const message = err.message || "Internal server error!";

  return res.status(status).json({
    success: false,
    message,
  });
};
