import { Schema, model } from "mongoose";

const examSchema = new Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true
    },
    classId: {
      type: Schema.Types.ObjectId,
      ref: "Class",
      required: true
    },
    academicYear: {
      type: String,
      required: true,
      trim: true
    },
    date: {
      type: Date,
      required: true
    }
  },
  { timestamps: true }
);

// Prevent duplicate exam for same class & year
examSchema.index(
  { name: 1, classId: 1, academicYear: 1 },
  { unique: true }
);

const Exam = model("Exam", examSchema);
export default Exam;
