const User = require("../../modals/user.js");
const bcrypt = require("bcryptjs");
const { signAccessToken } = require("../../helpers/jwt");

const registerUser = async (req, res) => {
  try {
    let { userName, userEmail, userPassword, role } = req.body || {};

    if (
      typeof userName !== "string" ||
      typeof userEmail !== "string" ||
      typeof userPassword !== "string" ||
      typeof role !== "string"
    ) {
      return res.status(400).json({
        success: false,
        message: "All fields are required",
      });
    }

    userName = userName.trim();
    userEmail = userEmail.trim().toLowerCase();

    const allowedRoles = ["student", "instructor"];
    if (!allowedRoles.includes(role)) {
      return res.status(400).json({
        success: false,
        message: "Invalid role",
      });
    }

    if (userName.length < 2 || userName.length > 64) {
      return res.status(400).json({
        success: false,
        message: "Username must be between 2 and 64 characters",
      });
    }

    if (userPassword.length < 6 || userPassword.length > 128) {
      return res.status(400).json({
        success: false,
        message: "Password must be at least 6 characters long",
      });
    }

    const existingUser = await User.findOne({
      $or: [{ userEmail }, { userName }],
    });

    if (existingUser) {
      return res.status(409).json({
        success: false,
        message: "User already exists",
      });
    }

    const hashedPassword = await bcrypt.hash(userPassword, 10);

    const newUser = await User.create({
      userName,
      userEmail,
      userPassword: hashedPassword,
      role,
    });

    const userResponse = {
      _id: newUser._id,
      userName: newUser.userName,
      userEmail: newUser.userEmail,
      role: newUser.role,
      createdAt: newUser.createdAt,
    };

    // console.log("Request Body: working", req.body);

    const accessToken = signAccessToken({
      _id: newUser._id,
    });

    return res.status(201).json({
      success: true,
      message: "User registered successfully",
      user: userResponse,
      accessToken
    });
  } catch (error) {
    console.error("Register error:", error);
    if (error && error.code === 11000) {
      return res.status(409).json({
        success: false,
        message: "User already exists",
      });
    }
    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};


const loginUser = async (req, res) => {
  try {
    const { userEmail, userPassword } = req.body || {};

    if (
      typeof userEmail !== "string" ||
      typeof userPassword !== "string" ||
      !userEmail.trim() ||
      !userPassword
    ) {
      return res.status(400).json({
        success: false,
        message: "Email and password are required",
      });
    }

    const user = await User.findOne({
      userEmail: userEmail.toLowerCase(),
    }).select("+userPassword");

    if (!user) {
      return res.status(400).json({
        success: false,
        message: "Invalid user email or password",
      });
    }

    const isCorrectPassword = await bcrypt.compare(
      userPassword,
      user.userPassword
    );

    if (!isCorrectPassword) {
      return res.status(400).json({
        success: false,
        message: "Invalid user email or password",
      });
    }

    const accessToken = signAccessToken({
      _id: user._id,
    });

    user.userPassword = undefined;

    return res.status(200).json({
      success: true,
      message: "User logged in successfully",
      user,
      accessToken,
    });
  } catch (error) {
    console.error("Login error:", error);
    return res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};


module.exports = { registerUser, loginUser };
