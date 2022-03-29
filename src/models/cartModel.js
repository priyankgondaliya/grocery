const mongoose = require("mongoose");

const CartSchema = new mongoose.Schema({
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User"
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