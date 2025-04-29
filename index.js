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
const logger = require("./src/utils/logger");
const authRouter = require("./src/routes/auth.route");
const orderRouter = require("./src/routes/order.route");
const http = require("http");
const { Server } = require("socket.io");
const User = require("./src/models/user");
const JWT = require("jsonwebtoken");

const httpServer = http.createServer(app);

const io = new Server(httpServer, {
  cors: {
    origin: process.env.FRONTEND_URL,
    credentials: true,
  },
});

io.use(async (socket, next) => {
  try {
    const token =
      socket.handshake.auth.token ||
      socket.handshake.headers.cookie
        ?.split("; ")
        .find((c) => c.startsWith("token="))
        ?.split("=")[1];

    if (!token) {
      logger.error("Socket connection rejected: No token provided");
      return next(new Error("Not authenticated - No token found"));
    }

    const decoded = JWT.verify(token, process.env.JWT_SECRET);

    const foundUser = await User.findById(decoded.id).select("-password");
    if (!foundUser) {
      logger.error("Socket connection rejected: User not found");
      return next(new Error("User not found"));
    }

    socket.user = foundUser;
    logger.info(`Socket authenticated for user: ${foundUser._id}`);
    next();
  } catch (error) {
    if (error.name === "JsonWebTokenError") {
      logger.error("Socket connection rejected: Invalid token");
      return next(new Error("Invalid token"));
    }
    if (error.name === "TokenExpiredError") {
      logger.error("Socket connection rejected: Token expired");
      return next(new Error("Token expired"));
    }
    logger.error(`Socket authentication error: ${error.message}`);
    next(new Error("Authentication failed"));
  }
});

io.on("connection", (socket) => {
  logger.info(`New Client connected: ${socket.id} | User: ${socket.user?._id}`);

  socket.on("joinOrderRoom", (orderId) => {
    socket.join(orderId);
    logger.info(`Socket ${socket.id} joined room ${orderId}`);
  });

  socket.on("leaveOrderRoom", (orderId) => {
    socket.leave(orderId);
    logger.info(`Socket ${socket.id} left room ${orderId}`);
  });

  socket.on("disconnect", () => {
    logger.info(`Client disconnected: ${socket.id}`);
  });
});

app.set("io", io);

//Middleware
const corsConfig = {
  credentials: true,
  origin: process.env.FRONTEND_URL,
};
app.use(cors(corsConfig));
app.use(express.json());
app.use(cookieParser());
app.use(
  morgan(":method :url :status :res[content-length] - :response-time ms", {
    stream: {
      write: (message) => logger.info(message.trim()),
    },
  })
);

app.get("/", (req, res) => {
  return res
    .status(200)
    .json({ message: "Welcome to quick-commerce backend application!" });
});

app.use("/auth", authRouter);
app.use("/orders", orderRouter);
app.use(errorHandler);

connectDB().then(() => {
  console.log("Database connection successfully.....");
  httpServer.listen(PORT, () => {
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

process.on("SIGTERM", () => {
  logger.info("SIGTERM received. Shutting down gracefully...");
  server.close(() => {
    logger.info("Server closed");
    process.exit(0);
  });
});
