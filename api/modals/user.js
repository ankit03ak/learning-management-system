const mongoose = require("mongoose");

const UserSchema = new mongoose.Schema(
  {
    userName: {
      type: String,
      unique: true,
      required: true,
      trim: true,
      lowercase: true,
    },
    userEmail: {
      type: String,
      unique: true,
      required: true,
      trim: true,
      lowercase: true,
      match: [/^\S+@\S+\.\S+$/, "Invalid email format"],
    },
    userPassword: {
      type: String,
      required: true,
      minlength: 6,
      select: false,
    },
    role:{
      type: String,
      enum: ["student", "instructor"],
      required: true,
    },
  },
  { timestamps: true }
);

UserSchema.index({ userEmail: 1 }, { unique: true });
UserSchema.index({ userName: 1 }, { unique: true });

module.exports = mongoose.model("User", UserSchema);
