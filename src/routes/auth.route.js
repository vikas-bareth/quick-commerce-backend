const express = require("express");
const router = express.Router();
const authController = require("../controllers/auth.controller");
const userAuth = require("../middlewares/auth");

// Public routes
router.post("/register", authController.signup);
router.post("/login", authController.login);

// Protected routes
router.get("/me", userAuth, authController.getMe);
router.post("/logout", userAuth, authController.logout);

module.exports = router;
