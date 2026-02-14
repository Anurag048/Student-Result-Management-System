import { Schema, model } from "mongoose";

const subjectSchema = new Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
      unique: true
    }
  },
  { timestamps: true }
);

const subjectModel = model("Subject", subjectSchema);
export default subjectModel;
