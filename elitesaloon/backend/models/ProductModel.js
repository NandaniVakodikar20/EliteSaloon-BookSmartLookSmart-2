const mongoose = require("mongoose");

const ProductSchema = new mongoose.Schema({

    ownerId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Owner",
        required: true
    },

    productName: {
        type: String,
        required: true,
        trim: true
    },

    productType:{
        type:String,
        enum:["HAIRGEL","FACEWASH","SUNSCREAM","CONDITIONER","HAIR_SERUM","SHAMPOO"],
        required:true
    },

    productDescription: {
        type: String,
        required: true
    },

    productPrice: {
        type: Number,
        required: true
    },

    productPreferredGender: {
        type: String,
        enum: ["MALE", "FEMALE", "BOTH"],
        default: "BOTH"
    },

    productImages: [{
        type: String
    }],

    createdDate: {
        type: Date,
        default: Date.now
    }

});

module.exports = mongoose.model("Product", ProductSchema);