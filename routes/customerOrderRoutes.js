const express = require("express");
const router = express.Router();
const {
  addOrder,
  getOrderById,
  getOrderCustomer,
  mpesa_initiate,
  createPaymentIntent,
} = require("../controller/customerOrderController");

//add a order
router.post("/add", addOrder);

// create stripe payment intent
router.post("/create-payment-intent", createPaymentIntent);

router.post("/mpesa-pay",  mpesa_initiate);
//get a order by id
router.get("/:id", getOrderById);

//get all order by a user
router.get("/", getOrderCustomer);

module.exports = router;
