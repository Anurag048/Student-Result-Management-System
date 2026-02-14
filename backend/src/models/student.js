import { Schema, model } from "mongoose";

const studentSchema = new Schema(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      unique: true
    },
    enrollmentNumber: {
      type: String,
      required: true,
      unique: true,
      trim: true
    },
    classId: {
      type: Schema.Types.ObjectId,
      ref: "Class",
      required: true
    }
  },
  { timestamps: true }
);

const Student = model("Student", studentSchema);
export default Student;
