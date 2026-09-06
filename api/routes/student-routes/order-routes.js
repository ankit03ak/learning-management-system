const router = require("express").Router();
const { authenticate } = require("../../middleware/auth-middleware");
const { authorizeRoles } = require("../../middleware/authorization");
const { createRateLimiter } = require("../../middleware/rate-limit");
const {
  createOrder,
  capturePaymentAndFinalizeOrder,
} = require("../../controllers/student-controllers/order-controller");
const paymentRateLimit = createRateLimiter({
  windowMs: 60 * 1000,
  max: 10,
  message: "Too many payment requests, please try again later",
});

router.post(
  "/create",
  paymentRateLimit,
  authenticate,
  authorizeRoles("student"),
  createOrder
);
router.post(
  "/capture",
  paymentRateLimit,
  authenticate,
  authorizeRoles("student"),
  capturePaymentAndFinalizeOrder
);

module.exports = router;
