// Freshmart-backend/models/Order.js
const mongoose = require("mongoose");

/**
 * Order Schema
 */
const orderSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    // Auto-incremented invoice number (unique)
    invoice: { type: Number, unique: true, index: true, sparse: true },

    cart: [{}],

    user_info: {
      name: { type: String },
      email: { type: String },
      contact: { type: String },
      address: { type: String },
      city: { type: String },
      country: { type: String },
      zipCode: { type: String },
    },

    subTotal: { type: Number, required: true },
    shippingCost: { type: Number, required: true },
    discount: { type: Number, required: true, default: 0 },
    total: { type: Number, required: true },

    shippingOption: { type: String },
    paymentMethod: { type: String, required: true },
    cardInfo: { type: Object },

    status: {
      type: String,
      enum: ["Pending", "Processing", "Delivered", "Cancel"],
      default: "Pending",
    },

    paymentStatus: {
      type: String,
      enum: ["Pending", "Successful", "Failed"],
      default: "Pending",
    },

    // Optional unique payment reference
    paymentIdentifier: {
      type: String,
      unique: true,
      sparse: true,
    },
  },
  { timestamps: true }
);

/**
 * Atomic invoice auto-increment logic using a 'counters' collection.
 * Always produces strictly increasing invoice numbers like 10000, 10001, 10002, etc.
 */
orderSchema.pre("save", async function () {
  if (!this.isNew || this.invoice != null) return;

  const db = mongoose.connection.db;
  if (!db) throw new Error("MongoDB connection not ready");

  const result = await db.collection("counters").findOneAndUpdate(
    { _id: "order_invoice" },
    { $inc: { seq: 1 } },
    { upsert: true, returnDocument: "after" }
  );

  const seq = Number(result?.value?.seq || 1);

  // Start invoices from 10000
  this.invoice = 9999 + seq;
});

module.exports = mongoose.models.Order || mongoose.model("Order", orderSchema);
