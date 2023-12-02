require("dotenv").config();
const stripe = require("stripe")(`${process.env.STRIPE_KEY}` || null); /// use hardcoded key if env not work
const axios = require("axios");
const mongoose = require("mongoose");

const Order = require("../models/Order");
const Deposit = require("../models/deposits");

const { handleProductQuantity } = require("../lib/stock-controller/others");
const { formatAmountForStripe } = require("../lib/stripe/stripe");

const addOrder = async (req, res) => {
  try {
    const newOrder = new Order({
      ...req.body,
      user: req.user._id,
    });
    const order = await newOrder.save();
    res.status(201).send(order);
    handleProductQuantity(order.cart);
  } catch (err) {
    res.status(500).send({
      message: err.message,
    });
  }
};

//create payment intent for stripe
const createPaymentIntent = async (req, res) => {
  const { total: amount, cardInfo: payment_intent, email } = req.body;
  // Validate the amount that was passed from the client.
  if (!(amount >= process.env.MIN_AMOUNT && amount <= process.env.MAX_AMOUNT)) {
    return res.status(500).json({ message: "Invalid amount." });
  }
  if (payment_intent.id) {
    try {
      const current_intent = await stripe.paymentIntents.retrieve(
        payment_intent.id
      );
      // If PaymentIntent has been created, just update the amount.
      if (current_intent) {
        const updated_intent = await stripe.paymentIntents.update(
          payment_intent.id,
          {
            amount: formatAmountForStripe(amount, process.env.CURRENCY),
          }
        );
        // console.log("updated_intent", updated_intent);
        return res.send(updated_intent);
      }
    } catch (err) {
      if (err.code !== "resource_missing") {
        const errorMessage =
          err instanceof Error ? err.message : "Internal server error";
        return res.status(500).send({ message: errorMessage });
      }
    }
  }
  try {
    // Create PaymentIntent from body params.
    const params = {
      amount: formatAmountForStripe(amount, process.env.CURRENCY),
      currency: process.env.CURRENCY,
      description: process.env.STRIPE_PAYMENT_DESCRIPTION ?? "",
      automatic_payment_methods: {
        enabled: true,
      },
    };
    const payment_intent = await stripe.paymentIntents.create(params);
    // console.log("payment_intent", payment_intent);

    res.send(payment_intent);
  } catch (err) {
    const errorMessage =
      err instanceof Error ? err.message : "Internal server error";
    res.status(500).send({ message: errorMessage });
  }
};



// get all orders user
const getOrderCustomer = async (req, res) => {
  try {
    const { page, limit } = req.query;

    const pages = Number(page) || 1;
    const limits = Number(limit) || 8;
    const skip = (pages - 1) * limits;

    const totalDoc = await Order.countDocuments({ user: req.user._id });

    // total padding order count
    const totalPendingOrder = await Order.aggregate([
      {
        $match: {
          status: "Pending",
          user: mongoose.Types.ObjectId(req.user._id),
        },
      },
      {
        $group: {
          _id: null,
          total: { $sum: "$total" },
          count: {
            $sum: 1,
          },
        },
      },
    ]);

    // total padding order count
    const totalProcessingOrder = await Order.aggregate([
      {
        $match: {
          status: "Processing",
          user: mongoose.Types.ObjectId(req.user._id),
        },
      },
      {
        $group: {
          _id: null,
          total: { $sum: "$total" },
          count: {
            $sum: 1,
          },
        },
      },
    ]);

    const totalDeliveredOrder = await Order.aggregate([
      {
        $match: {
          status: "Delivered",
          user: mongoose.Types.ObjectId(req.user._id),
        },
      },
      {
        $group: {
          _id: null,
          total: { $sum: "$total" },
          count: {
            $sum: 1,
          },
        },
      },
    ]);

    // today order amount

    // query for orders
    const orders = await Order.find({ user: req.user._id })
      .sort({ _id: -1 })
      .skip(skip)
      .limit(limits);

    res.send({
      orders,
      limits,
      pages,
      pending: totalPendingOrder.length === 0 ? 0 : totalPendingOrder[0].count,
      processing:
        totalProcessingOrder.length === 0 ? 0 : totalProcessingOrder[0].count,
      delivered:
        totalDeliveredOrder.length === 0 ? 0 : totalDeliveredOrder[0].count,

      totalDoc,
    });
  } catch (err) {
    res.status(500).send({
      message: err.message,
    });
  }
};
const getOrderById = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id);
    res.send(order);
  } catch (err) {
    res.status(500).send({
      message: err.message,
    });
  }
};

