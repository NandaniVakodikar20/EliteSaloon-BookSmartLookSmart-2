const mongoose = require("mongoose");

const subscriptionPlanSchema = new mongoose.Schema(
  {
    planName: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },

    durationInMonths: {
      type: Number,
      required: true,
      enum: [1, 6, 12],
    },

    price: {
      type: Number,
      required: true,
      min: 0,
    },

    isActive: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  }
);

const SubscriptionPlanModel = mongoose.model(
  "SubscriptionPlan",
  subscriptionPlanSchema
);

module.exports = SubscriptionPlanModel;