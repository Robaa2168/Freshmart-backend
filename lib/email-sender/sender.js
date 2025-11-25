// freshmart-backend/lib/email-sender/sender.js
require("dotenv").config();
const nodemailer = require("nodemailer");
const rateLimit = require("express-rate-limit");

// Create transporter once (not per request)
const transporter = nodemailer.createTransport({
  host: process.env.HOST,
  port: Number(process.env.EMAIL_PORT || 587),
  secure: Number(process.env.EMAIL_PORT || 587) === 465, // true only for 465
  auth: {
    user: "support@ravelmobile.com",
    pass: "Lahaja2168#",
  },
  // Helps with some privateemail setups
  tls: { rejectUnauthorized: false },
});

// Verify once at startup (does NOT send any HTTP response)
transporter.verify((err) => {
  if (err) console.error("[email] transporter verify failed:", err?.message || err);
  else console.log("[email] transporter ready");
});

/**
 * Send email helper
 * IMPORTANT: does NOT accept `res` and NEVER sends HTTP responses.
 * Controllers should handle success and error responses.
 */
const sendEmail = async (mailOptions = {}) => {
  if (!mailOptions?.to) throw new Error("Missing mailOptions.to");
  const from = mailOptions.from || `"Freshmart Groceries" <${process.env.EMAIL_USER}>`;
  return transporter.sendMail({ ...mailOptions, from });
};

// limit email verification and forget password
const minutes = 5;

const emailVerificationLimit = rateLimit({
  windowMs: minutes * 60 * 1000,
  max: 10,
  standardHeaders: true,
  legacyHeaders: false,
  handler: (req, res) =>
    res.status(429).send({
      success: false,
      message: `You made too many requests. Please try again after ${minutes} minutes.`,
    }),
});

const passwordVerificationLimit = rateLimit({
  windowMs: minutes * 60 * 1000,
  max: 10,
  standardHeaders: true,
  legacyHeaders: false,
  handler: (req, res) =>
    res.status(429).send({
      success: false,
      message: `You made too many requests. Please try again after ${minutes} minutes.`,
    }),
});

const supportMessageLimit = rateLimit({
  windowMs: minutes * 60 * 1000,
  max: 5,
  standardHeaders: true,
  legacyHeaders: false,
  handler: (req, res) =>
    res.status(429).send({
      success: false,
      message: `You made too many requests. Please try again after ${minutes} minutes.`,
    }),
});

module.exports = {
  sendEmail,
  emailVerificationLimit,
  passwordVerificationLimit,
  supportMessageLimit,
};
