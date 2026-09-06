const {
  registerUser,
  loginUser,
} = require("../../controllers/auth-controllers/index");
  
const { authenticate } = require("../../middleware/auth-middleware");
const { createRateLimiter } = require("../../middleware/rate-limit");

const router = require("express").Router();
const authRateLimit = createRateLimiter({
  windowMs: 15 * 60 * 1000,
  max: 20,
  message: "Too many authentication attempts, please try again later",
});

router.post("/register", authRateLimit, registerUser);
router.post("/login", authRateLimit, loginUser);
router.get("/check-auth", authenticate, (req, res) => {
  const user = req.user;
  // console.log("User authenticated!!!");
  return res
    .status(200)
    .json({ success: true, message: "User authenticated!!!", user });
});

module.exports = router;
