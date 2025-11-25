// freshmart-backend/lib/stock-controller/others.js
require("dotenv").config();
const mongoose = require("mongoose");
const Product = require("../../models/Product");

const mongo_connection = mongoose.connection;

mongo_connection.on("connected", () => {
  console.log("mongodb connection success!");
});

mongo_connection.on("error", (err) => {
  console.log("mongodb connection failed!", err?.message || err);
});

const ensureMongoConnection = async () => {
  const state = mongo_connection.readyState;
  if (state === 1 || state === 2) return;

  const uri = process.env.MONGO_URI;
  if (!uri) throw new Error("MONGO_URI is missing");

  await mongoose.connect(uri, {
    connectTimeoutMS: 10000,
    socketTimeoutMS: 30000,
    maxPoolSize: 100,
  });
};

// decrease product quantity after an order created
const handleProductQuantity = async (cart = []) => {
  try {
    if (!Array.isArray(cart) || cart.length === 0) return;

    await ensureMongoConnection();

    for (const p of cart) {
      const qty = Number(p?.quantity || 0);
      if (!Number.isFinite(qty) || qty <= 0) continue;

      const productId = p?._id;
      if (!productId) continue;

      if (p?.isCombination) {
        const variantProductId = p?.variant?.productId;
        if (!variantProductId) continue;

        await Product.updateOne(
          { _id: productId, "variants.productId": variantProductId },
          {
            $inc: {
              stock: -qty,
              "variants.$.quantity": -qty,
              sales: qty,
            },
          }
        );
      } else {
        await Product.updateOne(
          { _id: productId },
          {
            $inc: {
              stock: -qty,
              sales: qty,
            },
          }
        );
      }
    }
  } catch (err) {
    console.log("err on handleProductQuantity", err?.message || err);
  }
};

const handleProductAttribute = async (key, value, multi) => {
  try {
    if (!key) return;

    await ensureMongoConnection();

    if (multi) {
      if (!Array.isArray(value) || value.length === 0) return;

      await Product.updateMany(
        { isCombination: true },
        { $pull: { variants: { [key]: { $in: value } } } }
      );
      return;
    }

    if (value === undefined || value === null) return;

    await Product.updateMany(
      { isCombination: true },
      { $pull: { variants: { [key]: value } } }
    );
  } catch (err) {
    console.log("err, when delete product variants", err?.message || err);
  }
};

module.exports = {
  mongo_connection,
  ensureMongoConnection,
  handleProductQuantity,
  handleProductAttribute,
};
