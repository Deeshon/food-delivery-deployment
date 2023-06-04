const mongoose = require('mongoose')
const Schema = mongoose.Schema

const CartSchema = new Schema({
    item: {
        type: Schema.Types.ObjectId,
        ref: 'Item'
    }
})

const Cart = mongoose.model("Cart", CartSchema)
module.exports = Cart