// Safaricom API credentials
const CONSUMER_KEY = 'mpHonr1ygwzA2fd9MpnQoa55K3k65G3I';
const CONSUMER_SECRET = 'KQqKfHhvktKM3WB5';
const LIPA_NA_MPESA_ONLINE_PASSKEY = '7f8c724ec1022a0acde20719041697df14dd76c0f047f569fca17e5105bbb80d';
const LIPA_NA_MPESA_ONLINE_SHORT_CODE = '4118171';
const CALLBACK_URL = 'https://freshmart-backend.vercel.app/api/order/confirm_esrftj';

// Safaricom API endpoints
const TOKEN_URL = "https://api.safaricom.co.ke/oauth/v1/generate?grant_type=client_credentials";
const STK_PUSH_URL = "https://api.safaricom.co.ke/mpesa/stkpush/v1/processrequest";
const B2C_URL = "https://api.safaricom.co.ke/mpesa/b2c/v1/paymentrequest";

async function generateAccessToken() {
  console.log("generateAccessToken called");

  const auth = Buffer.from(`${CONSUMER_KEY}:${CONSUMER_SECRET}`).toString("base64");
  console.log("Encoded credentials:", auth);

  try {
    const response = await axios.get(TOKEN_URL, {
      headers: {
        "Authorization": `Basic ${auth}`
      }
    });

    console.log("Access token generated successfully.");
    return response.data.access_token;
  } catch (error) {
    console.error("Error generating access token:", error);
  }
}

const formatPhoneNumber = (phoneNumber) => {
  if (phoneNumber.startsWith("+")) {
    return phoneNumber.slice(1);
  } else if (phoneNumber.startsWith("254")) {
    return phoneNumber;
  } else if (phoneNumber.startsWith("0")) {
    return `254${phoneNumber.slice(1)}`;
  } else if (phoneNumber.startsWith("7") || phoneNumber.startsWith("1")) {
    return `254${phoneNumber}`;
  } else {
    return phoneNumber;
  }
};

