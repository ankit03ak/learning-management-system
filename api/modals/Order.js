const mongoose = require("mongoose");

const OrderSchema = new mongoose.Schema(
  {
    userId: {
      type: String,
      required: true,
      trim: true,
      validate: { validator: mongoose.isValidObjectId, message: "Invalid user ID" },
    },
    userName: { type: String, required: true, trim: true, maxlength: 100 },
    userEmail: { type: String, required: true, trim: true, maxlength: 320 },
    orderStatus: {
      type: String,
      enum: ["pending", "confirmed", "cancelled"],
      default: "pending",
    },
    paymentMethod: { type: String, enum: ["paypal"], default: "paypal" },
    paymentStatus: {
      type: String,
      enum: ["pending", "paid", "failed"],
      default: "pending",
    },
    fulfillmentStatus: {
      type: String,
      enum: ["pending", "complete"],
      default: "pending",
    },
    orderDate: { type: Date, default: Date.now },
    paymentId: { type: String, trim: true },
    payerId: { type: String, trim: true },
    approvalUrl: { type: String, trim: true, maxlength: 2048 },
    instructorId: {
      type: String,
      required: true,
      trim: true,
      validate: { validator: mongoose.isValidObjectId, message: "Invalid instructor ID" },
    },
    instructorName: { type: String, required: true, trim: true, maxlength: 100 },
    courseImage: { type: String, trim: true, maxlength: 2048 },
    courseTitle: { type: String, required: true, trim: true, maxlength: 200 },
    courseId: {
      type: String,
      required: true,
      trim: true,
      validate: { validator: mongoose.isValidObjectId, message: "Invalid course ID" },
    },
    coursePricing: { type: Number, required: true, min: 0, max: 1000000 },
  },
  { timestamps: true }
);

OrderSchema.index({ userId: 1, courseId: 1 }, { unique: true });
OrderSchema.index({ userId: 1, paymentStatus: 1 });

module.exports = mongoose.model("Order", OrderSchema);
