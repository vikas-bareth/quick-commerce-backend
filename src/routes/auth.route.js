const express = require("express");
const authController = require("../controllers/auth.controller");
const { userAuth } = require("../middlewares/auth");

const router = express.Router();

router.post("/signup", authController.signup);

router.post("/login", authController.login);

router.get("/me", userAuth, authController.getMe);

router.get("/logout", authController.logout);

module.exports = router;
