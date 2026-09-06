const jwt = require("jsonwebtoken");

const JWT_ALGORITHM = "HS256";
const JWT_ISSUER = process.env.JWT_ISSUER || "lms-api";
const JWT_AUDIENCE = process.env.JWT_AUDIENCE || "lms-client";
let warnedAboutShortSecret = false;

const getJwtSecret = () => {
  const secret = process.env.JWT_SECRET;

  if (typeof secret !== "string" || !secret.trim()) {
    throw new Error("JWT_SECRET must be configured");
  }

  if (secret.length < 32 && !warnedAboutShortSecret) {
    console.warn(
      "Warning: JWT_SECRET is shorter than 32 characters. Use a longer secret before production."
    );
    warnedAboutShortSecret = true;
  }

  return secret;
};

const getJwtOptions = () => ({
  algorithm: JWT_ALGORITHM,
  issuer: JWT_ISSUER,
  audience: JWT_AUDIENCE,
  expiresIn: process.env.JWT_EXPIRES_IN || "1h",
});

const signAccessToken = (claims) =>
  jwt.sign(claims, getJwtSecret(), getJwtOptions());

const verifyAccessToken = (token) =>
  jwt.verify(token, getJwtSecret(), {
    algorithms: [JWT_ALGORITHM],
    issuer: JWT_ISSUER,
    audience: JWT_AUDIENCE,
  });

module.exports = {
  getJwtSecret,
  getJwtOptions,
  signAccessToken,
  verifyAccessToken,
};
