import { Schema, model } from "mongoose";

const classSubjectSchema = new Schema(
  {
    subjectId: {
      type: Schema.Types.ObjectId,
      ref: "Subject",
      required: true
    },
    classId: {
      type: Schema.Types.ObjectId,
      ref: "Class",
      required: true
    },
    maxMarks: {
      type: Number,
      required: true,
      min: 0,
      max: 100
    },
    teacherId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true
    }
  },
  { timestamps: true }
);

// Prevent duplicate offering for same class/section
classSubjectSchema.index(
  { subjectId: 1, classId: 1 },
  { unique: true }
);

const ClassSubject = model("ClassSubject", classSubjectSchema);
export default ClassSubject;
