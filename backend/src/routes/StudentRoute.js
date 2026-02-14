import express from "express";
import StudentController from "../controllers/StudentController.js";
import verifyToken from "../middleware/AuthMiddleware.js";
import authorizeRoles from "../middleware/roleMiddleware.js";

const router = express.Router();

const { getMyResults } = StudentController;

router.get("/results", verifyToken, authorizeRoles("student"), getMyResults);

export default router;
