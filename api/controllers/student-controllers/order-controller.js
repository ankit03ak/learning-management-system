const mongoose = require("mongoose");
const {
  paypal,
  isPaypalConfigured,
  getPaypalCurrency,
} = require("../../helpers/paypal");
const Order = require("../../modals/Order");
const Course = require("../../modals/course");
const StudentCourses = require("../../modals/student-courses");
const User = require("../../modals/user");

const paypalCall = (method, ...args) =>
  new Promise((resolve, reject) => {
    paypal.payment[method](...args, (error, result) => {
      if (error) return reject(error);
      return resolve(result);
    });
  });

const getReturnUrl = (name, fallbackPath) => {
  const configured = process.env[name];
  if (configured) return configured;
  const clientUrl = process.env.CLIENT_URL || "http://localhost:5173";
  return `${clientUrl.replace(/\/$/, "")}/${fallbackPath}`;
};

const fulfillOrder = async (order) => {
  const coursePurchase = {
    courseId: String(order.courseId),
    title: order.courseTitle,
    instructorId: String(order.instructorId),
    instructorName: order.instructorName,
    dateOfPurchase: order.orderDate,
    courseImage: order.courseImage,
  };

  await StudentCourses.findOneAndUpdate(
    { userId: String(order.userId) },
    {
      $setOnInsert: { userId: String(order.userId) },
      $addToSet: { courses: coursePurchase },
    },
    { upsert: true, new: true, runValidators: true }
  );

  await Course.findOneAndUpdate(
    {
      _id: order.courseId,
      "students.studentId": { $ne: String(order.userId) },
    },
    {
      $addToSet: {
        students: {
          studentId: String(order.userId),
          studentName: order.userName,
          studentEmail: order.userEmail,
          paidAmount: order.coursePricing,
        },
      },
    },
    { runValidators: true }
  );

  await Order.updateOne(
    { _id: order._id, paymentStatus: "paid" },
    { $set: { fulfillmentStatus: "complete" } }
  );
};

const createOrder = async (req, res) => {
  try {
    if (!isPaypalConfigured()) {
      return res.status(503).json({
        success: false,
        message: "Payment provider is not configured",
      });
    }

    const { courseId } = req.body || {};
    if (!mongoose.isValidObjectId(courseId)) {
      return res.status(400).json({ success: false, message: "Invalid course ID" });
    }

    const user = await User.findById(req.user._id).select("userName userEmail role");
    const course = await Course.findById(courseId).select("-students");
    if (!user || user.role !== "student") {
      return res.status(401).json({ success: false, message: "User is not available" });
    }
    if (!course) {
      return res.status(404).json({ success: false, message: "Course not found" });
    }
    if (course.isPublished !== true) {
      return res.status(409).json({
        success: false,
        message: "This course is not available for purchase yet",
      });
    }

    const coursePricing = Number(course.pricing);
    if (!Number.isFinite(coursePricing) || coursePricing < 0) {
      return res.status(400).json({ success: false, message: "Course has invalid pricing" });
    }
    const paypalCurrency = getPaypalCurrency();

    const existingOrder = await Order.findOne({
      userId: String(user._id),
      courseId: String(course._id),
    });
    if (existingOrder && existingOrder.paymentStatus === "paid") {
      return res.status(409).json({
        success: false,
        message: "Course has already been purchased",
      });
    }

    if (
      existingOrder &&
      existingOrder.paymentStatus === "pending" &&
      existingOrder.paymentId &&
      existingOrder.approvalUrl
    ) {
      try {
        const currentPayment = await paypalCall("get", existingOrder.paymentId);
        if (currentPayment?.state === "created") {
          return res.status(200).json({
            success: true,
            message: "Existing payment order resumed",
            result: {
              approveUrl: existingOrder.approvalUrl,
              orderId: existingOrder._id,
            },
          });
        }
      } catch (error) {
        console.warn(
          `Existing PayPal payment ${existingOrder.paymentId} is unavailable; creating a replacement`
        );
      }
    }

    const paymentInfo = await paypalCall("create", {
      intent: "sale",
      payer: { payment_method: "paypal" },
      redirect_urls: {
        return_url: getReturnUrl("PAYPAL_RETURN_URL", "payment-return"),
        cancel_url: getReturnUrl("PAYPAL_CANCEL_URL", "cancel-payment"),
      },
      transactions: [
        {
          item_list: {
            items: [
              {
                name: course.title,
                sku: String(course._id),
                price: coursePricing.toFixed(2),
                currency: paypalCurrency,
                quantity: 1,
              },
            ],
          },
          amount: { currency: paypalCurrency, total: coursePricing.toFixed(2) },
          description: course.title,
        },
      ],
    });
    const approvalLink = paymentInfo.links?.find(
      (link) => link.rel === "approval_url"
    );
    if (!paymentInfo.id || !approvalLink || !approvalLink.href) {
      return res.status(502).json({
        success: false,
        message: "Payment provider returned an invalid payment",
      });
    }

    let order;
    try {
      const orderData = {
        userId: String(user._id),
        userName: user.userName,
        userEmail: user.userEmail,
        orderStatus: "pending",
        paymentMethod: "paypal",
        paymentStatus: "pending",
        paymentId: paymentInfo.id,
        approvalUrl: approvalLink.href,
        instructorId: String(course.instructorId),
        instructorName: course.instructorName,
        courseImage: course.image,
        courseTitle: course.title,
        courseId: String(course._id),
        coursePricing,
      };

      order = existingOrder
        ? await Order.findOneAndUpdate(
            { _id: existingOrder._id, paymentStatus: "pending" },
            { $set: orderData },
            { new: true, runValidators: true }
          )
        : await Order.create(orderData);

      if (!order) {
        const currentOrder = await Order.findOne({
          userId: String(user._id),
          courseId: String(course._id),
        });

        if (
          currentOrder?.paymentStatus === "pending" &&
          currentOrder.paymentId &&
          currentOrder.approvalUrl
        ) {
          return res.status(200).json({
            success: true,
            message: "Existing payment order resumed",
            result: {
              approveUrl: currentOrder.approvalUrl,
              orderId: currentOrder._id,
            },
          });
        }

        if (currentOrder?.paymentStatus === "paid") {
          return res.status(409).json({
            success: false,
            message: "Course has already been purchased",
          });
        }

        return res.status(409).json({
          success: false,
          message: "Order is already being processed",
        });
      }
    } catch (error) {
      if (error && error.code === 11000) {
        order = await Order.findOne({
          userId: String(user._id),
          courseId: String(course._id),
        });
      } else {
        throw error;
      }
    }

    if (
      !order ||
      order.paymentStatus !== "pending" ||
      !order.paymentId ||
      !order.approvalUrl
    ) {
      return res.status(409).json({
        success: false,
        message: "Order is already being processed",
      });
    }

    return res.status(201).json({
      success: true,
      message: "Payment order created successfully",
      result: { approveUrl: order.approvalUrl, orderId: order._id },
    });
  } catch (error) {
    console.error("Error creating order", error);
    return res.status(502).json({
      success: false,
      message:
        error?.response?.details?.[0]?.issue ||
        error?.response?.message ||
        "Unable to start payment with PayPal",
    });
  }
};

