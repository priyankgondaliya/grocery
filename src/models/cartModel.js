const mongoose = require("mongoose");

const CartSchema = new mongoose.Schema({
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User"
    },
    vendorId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Vendor"
    },
    products: [
      {
        productId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Product"
          },
        quantity: Number,
        // name: String,
        // price: Number // what if price is changed
      }
    ]
});

module.exports = mongoose.model("Cart", CartSchema);