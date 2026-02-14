import Result from "../models/result.js";
import ClassSubject from "../models/classSubject.js";
import Student from "../models/student.js";
import Exam from "../models/exam.js";

const ensureTeacher = (req, res) => {
  if (!req.user || req.user.role !== "instructor") {
    res.status(403).json({
      success: false,
      message: "Only instructor can perform this action"
    });
    return false;
  }
  return true;
};

const gradeFromMarks = (marks, maxMarks) => {
  if (!maxMarks || maxMarks <= 0) return "N/A";
  const percentage = (marks / maxMarks) * 100;
  if (percentage >= 90) return "A+";
  if (percentage >= 80) return "A";
  if (percentage >= 70) return "B";
  if (percentage >= 60) return "C";
  if (percentage >= 50) return "D";
  return "F";
};

const addResult = async (req, res) => {
  try {
    if (!ensureTeacher(req, res)) return;

    const { studentId, classSubjectId, examId, marksObtained } = req.body;
    if (!studentId || !classSubjectId || !examId || marksObtained === undefined) {
      return res.status(400).json({
        success: false,
        message: "studentId, classSubjectId, examId and marksObtained are required"
      });
    }

    const [classSubject, student, exam] = await Promise.all([
      ClassSubject.findById(classSubjectId),
      Student.findById(studentId),
      Exam.findById(examId)
    ]);

    if (!classSubject) {
      return res.status(404).json({ success: false, message: "Class subject not found" });
    }
    if (!student) {
      return res.status(404).json({ success: false, message: "Student not found" });
    }
    if (!exam) {
      return res.status(404).json({ success: false, message: "Exam not found" });
    }

    if (classSubject.teacherId.toString() !== req.user.userId) {
      return res.status(403).json({
        success: false,
        message: "You are not assigned to this subject"
      });
    }

    if (student.classId.toString() !== classSubject.classId.toString()) {
      return res.status(400).json({
        success: false,
        message: "Student does not belong to this class"
      });
    }

    if (exam.classId.toString() !== classSubject.classId.toString()) {
      return res.status(400).json({
        success: false,
        message: "Exam does not belong to this class"
      });
    }

    if (marksObtained < 0 || marksObtained > classSubject.maxMarks) {
      return res.status(400).json({
        success: false,
        message: "marksObtained exceeds max marks"
      });
    }

    const grade = gradeFromMarks(marksObtained, classSubject.maxMarks);

    const result = await Result.create({
      studentId,
      classSubjectId,
      examId,
      marksObtained,
      grade
    });

    return res.status(201).json({
      success: true,
      message: "Result added successfully",
      resultId: result._id
    });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(409).json({
        success: false,
        message: "Result already exists for this student, subject and exam"
      });
    }
    return res.status(500).json({
      success: false,
      message: "Failed to add result"
    });
  }
};

const listMyClassSubjects = async (req, res) => {
  try {
    if (!ensureTeacher(req, res)) return;
    const classSubjects = await ClassSubject.find({ teacherId: req.user.userId })
      .populate("subjectId", "name")
      .populate("classId", "name section");
    return res.status(200).json({ success: true, classSubjects });
  } catch (error) {
    return res.status(500).json({ success: false, message: "Failed to load class subjects" });
  }
};

const listStudentsByClass = async (req, res) => {
  try {
    if (!ensureTeacher(req, res)) return;
    const { classId } = req.query;
    if (!classId) {
      return res.status(400).json({ success: false, message: "classId is required" });
    }

    const teachesClass = await ClassSubject.exists({
      teacherId: req.user.userId,
      classId
    });

    if (!teachesClass) {
      return res.status(403).json({
        success: false,
        message: "You are not assigned to this class"
      });
    }

    const students = await Student.find({ classId })
      .populate("userId", "username email")
      .sort({ enrollmentNumber: 1 });

    return res.status(200).json({ success: true, students });
  } catch (error) {
    return res.status(500).json({ success: false, message: "Failed to load students" });
  }
};

const listExamsByClass = async (req, res) => {
  try {
    if (!ensureTeacher(req, res)) return;
    const { classId } = req.query;
    if (!classId) {
      return res.status(400).json({ success: false, message: "classId is required" });
    }

    const teachesClass = await ClassSubject.exists({
      teacherId: req.user.userId,
      classId
    });

    if (!teachesClass) {
      return res.status(403).json({
        success: false,
        message: "You are not assigned to this class"
      });
    }

    const exams = await Exam.find({ classId }).select("name academicYear date");
    return res.status(200).json({ success: true, exams });
  } catch (error) {
    return res.status(500).json({ success: false, message: "Failed to load exams" });
  }
};

export default {
  addResult,
  listMyClassSubjects,
  listStudentsByClass,
  listExamsByClass
};
