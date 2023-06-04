const mongoose = require('mongoose')
const Schema = mongoose.Schema

const ItemSchema = new Schema({
    title: {
        type: String,
        required: true
    },
    subTitle: {
        type: String,
    },
    price: {
        type: Number,
        required: true,
    },
    cover: {
        type: String,
        required: true
    },
    category: {
        type: Schema.Types.ObjectId, 
        ref: "Category",
        required: true
    }
})


const Item = mongoose.model("Item", ItemSchema)

module.exports = Item