const validatePaymentResponse = (paymentInfo, order, payerId) => {
  const transaction = paymentInfo?.transactions?.[0];
  const amount = transaction?.amount;
  const paidAmount = Number(amount?.total);
  const paypalCurrency = getPaypalCurrency();
  if (
    String(paymentInfo?.id || "") !== String(order.paymentId) ||
    paymentInfo?.state !== "approved" ||
    amount?.currency !== paypalCurrency ||
    !Number.isFinite(paidAmount) ||
    paidAmount.toFixed(2) !== Number(order.coursePricing).toFixed(2)
  ) {
    return false;
  }
  const providerPayerId = paymentInfo?.payer?.payer_info?.payer_id;
  return Boolean(
    providerPayerId &&
      providerPayerId === payerId &&
      String(payerId) === String(providerPayerId)
  );
};

const capturePaymentAndFinalizeOrder = async (req, res) => {
  try {
    if (!isPaypalConfigured()) {
      return res.status(503).json({
        success: false,
        message: "Payment provider is not configured",
      });
    }

    const { paymentId, payerId, orderId } = req.body || {};
    if (
      !mongoose.isValidObjectId(orderId) ||
      typeof paymentId !== "string" ||
      !paymentId.trim() ||
      typeof payerId !== "string" ||
      !payerId.trim()
    ) {
      return res.status(400).json({ success: false, message: "Invalid payment details" });
    }

    let order = await Order.findOne({
      _id: orderId,
      userId: String(req.user._id),
    });
    if (!order) {
      return res.status(404).json({ success: false, message: "Order not found" });
    }

    if (order.paymentStatus === "paid") {
      if (order.fulfillmentStatus !== "complete") await fulfillOrder(order);
      return res.status(200).json({ success: true, message: "Order confirmed", order });
    }
    if (String(order.paymentId) !== String(paymentId)) {
      return res.status(400).json({ success: false, message: "Payment does not match order" });
    }

    let providerPayment;
    try {
      providerPayment = await paypalCall("execute", paymentId, {
        payer_id: payerId,
      });
    } catch (error) {
      const currentOrder = await Order.findById(order._id);
      if (currentOrder?.paymentStatus === "paid") {
        order = currentOrder;
        if (order.fulfillmentStatus !== "complete") await fulfillOrder(order);
        return res.status(200).json({ success: true, message: "Order confirmed", order });
      }
      console.error("PayPal capture error", error);
      return res.status(502).json({
        success: false,
        message: "Payment could not be verified",
      });
    }

    if (!validatePaymentResponse(providerPayment, order, payerId)) {
      return res.status(400).json({
        success: false,
        message: "Payment verification failed",
      });
    }

    order = await Order.findOneAndUpdate(
      {
        _id: order._id,
        userId: String(req.user._id),
        paymentStatus: "pending",
        paymentId,
      },
      {
        $set: {
          paymentStatus: "paid",
          orderStatus: "confirmed",
          payerId,
          fulfillmentStatus: "pending",
        },
      },
      { new: true, runValidators: true }
    );
    if (!order) {
      order = await Order.findById(orderId);
      if (order?.paymentStatus === "paid") {
        if (order.fulfillmentStatus !== "complete") await fulfillOrder(order);
        return res.status(200).json({ success: true, message: "Order confirmed", order });
      }
      return res.status(409).json({ success: false, message: "Order is already being processed" });
    }

    await fulfillOrder(order);
    return res.status(200).json({ success: true, message: "Order confirmed", order });
  } catch (error) {
    console.error("Error capturing payment", error);
    return res.status(500).json({
      success: false,
      message: "Error capturing payment via order controllers",
    });
  }
};

module.exports = { createOrder, capturePaymentAndFinalizeOrder };
