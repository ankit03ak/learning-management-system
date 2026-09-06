const errorHandler = (err, req, res, next) => {
  if (res.headersSent) return next(err);

  const requestId = req.id || "unknown";
  console.error(`[${requestId}] ${err && err.stack ? err.stack : err}`);

  if (err && err.name === "MulterError") {
    const message =
      err.code === "LIMIT_FILE_SIZE"
        ? "Uploaded file exceeds the size limit"
        : "Invalid file upload";
    return res.status(400).json({ success: false, message, requestId });
  }

  if (err && (err.type === "entity.too.large" || err.status === 413)) {
    return res
      .status(413)
      .json({ success: false, message: "Request body is too large", requestId });
  }

  if (err && err instanceof SyntaxError && err.status === 400 && "body" in err) {
    return res
      .status(400)
      .json({ success: false, message: "Malformed JSON body", requestId });
  }

  if (err && err.message === "Origin is not allowed by CORS") {
    return res
      .status(403)
      .json({ success: false, message: "Origin is not allowed", requestId });
  }

  if (err && err.name === "ValidationError") {
    return res
      .status(400)
      .json({ success: false, message: "Invalid request data", requestId });
  }

  if (err && err.name === "CastError") {
    return res
      .status(400)
      .json({ success: false, message: "Invalid identifier", requestId });
  }

  if (err && err.code === 11000) {
    return res
      .status(409)
      .json({ success: false, message: "Resource already exists", requestId });
  }

  const status = Number.isInteger(err && err.statusCode) ? err.statusCode : 500;
  return res.status(status).json({
    success: false,
    message: status >= 500 ? "Internal server error" : err.message,
    requestId,
  });
};

const notFoundHandler = (req, res) =>
  res.status(404).json({
    success: false,
    message: "Route not found",
    requestId: req.id || "unknown",
  });

module.exports = { errorHandler, notFoundHandler };
