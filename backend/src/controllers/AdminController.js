import bcrypt from "bcryptjs";
import userModel from "../models/user.js";
import Student from "../models/student.js";
import Class from "../models/class.js";
import Subject from "../models/subject.js";
import ClassSubject from "../models/classSubject.js";
import Exam from "../models/exam.js";

const ensureAdmin = (req, res) => {
  if (!req.user || req.user.role !== "admin") {
    res.status(403).json({
      success: false,
      message: "Only admin can perform this action"
    });
    return false;
  }
  return true;
};

const createTeacher = async (req, res) => {
  try {
    if (!ensureAdmin(req, res)) return;

    const { username, email, password } = req.body;
    if (!username || !email || !password) {
      return res.status(400).json({
        success: false,
        message: "username, email and password are required"
      });
    }

    const existingUser = await userModel.findOne({ email });
    if (existingUser) {
      return res.status(409).json({
        success: false,
        message: "User with this email already exists"
      });
    }

    const hashedPassword = await bcrypt.hash(password, 12);
    const teacher = await userModel.create({
      username,
      email,
      password: hashedPassword,
      role: "instructor"
    });

    return res.status(201).json({
      success: true,
      message: "Teacher created successfully",
      userId: teacher._id
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Failed to create teacher"
    });
  }
};

const listTeachers = async (_req, res) => {
  try {
    const teachers = await userModel
      .find({ role: "instructor" })
      .select("_id username email role")
      .sort({ username: 1 });
    return res.status(200).json({ success: true, teachers });
  } catch (error) {
    return res.status(500).json({ success: false, message: "Failed to load teachers" });
  }
};

const createStudent = async (req, res) => {
  try {
    if (!ensureAdmin(req, res)) return;

    const { username, email, password, enrollmentNumber, classId } = req.body;

    if (
      !username ||
      !email ||
      !password ||
      !enrollmentNumber ||
      !classId
    ) {
      return res.status(400).json({
        success: false,
        message:
          "username, email, password, enrollmentNumber and classId are required"
      });
    }

    const existingUser = await userModel.findOne({ email });
    if (existingUser) {
      return res.status(409).json({
        success: false,
        message: "User with this email already exists"
      });
    }

    const existingStudent = await Student.findOne({ enrollmentNumber });
    if (existingStudent) {
      return res.status(409).json({
        success: false,
        message: "Enrollment number already exists"
      });
    }

    const existingClass = await Class.findById(classId);
    if (!existingClass) {
      return res.status(404).json({
        success: false,
        message: "Class not found"
      });
    }

    const hashedPassword = await bcrypt.hash(password, 12);
    const studentUser = await userModel.create({
      username,
      email,
      password: hashedPassword,
      role: "student"
    });

    const student = await Student.create({
      userId: studentUser._id,
      enrollmentNumber,
      classId
    });

    return res.status(201).json({
      success: true,
      message: "Student created successfully",
      userId: studentUser._id,
      studentId: student._id
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Failed to create student"
    });
  }
};

const listStudents = async (_req, res) => {
  try {
    const students = await Student.find()
      .populate("userId", "username email role")
      .populate("classId", "name section")
      .sort({ enrollmentNumber: 1 });
    return res.status(200).json({ success: true, students });
  } catch (error) {
    return res.status(500).json({ success: false, message: "Failed to load students" });
  }
};

const updateStudent = async (req, res) => {
  try {
    if (!ensureAdmin(req, res)) return;

    const { studentId } = req.params;
    const { username, email, password, enrollmentNumber, classId } = req.body;

    const student = await Student.findById(studentId);
    if (!student) {
      return res.status(404).json({
        success: false,
        message: "Student not found"
      });
    }

    const user = await userModel.findById(student.userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "Student user account not found"
      });
    }

    if (email) {
      const normalizedEmail = String(email).trim().toLowerCase();
      const existingUser = await userModel.findOne({
        email: normalizedEmail,
        _id: { $ne: user._id }
      });
      if (existingUser) {
        return res.status(409).json({
          success: false,
          message: "User with this email already exists"
        });
      }
      user.email = normalizedEmail;
    }

    if (username) {
      user.username = String(username).trim();
    }

    if (password) {
      user.password = await bcrypt.hash(password, 12);
    }

    if (enrollmentNumber) {
      const normalizedEnrollment = String(enrollmentNumber).trim();
      const existingStudent = await Student.findOne({
        enrollmentNumber: normalizedEnrollment,
        _id: { $ne: student._id }
      });
      if (existingStudent) {
        return res.status(409).json({
          success: false,
          message: "Enrollment number already exists"
        });
      }
      student.enrollmentNumber = normalizedEnrollment;
    }

    if (classId) {
      const classData = await Class.findById(classId);
      if (!classData) {
        return res.status(404).json({
          success: false,
          message: "Class not found"
        });
      }
      student.classId = classData._id;
    }

    await Promise.all([user.save(), student.save()]);

    return res.status(200).json({
      success: true,
      message: "Student updated successfully"
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Failed to update student"
    });
  }
};

