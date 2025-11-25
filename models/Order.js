// Freshmart-backend/models/Order.js
const mongoose = require("mongoose");

const orderSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    // Auto incremented invoice number
    // sparse avoids unique index issues on old docs that may not have invoice yet
    invoice: { type: Number, index: true, unique: true, sparse: true },

    cart: [{}],

    user_info: {
      name: { type: String, required: false },
      email: { type: String, required: false },
      contact: { type: String, required: false },
      address: { type: String, required: false },
      city: { type: String, required: false },
      country: { type: String, required: false },
      zipCode: { type: String, required: false },
    },

    subTotal: { type: Number, required: true },
    shippingCost: { type: Number, required: true },
    discount: { type: Number, required: true, default: 0 },
    total: { type: Number, required: true },

    shippingOption: { type: String, required: false },
    paymentMethod: { type: String, required: true },
    cardInfo: { type: Object, required: false },

    status: {
      type: String,
      enum: ["Pending", "Processing", "Delivered", "Cancel"],
    },

    paymentStatus: {
      type: String,
      enum: ["Pending", "Successful", "Failed"],
      default: "Pending",
    },

    // Make this sparse too, to avoid duplicate null conflicts
    paymentIdentifier: {
      type: String,
      required: false,
      unique: true,
      sparse: true,
    },
  },
  { timestamps: true }
);

/**
 * Invoice auto increment without creating a new mongoose model.
 * Uses a "counters" collection and atomic findOneAndUpdate.
 * First invoice will be 10000.
 */
orderSchema.pre("save", async function () {
  if (!this.isNew) return;
  if (this.invoice != null) return;

  const db = mongoose.connection.db;
  if (!db) throw new Error("MongoDB connection not ready");

  // Use a different field for $setOnInsert so it cannot conflict with $inc(seq)
  const result = await db.collection("counters").findOneAndUpdate(
    { _id: "order_invoice" },
    { $setOnInsert: { createdAt: new Date() }, $inc: { seq: 1 } },
    { upsert: true, returnDocument: "after" }
  );

  const seq = Number(result?.value?.seq || 0);

  // first invoice becomes 10000
  this.invoice = 10000 + (seq - 1);
});


module.exports = mongoose.models.Order || mongoose.model("Order", orderSchema);
