import userModel from "../models/user.js";
import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";

const signup = async (req, res) => {
  try {
    if (!req.user || req.user.role !== "admin") {
      return res.status(403).json({
        success: false,
        message: "Only admin can create users"
      });
    }

    const { username, email, password } = req.body;
    if (!username || !email || !password) {
      return res.status(400).json({
        success: false,
        message: "username, email and password are required"
      });
    }

    const existingUser = await userModel.findOne({ email });
    if (existingUser) {
      return res.status(409).json({success: false, message: "User already exists"});
    }

    const hashedPassword = await bcrypt.hash(password, 12);

    const newUser = await userModel.create({
      username,
      email,
      password: hashedPassword,
      role: "student"
    });
    return res.status(201).json({
      success: true,
      message: "Student created successfully",
      userId: newUser._id
    });
  } catch (error) {
    return res.status(500).json({success: false, message: "Signup failed"});
  }
};

const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await userModel.findOne({ email }).select("+password");

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found"
      });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: "Invalid credentials"
      });
    }

    const token = jwt.sign(
      {
        userId: user._id,
        role: user.role
      },
      process.env.JWT_SECRET,
      { expiresIn: "1h" }
    );

    return res.status(200).json({
      success: true,
      token,
      role: user.role,
      username: user.username
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Login failed"
    });
  }
};

export default {
  signup,
  login
};