const deleteStudent = async (req, res) => {
  try {
    if (!ensureAdmin(req, res)) return;

    const { studentId } = req.params;
    const student = await Student.findById(studentId);

    if (!student) {
      return res.status(404).json({
        success: false,
        message: "Student not found"
      });
    }

    const userId = student.userId;
    await Student.findByIdAndDelete(studentId);
    if (userId) {
      await userModel.findByIdAndDelete(userId);
    }

    return res.status(200).json({
      success: true,
      message: "Student removed successfully"
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Failed to remove student"
    });
  }
};

const shiftStudentClass = async (req, res) => {
  try {
    if (!ensureAdmin(req, res)) return;

    const { studentId } = req.params;
    const { classId } = req.body;

    if (!classId) {
      return res.status(400).json({
        success: false,
        message: "classId is required"
      });
    }

    const [student, classData] = await Promise.all([
      Student.findById(studentId),
      Class.findById(classId)
    ]);

    if (!student) {
      return res.status(404).json({
        success: false,
        message: "Student not found"
      });
    }

    if (!classData) {
      return res.status(404).json({
        success: false,
        message: "Class not found"
      });
    }

    student.classId = classData._id;
    await student.save();

    return res.status(200).json({
      success: true,
      message: "Student shifted successfully"
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Failed to shift student"
    });
  }
};

const createClass = async (req, res) => {
  try {
    if (!ensureAdmin(req, res)) return;

    const { name, section, classInchargeId } = req.body;
    if (!name || !section) {
      return res.status(400).json({
        success: false,
        message: "name and section are required"
      });
    }

    const normalizedName = String(name).trim();
    const normalizedSection = String(section).trim().toUpperCase();

    const existingClass = await Class.findOne({
      name: normalizedName,
      section: normalizedSection
    });
    if (existingClass) {
      return res.status(409).json({
        success: false,
        message: "Class already exists"
      });
    }

    let selectedInchargeId = null;
    if (classInchargeId) {
      const incharge = await userModel.findById(classInchargeId).select("_id role");
      if (!incharge || incharge.role !== "instructor") {
        return res.status(400).json({
          success: false,
          message: "Invalid class incharge"
        });
      }
      selectedInchargeId = incharge._id;
    }

    const newClass = await Class.create({
      name: normalizedName,
      section: normalizedSection,
      classInchargeId: selectedInchargeId
    });
    return res.status(201).json({
      success: true,
      message: "Class created successfully",
      classId: newClass._id
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Failed to create class"
    });
  }
};

const listClasses = async (_req, res) => {
  try {
    const classes = await Class.find()
      .populate("classInchargeId", "username email")
      .sort({ name: 1, section: 1 });
    return res.status(200).json({ success: true, classes });
  } catch (error) {
    return res.status(500).json({ success: false, message: "Failed to load classes" });
  }
};

const updateClassIncharge = async (req, res) => {
  try {
    if (!ensureAdmin(req, res)) return;

    const { classId } = req.params;
    const { classInchargeId } = req.body;

    if (!classId) {
      return res.status(400).json({
        success: false,
        message: "classId is required"
      });
    }

    if (!classInchargeId) {
      return res.status(400).json({
        success: false,
        message: "classInchargeId is required"
      });
    }

    const [classData, incharge] = await Promise.all([
      Class.findById(classId),
      userModel.findById(classInchargeId).select("_id role")
    ]);

    if (!classData) {
      return res.status(404).json({
        success: false,
        message: "Class not found"
      });
    }

    if (!incharge || incharge.role !== "instructor") {
      return res.status(400).json({
        success: false,
        message: "Invalid class incharge"
      });
    }

    classData.classInchargeId = incharge._id;
    await classData.save();

    return res.status(200).json({
      success: true,
      message: "Class incharge assigned successfully"
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Failed to update class incharge"
    });
  }
};

const createSubject = async (req, res) => {
  try {
    if (!ensureAdmin(req, res)) return;

    const { name } = req.body;
    if (!name) {
      return res.status(400).json({
        success: false,
        message: "name is required"
      });
    }

    const existingSubject = await Subject.findOne({ name });
    if (existingSubject) {
      return res.status(409).json({
        success: false,
        message: "Subject already exists",
        subjectId: existingSubject._id
      });
    }

    const subject = await Subject.create({ name });
    return res.status(201).json({
      success: true,
      message: "Subject created successfully",
      subjectId: subject._id
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Failed to create subject"
    });
  }
};

