import mongoose from "mongoose";
import dotenv from "dotenv";
import bcrypt from "bcryptjs";
import userModel from "../models/user.js";

dotenv.config();

const getArgValue = (flag) => {
  const index = process.argv.indexOf(flag);
  if (index === -1) return null;
  return process.argv[index + 1] ?? null;
};

const email =
  getArgValue("--email") || process.env.ADMIN_EMAIL || "";
const password =
  getArgValue("--password") || process.env.ADMIN_PASSWORD || "";
const username =
  getArgValue("--username") || process.env.ADMIN_USERNAME || "Admin";

if (!email || !password) {
  console.error(
    "Missing admin credentials. Provide --email and --password or set ADMIN_EMAIL and ADMIN_PASSWORD."
  );
  process.exit(1);
}

const MONGO_URI = process.env.MONGO_URI;
if (!MONGO_URI) {
  console.error("Missing MONGO_URI in environment.");
  process.exit(1);
}

const run = async () => {
  try {
    await mongoose.connect(MONGO_URI);

    const existing = await userModel.findOne({ email });
    if (existing) {
      console.log("Admin already exists with this email.");
      return;
    }

    const hashedPassword = await bcrypt.hash(password, 12);
    await userModel.create({
      username,
      email,
      password: hashedPassword,
      role: "admin"
    });

    console.log("Admin created successfully.");
  } catch (error) {
    console.error("Failed to seed admin:", error.message);
    process.exitCode = 1;
  } finally {
    await mongoose.disconnect();
  }
};

run();
