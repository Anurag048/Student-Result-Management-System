import { Schema, model } from "mongoose";

const resultSchema = new Schema(
  {
    studentId: {
      type: Schema.Types.ObjectId,
      ref: "Student",
      required: true
    },
    classSubjectId: {
      type: Schema.Types.ObjectId,
      ref: "ClassSubject",
      required: true
    },
    examId: {
      type: Schema.Types.ObjectId,
      ref: "Exam",
      required: true
    },
    marksObtained: {
      type: Number,
      required: true,
      min: 0
    },
    grade: {
      type: String,
      required: true,
      trim: true
    }
  },
  { timestamps: true }
);

// Prevent duplicate result entry
resultSchema.index(
  { studentId: 1, classSubjectId: 1, examId: 1 },
  { unique: true }
);

const Result = model("Result", resultSchema);
export default Result;
