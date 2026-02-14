import express from "express";
import AdminController from "../controllers/AdminController.js";
import verifyToken from "../middleware/AuthMiddleware.js";
import authorizeRoles from "../middleware/roleMiddleware.js";

const router = express.Router();

const {
  createTeacher,
  listTeachers,
  createStudent,
  listStudents,
  updateStudent,
  deleteStudent,
  shiftStudentClass,
  createClass,
  listClasses,
  updateClassIncharge,
  createSubject,
  listSubjects,
  createClassSubject,
  updateClassSubject,
  listClassSubjects,
  createExam,
  listExams
} = AdminController;

// Admin-only routes
router.post("/create-teachers", verifyToken, authorizeRoles("admin"), createTeacher);
router.get("/teachers", verifyToken, authorizeRoles("admin"), listTeachers);
router.post("/create-students", verifyToken, authorizeRoles("admin"), createStudent);
router.get("/students", verifyToken, authorizeRoles("admin"), listStudents);
router.put("/students/:studentId", verifyToken, authorizeRoles("admin"), updateStudent);
router.delete("/students/:studentId", verifyToken, authorizeRoles("admin"), deleteStudent);
router.put("/students/:studentId/shift-class", verifyToken, authorizeRoles("admin"), shiftStudentClass);
router.post("/classes", verifyToken, authorizeRoles("admin"), createClass);
router.get("/classes", verifyToken, authorizeRoles("admin"), listClasses);
router.put("/classes/:classId/incharge", verifyToken, authorizeRoles("admin"), updateClassIncharge);
router.post("/subjects", verifyToken, authorizeRoles("admin"), createSubject);
router.get("/subjects", verifyToken, authorizeRoles("admin"), listSubjects);
router.post("/class-subjects", verifyToken, authorizeRoles("admin"), createClassSubject);
router.put("/class-subjects/:classSubjectId", verifyToken, authorizeRoles("admin"), updateClassSubject);
router.get("/class-subjects", verifyToken, authorizeRoles("admin"), listClassSubjects);
router.post("/exams", verifyToken, authorizeRoles("admin"), createExam);
router.get("/exams", verifyToken, authorizeRoles("admin"), listExams);

export default router;
