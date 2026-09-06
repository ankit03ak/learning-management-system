const { verifyAccessToken } = require("../helpers/jwt");
const User = require("../modals/user");
const mongoose = require("mongoose");

const authenticate = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    if (
      typeof authHeader !== "string" ||
      !/^Bearer\s+\S+$/.test(authHeader)
    ) {
      return res
        .status(401)
        .json({ success: false, message: "Authorization token is required" });
    }

    const token = authHeader.slice("Bearer ".length).trim();
    const payload = verifyAccessToken(token);
    const userId = payload._id || payload.sub;
    if (!userId || !mongoose.isValidObjectId(userId)) {
      return res.status(401).json({ success: false, message: "Invalid token" });
    }
    const user = await User.findById(userId).select("_id userName userEmail role");
    if (!user) {
      return res.status(401).json({ success: false, message: "User no longer exists" });
    }
    req.user = user;

    return next();
  } catch (error) {
    if (error.name === "TokenExpiredError") {
      return res.status(401).json({
        success: false,
        message: "Token expired, please log in again",
      });
    } else if (error.name === "JsonWebTokenError" || error.name === "NotBeforeError") {
      return res.status(401).json({ success: false, message: "Invalid token" });
    } else {
      return res.status(503).json({
        success: false,
        message: "Authentication service is not configured",
      });
    }
  }
};

module.exports = { authenticate };
