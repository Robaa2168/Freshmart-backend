// freshmart-backend/controller/customerOrderController.js
require("dotenv").config();
const stripe = require("stripe")(process.env.STRIPE_KEY || "");
const axios = require("axios");
const mongoose = require("mongoose");

const Order = require("../models/Order");
const Deposit = require("../models/deposits");

const { handleProductQuantity } = require("../lib/stock-controller/others");
const { formatAmountForStripe } = require("../lib/stripe/stripe");

const addOrder = async (req, res) => {
  console.log("[addOrder] hit /order/add");
  console.log("[addOrder] req.user (raw):", req.user);
  console.log("[addOrder] req.user typeof:", typeof req.user);
  console.log("[addOrder] req.user keys:", req.user && typeof req.user === "object" ? Object.keys(req.user) : null);

  try {
    const userId = req.user?._id ?? req.user;

    console.log("[addOrder] computed userId:", userId);
    console.log("[addOrder] computed userId typeof:", typeof userId);
    console.log("[addOrder] computed userId keys:", userId && typeof userId === "object" ? Object.keys(userId) : null);

    if (!userId) {
      console.log("[addOrder] Unauthorized: userId missing");
      return res.status(401).json({ message: "Unauthorized" });
    }

    console.log("[addOrder] incoming body keys:", req.body ? Object.keys(req.body) : null);
    console.log("[addOrder] cart info:", {
      hasCart: Array.isArray(req.body?.cart),
      cartLen: Array.isArray(req.body?.cart) ? req.body.cart.length : 0,
      firstCartItem: Array.isArray(req.body?.cart) ? req.body.cart[0] : null,
    });

    const newOrder = new Order({
      ...req.body,
      user: userId,
    });

    console.log("[addOrder] about to save order");
    console.log("[addOrder] newOrder.user:", newOrder.user);

    const order = await newOrder.save();

    console.log("[addOrder] order saved:", { _id: order?._id, user: order?.user, status: order?.status });
    console.log("[addOrder] order.cart length:", Array.isArray(order?.cart) ? order.cart.length : 0);

    console.log("[addOrder] updating stock with handleProductQuantity...");
    await handleProductQuantity(order.cart);
    console.log("[addOrder] stock update done");

    console.log("[addOrder] returning 201");
    return res.status(201).json(order);
  } catch (err) {
    console.log("[addOrder] ERROR name:", err?.name);
    console.log("[addOrder] ERROR message:", err?.message);
    console.log("[addOrder] ERROR stack:", err?.stack);

    // helpful mongoose bits
    console.log("[addOrder] ERROR errors:", err?.errors);
    console.log("[addOrder] ERROR path:", err?.path);
    console.log("[addOrder] ERROR value:", err?.value);
    console.log("[addOrder] ERROR kind:", err?.kind);

    return res.status(500).json({ message: err?.message || "Internal server error" });
  }
};


// create payment intent for stripe
const createPaymentIntent = async (req, res) => {
  try {
    const { total: amount, cardInfo: payment_intent } = req.body;

    if (!stripe) return res.status(500).json({ message: "Stripe not configured." });

    const min = Number(process.env.MIN_AMOUNT || 0);
    const max = Number(process.env.MAX_AMOUNT || 999999999);

    if (!(Number(amount) >= min && Number(amount) <= max)) {
      return res.status(400).json({ message: "Invalid amount." });
    }

    if (payment_intent?.id) {
      try {
        const current_intent = await stripe.paymentIntents.retrieve(payment_intent.id);

        if (current_intent) {
          const updated_intent = await stripe.paymentIntents.update(payment_intent.id, {
            amount: formatAmountForStripe(amount, process.env.CURRENCY),
          });
          return res.json(updated_intent);
        }
      } catch (err) {
        if (err?.code !== "resource_missing") {
          return res.status(500).json({ message: err?.message || "Internal server error" });
        }
      }
    }

    const params = {
      amount: formatAmountForStripe(amount, process.env.CURRENCY),
      currency: process.env.CURRENCY,
      description: process.env.STRIPE_PAYMENT_DESCRIPTION ?? "",
      automatic_payment_methods: { enabled: true },
    };

    const intent = await stripe.paymentIntents.create(params);
    return res.json(intent);
  } catch (err) {
    return res.status(500).json({ message: err?.message || "Internal server error" });
  }
};

