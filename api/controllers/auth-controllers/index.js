const User = require("../../modals/user.js");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

const registerUser = async (req, res) => {
  const { userName, userEmail, userPassword, role } = req.body;

  if (!userName || !userEmail || !userPassword || !role) {
    return res.status(400).json({
      success: false,
      message: "userName, userEmail, userPassword and role are required",
      });
    }


  const allowedRoles = ["student", "instructor"];
    if (!allowedRoles.includes(role)) {
      return res.status(400).json({
        success: false,
        message: "Invalid role. Allowed roles are: student, instructor",
      });
    }

  const existingUser = await User.findOne({
    $or: [{ userEmail: userEmail }, { userName: userName }],
  });

  if (existingUser) {
    return res
      .status(400)
      .json({ success: false, message: "User already exists" });
  }

  const hashedPassword = await bcrypt.hash(userPassword, 10);

  const newUser = new User({
    userName,
    userEmail,
    userPassword: hashedPassword,
    role,
  });
  await newUser.save();

  return res
    .status(200)
    .json({ success: true, message: "User registered successfully", newUser });
};

const loginUser = async (req, res) => {
  const { userEmail, userPassword } = req.body;
  const user = await User.findOne({ userEmail });

  if (!user) {
    return res
      .status(400)
      .json({ success: false, message: "Invalid user email or password" });
  }

  const password = user.userPassword;

  const isCorrectPassword = await bcrypt.compare(userPassword, password);

  if (!isCorrectPassword) {
    return res
      .status(400)
      .json({ success: false, message: "Invalid user email or password" });
  }

  const accessToken = jwt.sign(
    {
      _id: user._id,
      userName: user.userName,
      userEmail: user.userEmail,
      role: user.role,
    },
    process.env.JWT_SECRET,
    {
      expiresIn: "24h",
    }
  );

  return res.status(200).json({
    success: true,
    message: "User logged in successfully",
    user,
    accessToken,
  });
};

module.exports = { registerUser, loginUser };
