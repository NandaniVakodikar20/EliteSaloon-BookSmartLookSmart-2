const mongoose = require("mongoose");

const ownerSubscriptionSchema = new mongoose.Schema(
  {
    ownerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Owner",
      required: true,
      index: true,
    },

    planId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "SubscriptionPlan",
      required: true,
    },

    // Price at the time of purchase
    amount: {
      type: Number,
      required: true,
      min: 0,
    },

    startDate: {
      type: Date,
      default: null,
    },

    endDate: {
      type: Date,
      default: null,
    },

    status: {
      type: String,
      enum: ["PENDING", "ACTIVE", "EXPIRED", "CANCELLED"],
      default: "PENDING",
      index: true,
    },

    paymentId: {
      type: String,
      default: null,
    },

    paymentOrderId: {
      type: String,
      default: null,
    },

    paymentVerified: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

const OwnerSubscriptionModel = mongoose.model(
  "OwnerSubscription",
  ownerSubscriptionSchema
);

module.exports = OwnerSubscriptionModel;
