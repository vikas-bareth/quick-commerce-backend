const dotenv = require("dotenv");
const NODE_ENV = process.env.NODE_ENV || "development";
dotenv.config({ path: `.env.${NODE_ENV}` });
const PORT = process.env.PORT || 7777;
const APP_URL = process.env.APP_URL;
const express = require("express");
const connectDB = require("./src/config/database");
const morgan = require("morgan");
const app = express();
const cookieParser = require("cookie-parser");
const errorHandler = require("./src/middlewares/errorHandler");
const listEndpoints = require("express-list-endpoints");
const cors = require("cors");

//Middleware
app.use(
  cors({
    origin: "*",
    credentials: true,
  })
);
app.use(express.json());
app.use(cookieParser());
app.use(
  morgan(":method :url :status :res[content-length] - :response-time ms", {
    stream: {
      write: (message) => logger.info(message.trim()),
    },
  })
);

const authRouter = require("./src/routes/auth.route");
const logger = require("./src/utils/logger");

app.get("/", (req, res) => {
  return res
    .status(200)
    .json({ message: "Welcome to quick-commerce backend application!" });
});

app.use("/auth", authRouter);
app.use(errorHandler);

connectDB().then(() => {
  console.log("Database connection successfully.....");
  app.listen(PORT, () => {
    const endpoints = listEndpoints(app);
    logger.info("📚 Available API Routes:");
    endpoints.forEach((ep) => {
      ep.methods.forEach((method) => {
        logger.info(`[${method}] ${ep.path}`);
      });
    });
    logger.info(`🚀 Server listening on port ${PORT}`);
    logger.info(`🌐 Visit:${APP_URL}`);
  });
});
