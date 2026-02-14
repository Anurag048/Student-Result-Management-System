import Student from "../models/student.js";
import Result from "../models/result.js";

const ensureStudent = (req, res) => {
  if (!req.user || req.user.role !== "student") {
    res.status(403).json({
      success: false,
      message: "Only student can perform this action"
    });
    return false;
  }
  return true;
};

const getMyResults = async (req, res) => {
  try {
    if (!ensureStudent(req, res)) return;

    const student = await Student.findOne({ userId: req.user.userId })
      .populate("userId", "username email")
      .populate({
        path: "classId",
        select: "name section classInchargeId",
        populate: { path: "classInchargeId", select: "username email" }
      });
    if (!student) {
      return res.status(404).json({
        success: false,
        message: "Student profile not found"
      });
    }

    const results = await Result.find({ studentId: student._id })
      .populate({
        path: "classSubjectId",
        populate: [
          { path: "subjectId", select: "name" },
          { path: "classId", select: "name section" }
        ]
      })
      .populate({ path: "examId", select: "name academicYear date" });

    const resultSheetsMap = new Map();

    for (const item of results) {
      const examId = item?.examId?._id?.toString();
      if (!examId) continue;

      if (!resultSheetsMap.has(examId)) {
        resultSheetsMap.set(examId, {
          exam: item.examId,
          subjects: [],
          totals: {
            obtainedMarks: 0,
            maxMarks: 0,
            percentage: 0
          }
        });
      }

      const maxMarks = item?.classSubjectId?.maxMarks || 0;
      const marksObtained = item?.marksObtained || 0;
      const examSheet = resultSheetsMap.get(examId);

      examSheet.subjects.push({
        resultId: item._id,
        subject: item?.classSubjectId?.subjectId?.name || "-",
        marksObtained,
        maxMarks,
        grade: item?.grade || "-"
      });
      examSheet.totals.obtainedMarks += marksObtained;
      examSheet.totals.maxMarks += maxMarks;
    }

    const resultSheets = Array.from(resultSheetsMap.values()).map((sheet) => ({
      ...sheet,
      totals: {
        ...sheet.totals,
        percentage:
          sheet.totals.maxMarks > 0
            ? Number(((sheet.totals.obtainedMarks / sheet.totals.maxMarks) * 100).toFixed(2))
            : 0
      }
    }));

    return res.status(200).json({
      success: true,
      student: {
        id: student._id,
        username: student?.userId?.username || "",
        email: student?.userId?.email || "",
        enrollmentNumber: student.enrollmentNumber,
        class: student.classId
      },
      resultSheets,
      results
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Failed to load results"
    });
  }
};

export default {
  getMyResults
};
