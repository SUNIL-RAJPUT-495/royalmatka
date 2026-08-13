import bcrypt from "bcryptjs";
import User from "../models/User.js";

export const createUser = async (req, res) => {
  try {
    const { name, mobile, email, password } = req.body;

    if (!name || !mobile || !password) {
      return res.status(400).json({
        success: false,
        message: "Name, Mobile number and Password are required"
      });
    }

    const existingUser = await User.findOne({ mobile });
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: "Mobile number is already registered"
      });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = await User.create({
      name,
      mobile,
      email: email || "",
      password: hashedPassword
    });

    return res.status(201).json({
      success: true,
      message: "User created successfully! 🎉",
      user: {
        id: newUser._id,
        name: newUser.name,
        mobile: newUser.mobile,
        email: newUser.email,
        balance: newUser.balance
      }
    });

  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message
    });
  }
};