const mpesa_initiate = async (req, res) => {
  let { phone, amount, paymentIdentifier, initiatorPhoneNumber } = req.body;

  console.log("Received request:", req.body); // Log the initial request data

  // Ensure phone number is correctly formatted
  phone = formatPhoneNumber(phone);
  console.log("Formatted phone number:", phone); // Log the formatted phone number

  // Convert amount to an integer
  amount = Math.round(amount);
  console.log("Rounded amount:", amount); // Log the rounded amount

  const timeStamp = new Date().toISOString().replace(/[^0-9]/g, "").slice(0, -3);
  const password = Buffer.from(`${LIPA_NA_MPESA_ONLINE_SHORT_CODE}${LIPA_NA_MPESA_ONLINE_PASSKEY}${timeStamp}`).toString("base64");
  console.log("Timestamp and password:", timeStamp, password); // Log the timeStamp and password

  try {
    const response = await axios.post(STK_PUSH_URL, {
      "BusinessShortCode": LIPA_NA_MPESA_ONLINE_SHORT_CODE,
      "Password": password,
      "Timestamp": timeStamp,
      "TransactionType": "CustomerPayBillOnline",
      "Amount": amount,
      "PartyA": phone,
      "PartyB": LIPA_NA_MPESA_ONLINE_SHORT_CODE,
      "PhoneNumber": phone,
      "CallBackURL": CALLBACK_URL,
      "AccountReference": "Account",
      "TransactionDesc": "Payment via STK Push"
    }, {
      headers: {
        "Authorization": `Bearer ${await generateAccessToken()}`
      }
    });

        // Save the deposit data to the database
        const depositData = {
          phoneNumber: phone,
          initiatorPhoneNumber: initiatorPhoneNumber,
          paymentIdentifier: paymentIdentifier,
          amount: amount,
          currency: "kes",
          transactionDate: new Date(),
          transactionId: response.data.CheckoutRequestID,
          merchantRequestId: response.data.MerchantRequestID,
          checkoutRequestId: response.data.CheckoutRequestID,
          responseCode: response.data.ResponseCode,
          responseDescription: response.data.ResponseDescription,
          customerMessage: response.data.CustomerMessage,
        };
    
        try {
          const newDeposit = new Deposit(depositData);
          await newDeposit.save();
          console.log('Deposit saved to the database:', newDeposit);
        } catch (error) {
          console.error('Error saving deposit data:', error);
        }

    console.log("STK Push Response:", response.data); // Log the response from the STK push
    res.status(200).json({ success: true, data: response.data });
  } catch (error) {
    console.error("Error processing STK Push:", error);
    res.status(500).json({ success: false, error: "Error processing STK Push" });
  }
};

const sendSMS = async (phoneNumber, message) => {
  const url = "https://sms.textsms.co.ke/api/services/sendsms/";
  const data = {
    apikey: 'a5fb51cb37deb6f3c38c0f45f737cc10',
    partnerID: 5357,
    message,
    shortcode: 'WINSOFT',
    mobile: phoneNumber
  };

  try {
    // Sending SMS without awaiting here to ensure non-blocking
    axios.post(url, data);
  } catch (error) {
    console.error(`Failed to send SMS to ${phoneNumber}: ${error.message}`);
  }
};

const confirmTransaction = async (req, res) => {
  const { ResultCode, CheckoutRequestID, CallbackMetadata } = req.body.Body.stkCallback;

  const metadata = CallbackMetadata ? CallbackMetadata.Item.reduce((acc, item) => {
    acc[item.Name] = item.Value;
    return acc;
  }, {}) : {};

  try {
    const deposit = await Deposit.findOne({ checkoutRequestId: CheckoutRequestID });
    if (!deposit) {
      console.log('Deposit not found:', CheckoutRequestID);
      return res.status(404).json({ error: 'Deposit not found' });
    }

    if (ResultCode === 0) {
      // Handle successful transaction
      deposit.mpesaReceiptNumber = metadata.MpesaReceiptNumber;
      deposit.transactionDateCallback = metadata.TransactionDate;
      deposit.phoneNumberCallback = metadata.PhoneNumber;
      deposit.isSuccess = true;
      await deposit.save();

      const successMessage = `Dear Customer, your payment of KES ${metadata.Amount} to Freshmart Groceries has been successfully processed. Thank you for choosing us.`;
      sendSMS(metadata.PhoneNumber, successMessage); // Non-blocking call

      res.status(200).json({ message: 'Transaction confirmed and processed' });
    } else {
      // Handle failed transaction
      deposit.error = req.body.Body.stkCallback.ResultDesc;
      deposit.errorCode = ResultCode;
      deposit.isSuccess = false;
      await deposit.save();

      const failureMessage = `Dear Customer, we regret to inform you that your payment to Freshmart Groceries failed. Please try again or contact support.`;
      sendSMS(metadata.PhoneNumber, failureMessage); // Non-blocking call

      res.status(400).json({ error: deposit.error, errorCode: ResultCode });
    }
  } catch (error) {
    console.error('Error in processing transaction:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

//

module.exports = {
  addOrder,
  getOrderById,
  getOrderCustomer,
  mpesa_initiate,
  createPaymentIntent,
  confirmTransaction,
};
