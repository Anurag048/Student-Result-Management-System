import express from "express";
import TeacherController from "../controllers/TeacherController.js";
import verifyToken from "../middleware/AuthMiddleware.js";
import authorizeRoles from "../middleware/roleMiddleware.js";

const router = express.Router();

const { addResult, listMyClassSubjects, listStudentsByClass, listExamsByClass } =
  TeacherController;

router.get(
  "/class-subjects",
  verifyToken,
  authorizeRoles("instructor"),
  listMyClassSubjects
);
router.get(
  "/students",
  verifyToken,
  authorizeRoles("instructor"),
  listStudentsByClass
);
router.get(
  "/exams",
  verifyToken,
  authorizeRoles("instructor"),
  listExamsByClass
);
router.post("/results", verifyToken, authorizeRoles("instructor"), addResult);

export default router;
