const paypal = require("paypal-rest-sdk");
const mode =
  process.env.PAYPAL_MODE ||
  (process.env.NODE_ENV === "production" ? "live" : "sandbox");

if (!["sandbox", "live"].includes(mode)) {
  throw new Error("PAYPAL_MODE must be either sandbox or live");
}

paypal.configure({
  mode,
  client_id: process.env.PAYPAL_CLIENT_ID,
  client_secret: process.env.PAYPAL_SECRET_KEY,
});

const isPaypalConfigured = () =>
  typeof process.env.PAYPAL_CLIENT_ID === "string" &&
  process.env.PAYPAL_CLIENT_ID.length > 0 &&
  typeof process.env.PAYPAL_SECRET_KEY === "string" &&
  process.env.PAYPAL_SECRET_KEY.length > 0;

const getPaypalCurrency = () => {
  const currency = (process.env.PAYPAL_CURRENCY || "USD").trim().toUpperCase();
  if (!/^[A-Z]{3}$/.test(currency)) {
    throw new Error("PAYPAL_CURRENCY must be a three-letter currency code");
  }
  return currency;
};

module.exports = { paypal, isPaypalConfigured, getPaypalCurrency };
