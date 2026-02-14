import express from "express";
import AuthController from "../controllers/AuthController.js";
import verifyToken from "../middleware/AuthMiddleware.js";
import authorizeRoles from "../middleware/roleMiddleware.js";

const router = express.Router();

const { signup, login } = AuthController;

// Public routes
router.post("/signup", verifyToken, authorizeRoles("admin"), signup);
router.post("/login", login);

export default router;