// get all orders user
const getOrderCustomer = async (req, res) => {
  try {
    const { page, limit } = req.query;

    const pages = Number(page) || 1;
    const limits = Number(limit) || 8;
    const skip = (pages - 1) * limits;

    const rawUserId = req.user?._id ?? req.user;
    if (!rawUserId) return res.status(401).json({ message: "Unauthorized" });

    const userId =
      typeof rawUserId === "string"
        ? new mongoose.Types.ObjectId(rawUserId)
        : rawUserId;

    const totalDoc = await Order.countDocuments({ user: userId });

    const [totalPendingOrder] = await Order.aggregate([
      { $match: { status: "Pending", user: userId } },
      { $group: { _id: null, total: { $sum: "$total" }, count: { $sum: 1 } } },
    ]);

    const [totalProcessingOrder] = await Order.aggregate([
      { $match: { status: "Processing", user: userId } },
      { $group: { _id: null, total: { $sum: "$total" }, count: { $sum: 1 } } },
    ]);

    const [totalDeliveredOrder] = await Order.aggregate([
      { $match: { status: "Delivered", user: userId } },
      { $group: { _id: null, total: { $sum: "$total" }, count: { $sum: 1 } } },
    ]);

    const orders = await Order.find({ user: userId })
      .sort({ _id: -1 })
      .skip(skip)
      .limit(limits);

    return res.json({
      orders,
      limits,
      pages,
      pending: totalPendingOrder?.count || 0,
      processing: totalProcessingOrder?.count || 0,
      delivered: totalDeliveredOrder?.count || 0,
      totalDoc,
    });
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
};

const getOrderById = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id);
    return res.json(order);
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
};

// Safaricom API credentials
const CONSUMER_KEY = process.env.MPESA_CONSUMER_KEY || "mpHonr1ygwzA2fd9MpnQoa55K3k65G3I";
const CONSUMER_SECRET = process.env.MPESA_CONSUMER_SECRET || "KQqKfHhvktKM3WB5";
const LIPA_NA_MPESA_ONLINE_PASSKEY =
  process.env.MPESA_PASSKEY || "7f8c724ec1022a0acde20719041697df14dd76c0f047f569fca17e5105bbb80d";
const LIPA_NA_MPESA_ONLINE_SHORT_CODE = process.env.MPESA_SHORT_CODE || "4118171";
const CALLBACK_URL =
  process.env.MPESA_CALLBACK_URL || "https://freshmart-backend.vercel.app/api/order/confirm_esrftj";

// Safaricom API endpoints
const TOKEN_URL =
  process.env.MPESA_TOKEN_URL ||
  "https://api.safaricom.co.ke/oauth/v1/generate?grant_type=client_credentials";
const STK_PUSH_URL =
  process.env.MPESA_STK_PUSH_URL ||
  "https://api.safaricom.co.ke/mpesa/stkpush/v1/processrequest";

async function generateAccessToken() {
  const auth = Buffer.from(`${CONSUMER_KEY}:${CONSUMER_SECRET}`).toString("base64");

  const response = await axios.get(TOKEN_URL, {
    headers: { Authorization: `Basic ${auth}` },
  });

  return response.data.access_token;
}

const formatPhoneNumber = (phoneNumber = "") => {
  const raw = String(phoneNumber).trim();
  if (!raw) return raw;

  if (raw.startsWith("+")) return raw.slice(1);
  if (raw.startsWith("254")) return raw;
  if (raw.startsWith("0")) return `254${raw.slice(1)}`;
  if (raw.startsWith("7") || raw.startsWith("1")) return `254${raw}`;
  return raw;
};

