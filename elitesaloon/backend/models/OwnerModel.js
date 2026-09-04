const mongoose = require('mongoose');

const ownerSchema = new mongoose.Schema({   

    ownerName: {
        type: String, required: true
    },
    ownerEmail: {
        type: String, required: true, unique: true
    }  ,
    ownerMobile: {
        type: String, required: true
    },

    ownerShopName: {
        type: String, required: true
    },

    ownerShopCertificate: {
        type: String, required: true
    },

    shopFrontPhoto: {
        type: String,
        required: true
    },

    shopInsidePhoto: {
        type: String,
        required: true
    },

    ownerShopStreet: {
        type: String, required: true
    },
    ownerShopCity: {
        type: String, required: true
    },
    ownerShopBlock: {
        type: String, required: true
    },
    ownerShopDistrict: {
        type: String, required: true
    },
    ownerShopPincode: {
        type: String, required: true
    },
    ownerShopState: {
        type: String, required: true
    },
    ownerLatitude: {
        type: Number, required: true
    },

    ownerLongitude: {
        type: Number, required: true
    },

    ownerOTP : {
        type: String, default: null
    },

    ownerVerified : {
        type: Boolean, default: false
    },

    ownerAccountStatus : {
        type: String, default: "DEACTIVE"
    },

    ownerApprovedStatus :{
        type: String, default: "PENDING"
    },

    ownerPassword: {
        type: String, required: true
    },

    ownerCreatedAt: {
        type: Date, default: Date.now
    },
    ownerUpdatedAt: {
        type: Date, default: Date.now   
    },
    ownerProfileImage: {
        type: String, required: true
    }

});

const Owner = mongoose.model('Owner', ownerSchema);

module.exports = Owner;