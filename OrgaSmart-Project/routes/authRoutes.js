const express = require("express");
const router = express.Router();
const authController = require("../controllers/authController");
const verifyToken = require("../middleware/authMiddleware"); // إذا عندك حماية JWT

// Public routes
router.post("/register", authController.register);
router.post("/login", authController.login);
router.post("/forgot-password", authController.forgotPassword);
// أضف النقطتين والكلمة token في نهاية المسار
router.post("/reset-password/:token", authController.resetPassword);
// Protected routes
router.get("/profile", verifyToken, authController.getProfile);
router.post("/change-password", verifyToken, authController.changePassword);

module.exports = router;
