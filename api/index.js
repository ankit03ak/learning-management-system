require("dotenv").config();
const express = require("express");
const cors = require("cors");
const crypto = require("crypto");
const mongoose = require("mongoose");
const connectDB = require("./connect");
const { getJwtSecret } = require("./helpers/jwt");
const { createRateLimiter } = require("./middleware/rate-limit");
const { errorHandler, notFoundHandler } = require("./middleware/error-middleware");
const authRoutes = require("./routes/auth-routes/index");
const mediaRoutes = require("./routes/instructor-routes/media-routes/index");
const instructorCourseRoutes = require("./routes/instructor-routes/course-routes");
const studentViewCourseRoutes = require("./routes/student-routes/course-routes");
const studentViewOrderRoutes = require("./routes/student-routes/order-routes");
const studentCoursesRoutes = require("./routes/student-routes/student-courses-routes");
const studentCourseProgressRoutes = require("./routes/student-routes/course-progress-routes");

const app = express();
const PORT = process.env.PORT || 5000;

const allowedOrigins = new Set(
  [process.env.CLIENT_URL, "http://localhost:5173", "http://127.0.0.1:5173"].filter(
    Boolean
  )
);

const corsOptions = {
  origin(origin, callback) {
    if (!origin || allowedOrigins.has(origin)) return callback(null, true);
    return callback(new Error("Origin is not allowed by CORS"));
  },
  methods: ["GET", "POST", "DELETE", "PUT"],
  allowedHeaders: ["Content-Type", "Authorization"],
  optionsSuccessStatus: 204,
};

app.disable("x-powered-by");
app.set("trust proxy", 1);
app.use((req, res, next) => {
  req.id = req.headers["x-request-id"] || crypto.randomUUID();
  res.set({
    "X-Request-Id": req.id,
    "X-Content-Type-Options": "nosniff",
    "X-Frame-Options": "DENY",
    "Referrer-Policy": "no-referrer",
    "Permissions-Policy": "camera=(), microphone=(), geolocation=()",
  });
  req.setTimeout(Number(process.env.REQUEST_TIMEOUT_MS) || 30000);
  next();
});
app.use(cors(corsOptions));
app.use(express.json({ limit: process.env.JSON_BODY_LIMIT || "1mb" }));
app.use(express.urlencoded({ extended: false, limit: "1mb" }));
app.use(createRateLimiter({
  windowMs: 60 * 1000,
  max: Number(process.env.API_RATE_LIMIT) || 120,
  message: "Too many requests, please try again later",
}));

app.get("/health", (req, res) => {
  const healthy = mongoose.connection.readyState === 1;
  return res.status(healthy ? 200 : 503).json({
    success: healthy,
    status: healthy ? "healthy" : "unavailable",
  });
});

app.use("/auth", authRoutes);
app.use("/media", mediaRoutes);
app.use("/instructor/course", instructorCourseRoutes);
app.use("/student/course", studentViewCourseRoutes);
app.use("/student/order", studentViewOrderRoutes);
app.use("/student/courses-bought", studentCoursesRoutes);
app.use("/student/course-progress", studentCourseProgressRoutes);

app.use(notFoundHandler);
app.use(errorHandler);

const startServer = async () => {
  getJwtSecret();
  await connectDB();
  return app.listen(PORT, () => {
    console.log(`Server is running at port ${PORT}`);
  });
};

if (require.main === module) {
  startServer().catch((error) => {
    console.error("Unable to start API:", error.message);
    process.exitCode = 1;
  });
}

module.exports = { app, startServer };