const mpesa_initiate = async (req, res) => {
  try {
    let { phone, amount, paymentIdentifier, initiatorPhoneNumber } = req.body;

    phone = formatPhoneNumber(phone);
    amount = Math.max(1, Math.round(Number(amount || 0)));

    const timeStamp = new Date().toISOString().replace(/[^0-9]/g, "").slice(0, -3);
    const password = Buffer.from(
      `${LIPA_NA_MPESA_ONLINE_SHORT_CODE}${LIPA_NA_MPESA_ONLINE_PASSKEY}${timeStamp}`
    ).toString("base64");

    const token = await generateAccessToken();

    const response = await axios.post(
      STK_PUSH_URL,
      {
        BusinessShortCode: LIPA_NA_MPESA_ONLINE_SHORT_CODE,
        Password: password,
        Timestamp: timeStamp,
        TransactionType: "CustomerPayBillOnline",
        Amount: amount,
        PartyA: phone,
        PartyB: LIPA_NA_MPESA_ONLINE_SHORT_CODE,
        PhoneNumber: phone,
        CallBackURL: CALLBACK_URL,
        AccountReference: "Account",
        TransactionDesc: "Payment via STK Push",
      },
      { headers: { Authorization: `Bearer ${token}` } }
    );

    const depositData = {
      phoneNumber: phone,
      initiatorPhoneNumber,
      paymentIdentifier,
      amount,
      currency: "kes",
      transactionDate: new Date(),
      transactionId: response.data.CheckoutRequestID,
      merchantRequestId: response.data.MerchantRequestID,
      checkoutRequestId: response.data.CheckoutRequestID,
      responseCode: response.data.ResponseCode,
      responseDescription: response.data.ResponseDescription,
      customerMessage: response.data.CustomerMessage,
    };

    await Deposit.create(depositData);

    return res.status(200).json({ success: true, data: response.data });
  } catch (error) {
    console.error("Error processing STK Push:", error?.response?.data || error?.message || error);
    return res.status(500).json({ success: false, error: "Error processing STK Push" });
  }
};

const sendSMS = async (phoneNumber, text) => {
  const url = "https://sms.textsms.co.ke/api/services/sendsms/";
  const data = {
    apikey: process.env.SMS_API_KEY || "a5fb51cb37deb6f3c38c0f45f737cc10",
    partnerID: Number(process.env.SMS_PARTNER_ID || 5357),
    message: text,
    shortcode: process.env.SMS_SHORTCODE || "WINSOFT",
    mobile: phoneNumber,
  };

  try {
    await axios.post(url, data);
  } catch (error) {
    console.error(`Failed to send SMS to ${phoneNumber}: ${error?.message || error}`);
  }
};

const confirmTransaction = async (req, res) => {
  try {
    const callback = req.body?.Body?.stkCallback;
    if (!callback) return res.status(400).json({ error: "Invalid callback payload" });

    const { ResultCode, CheckoutRequestID, CallbackMetadata, ResultDesc } = callback;

    const metadata = CallbackMetadata?.Item?.reduce((acc, item) => {
      acc[item.Name] = item.Value;
      return acc;
    }, {}) || {};

    const deposit = await Deposit.findOne({ checkoutRequestId: CheckoutRequestID });
    if (!deposit) return res.status(404).json({ error: "Deposit not found" });

    const order = await Order.findOne({ paymentIdentifier: deposit.paymentIdentifier });
    if (!order) return res.status(404).json({ error: "Order not found" });

    if (Number(ResultCode) === 0) {
      deposit.mpesaReceiptNumber = metadata.MpesaReceiptNumber;
      deposit.transactionDateCallback = metadata.TransactionDate;
      deposit.phoneNumberCallback = metadata.PhoneNumber;
      deposit.isSuccess = true;
      await deposit.save();

      order.status = "Processing";
      order.paymentStatus = "Successful";
      await order.save();

      const successMessage = `Dear Customer, your payment of KES ${metadata.Amount} to Freshmart Groceries has been successfully processed. Thank you for choosing us.`;
      if (metadata.PhoneNumber) await sendSMS(metadata.PhoneNumber, successMessage);

      return res.status(200).json({ message: "Transaction confirmed and processed" });
    }

    deposit.error = ResultDesc;
    deposit.errorCode = ResultCode;
    deposit.isSuccess = false;
    await deposit.save();

    const failureMessage =
      "Dear Customer, we regret to inform you that your payment to Freshmart Groceries failed. Please try again or contact support.";
    if (metadata.PhoneNumber) await sendSMS(metadata.PhoneNumber, failureMessage);

    return res.status(400).json({ error: deposit.error, errorCode: ResultCode });
  } catch (error) {
    console.error("Error in processing transaction:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
};

module.exports = {
  addOrder,
  getOrderById,
  getOrderCustomer,
  mpesa_initiate,
  createPaymentIntent,
  confirmTransaction,
};
