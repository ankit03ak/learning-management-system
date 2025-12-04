const {
  registerUser,
  loginUser,
} = require("../../controllers/auth-controllers/index");
  
const { authenticate } = require("../../middleware/auth-middleware");

const router = require("express").Router();

router.post("/register", registerUser);
router.post("/login", loginUser);
router.get("/check-auth", authenticate, (req, res) => {
  const user = req.user;
  console.log("User authenticated!!!");
  return res
    .status(200)
    .json({ success: true, message: "User authenticated!!!", user });
});

module.exports = router;
