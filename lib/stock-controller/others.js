require("dotenv").config()
const mongoose = require("mongoose")
const Product = require("../../models/Product")

const mongo_connection = mongoose.createConnection(process.env.MONGO_URI, {
  connectTimeoutMS: 10000,
  socketTimeoutMS: 30000,
  maxPoolSize: 100,
})

mongo_connection.on("connected", () => {
  console.log("mongodb connection success!")
})

mongo_connection.on("error", (err) => {
  console.log("mongodb connection failed!", err?.message || err)
})

// decrease product quantity after an order created
const handleProductQuantity = async (cart = []) => {
  try {
    for (const p of cart) {
      const qty = Number(p?.quantity || 0)
      if (!qty) continue

      if (p?.isCombination) {
        const variantProductId = p?.variant?.productId || ""

        await Product.findOneAndUpdate(
          { _id: p._id, "variants.productId": variantProductId },
          {
            $inc: {
              stock: -qty,
              "variants.$.quantity": -qty,
              sales: qty,
            },
          },
          { new: true }
        )
      } else {
        await Product.findOneAndUpdate(
          { _id: p._id },
          {
            $inc: {
              stock: -qty,
              sales: qty,
            },
          },
          { new: true }
        )
      }
    }
  } catch (err) {
    console.log("err on handleProductQuantity", err?.message || err)
  }
}

const handleProductAttribute = async (key, value, multi) => {
  try {
    const products = await Product.find({ isCombination: true }).select("_id")

    if (multi) {
      for (const p of products) {
        await Product.updateOne(
          { _id: p._id },
          { $pull: { variants: { [key]: { $in: value } } } }
        )
      }
      return
    }

    for (const p of products) {
      await Product.updateOne(
        { _id: p._id },
        { $pull: { variants: { [key]: value } } }
      )
    }
  } catch (err) {
    console.log("err, when delete product variants", err?.message || err)
  }
}

module.exports = {
  mongo_connection,
  handleProductQuantity,
  handleProductAttribute,
}
