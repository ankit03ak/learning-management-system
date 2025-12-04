const mongoose = require("mongoose");

const UserSchema = new mongoose.Schema(
  {
    userName: {
      type: String,
      unique: true,
    },
    userEmail: {
      type: String,
      unique: true,
    },
    userPassword: String,
    role: String,
  },
  { timestamps: true }
);

module.exports = mongoose.model("User", UserSchema);
