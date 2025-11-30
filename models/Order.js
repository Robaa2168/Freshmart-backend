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

    // Random 6 digit invoice number (must be unique)
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

// Helper to generate a random 6 digit number (100000 - 999999)
function generateRandomInvoice() {
  return Math.floor(100000 + Math.random() * 900000);
}

/**
 * Random 6 digit invoice assignment with collision checks.
 * No ordering guarantee, only uniqueness.
 */
orderSchema.pre("save", async function () {
  // Only assign invoice on first save and when not already set
  if (!this.isNew || this.invoice != null) {
    return;
  }

  const MAX_ATTEMPTS = 10;

  for (let i = 0; i < MAX_ATTEMPTS; i += 1) {
    const candidate = generateRandomInvoice();

    // Check if some other order already uses this invoice
    const exists = await this.constructor.exists({ invoice: candidate });
    if (!exists) {
      this.invoice = candidate;
      return;
    }
  }

  // If we somehow fail after several attempts, throw
  throw new Error("Failed to generate a unique 6 digit invoice number");
});


module.exports =
  mongoose.models.Order || mongoose.model("Order", orderSchema);
