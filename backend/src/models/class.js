import { Schema, model } from "mongoose";

const classSchema = new Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true
    },
    section: {
      type: String,
      required: true,
      enum: ["A", "B", "C", "D"],
      trim: true
    },
    classInchargeId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      default: null
    }
  },
  { timestamps: true }
);

// Prevent duplicate class/section
classSchema.index({ name: 1, section: 1 }, { unique: true });

const Class = model("Class", classSchema);
export default Class;
