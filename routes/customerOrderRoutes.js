// customerOrderRoutes.js

const express = require("express");
const { isAuth, isAdmin } = require("../config/auth");
const router = express.Router();
const {
  addOrder,
  getOrderById,
  getOrderCustomer,
  mpesa_initiate,
  confirmTransaction,
  createPaymentIntent,
} = require("../controller/customerOrderController");

// Apply 'isAuth' middleware only to the routes that require authentication
router.post("/add", isAuth, addOrder);
router.get("/:id", isAuth, getOrderById);
router.get("/", isAuth, getOrderCustomer);
router.post("/create-payment-intent",isAuth, createPaymentIntent);
router.post("/mpesa-pay",isAuth, mpesa_initiate);

// Routes without 'isAuth' middleware

router.post("/confirm_esrftj",  confirmTransaction);

module.exports = router;
