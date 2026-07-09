// Import express
import express from "express";

// Import controller functions
import { register, login, googleLogin, getMe, updateProfile, uploadProfileImage, changePassword, logout } from "../controllers/authController.js";
import protect from "../middleware/authMiddleware.js";
import { changePasswordLimiter } from "../middleware/rateLimiter.js";
import upload from "../middleware/upload.js";

// Create router
const router = express.Router();

// ===============================
// @route   POST /api/auth/register
// @desc    Register admin (optional)
// ===============================
// Pass controller functions directly. Do not call register() here.
router.post("/register", register);

// ===============================
// @route   POST /api/auth/login
// @desc    Login admin
// ===============================
router.post("/login", login);

// ===============================
// @route   POST /api/auth/google
// @desc    Google OAuth login
// ===============================
router.post("/google", googleLogin);

// ===============================
// @route   GET /api/auth/me
// @desc    Get current user profile
// ===============================
router.get("/me", protect, getMe);

// ===============================
// @route   PUT /api/auth/profile
// @desc    Update profile (name, role)
// ===============================
router.put("/profile", protect, updateProfile);

// ===============================
// @route   POST /api/auth/profile/image
// @desc    Upload profile image to Cloudinary
// ===============================
router.post("/profile/image", protect, upload.single('image'), uploadProfileImage);

// ===============================
// @route   PUT /api/auth/change-password
// @desc    Change admin password securely
// ===============================
router.put("/change-password", protect, changePasswordLimiter, changePassword);

// ===============================
// @route   POST /api/auth/logout
// @desc    Logout (clears HttpOnly cookie)
// ===============================
router.post("/logout", logout);

// Export router
export default router;