const listSubjects = async (_req, res) => {
  try {
    const subjects = await Subject.find().sort({ name: 1 });
    return res.status(200).json({ success: true, subjects });
  } catch (error) {
    return res.status(500).json({ success: false, message: "Failed to load subjects" });
  }
};

const createClassSubject = async (req, res) => {
  try {
    if (!ensureAdmin(req, res)) return;

    const { subjectId, classId, teacherId, maxMarks } = req.body;
    if (!subjectId || !classId || !teacherId || maxMarks === undefined) {
      return res.status(400).json({
        success: false,
        message: "subjectId, classId, teacherId and maxMarks are required"
      });
    }

    const [subject, classData, teacher] = await Promise.all([
      Subject.findById(subjectId),
      Class.findById(classId),
      userModel.findById(teacherId)
    ]);

    if (!subject) {
      return res.status(404).json({ success: false, message: "Subject not found" });
    }
    if (!classData) {
      return res.status(404).json({ success: false, message: "Class not found" });
    }
    if (!teacher || teacher.role !== "instructor") {
      return res.status(400).json({
        success: false,
        message: "Invalid teacherId"
      });
    }

    const existing = await ClassSubject.findOne({ subjectId, classId });
    if (existing) {
      return res.status(409).json({
        success: false,
        message: "Class subject already exists"
      });
    }

    const classSubject = await ClassSubject.create({
      subjectId,
      classId,
      teacherId,
      maxMarks
    });

    return res.status(201).json({
      success: true,
      message: "Class subject created successfully",
      classSubjectId: classSubject._id
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Failed to create class subject"
    });
  }
};

const updateClassSubject = async (req, res) => {
  try {
    if (!ensureAdmin(req, res)) return;

    const { classSubjectId } = req.params;
    const { teacherId, maxMarks } = req.body;

    if (teacherId === undefined && maxMarks === undefined) {
      return res.status(400).json({
        success: false,
        message: "Provide at least teacherId or maxMarks"
      });
    }

    const classSubject = await ClassSubject.findById(classSubjectId);
    if (!classSubject) {
      return res.status(404).json({
        success: false,
        message: "Class subject not found"
      });
    }

    if (teacherId !== undefined) {
      const teacher = await userModel.findById(teacherId).select("_id role");
      if (!teacher || teacher.role !== "instructor") {
        return res.status(400).json({
          success: false,
          message: "Invalid teacherId"
        });
      }
      classSubject.teacherId = teacher._id;
    }

    if (maxMarks !== undefined) {
      const parsedMaxMarks = Number(maxMarks);
      if (Number.isNaN(parsedMaxMarks) || parsedMaxMarks < 0 || parsedMaxMarks > 100) {
        return res.status(400).json({
          success: false,
          message: "maxMarks must be between 0 and 100"
        });
      }
      classSubject.maxMarks = parsedMaxMarks;
    }

    await classSubject.save();

    return res.status(200).json({
      success: true,
      message: "Class subject updated successfully"
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Failed to update class subject"
    });
  }
};

const listClassSubjects = async (req, res) => {
  try {
    const { classId, teacherId } = req.query;
    const filter = {};
    if (classId) filter.classId = classId;
    if (teacherId) filter.teacherId = teacherId;

    const classSubjects = await ClassSubject.find(filter)
      .populate("subjectId", "name")
      .populate("classId", "name section")
      .populate("teacherId", "username email");

    return res.status(200).json({ success: true, classSubjects });
  } catch (error) {
    return res.status(500).json({ success: false, message: "Failed to load class subjects" });
  }
};

const createExam = async (req, res) => {
  try {
    if (!ensureAdmin(req, res)) return;

    const { name, classId, academicYear, date } = req.body;
    if (!name || !classId || !academicYear || !date) {
      return res.status(400).json({
        success: false,
        message: "name, classId, academicYear and date are required"
      });
    }

    const classData = await Class.findById(classId);
    if (!classData) {
      return res.status(404).json({ success: false, message: "Class not found" });
    }

    const existingExam = await Exam.findOne({ name, classId, academicYear });
    if (existingExam) {
      return res.status(409).json({
        success: false,
        message: "Exam already exists for this class and academic year"
      });
    }

    const exam = await Exam.create({ name, classId, academicYear, date });
    return res.status(201).json({
      success: true,
      message: "Exam created successfully",
      examId: exam._id
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Failed to create exam"
    });
  }
};

const listExams = async (req, res) => {
  try {
    const { classId } = req.query;
    const filter = {};
    if (classId) filter.classId = classId;

    const exams = await Exam.find(filter).populate("classId", "name section");
    return res.status(200).json({ success: true, exams });
  } catch (error) {
    return res.status(500).json({ success: false, message: "Failed to load exams" });
  }
};

export default {
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
};
