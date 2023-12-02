const mongoose = require('mongoose');
const AutoIncrement = require('mongoose-sequence')(mongoose);

const orderSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  invoice: {
    type: Number,
    // Auto-incremented field
  },
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
    enum: ['Pending', 'Processing', 'Delivered', 'Cancel'],
  },
  paymentStatus: {
    type: String,
    enum: ['Pending', 'Successful', 'Failed'],
    default: 'Pending', // Default status
  },
  paymentIdentifier: {
    type: String,
    required: false,
    unique: true,
  },
}, { timestamps: true });

// Apply the auto-increment plugin to the orderSchema
orderSchema.plugin(AutoIncrement, { inc_field: 'invoice', start_seq: 10000 });

const Order = mongoose.model('Order', orderSchema);

module.exports = Order;
