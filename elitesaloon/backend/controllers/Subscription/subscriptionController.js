const SubscriptionPlanModel = require("../../models/SubscriptionPlanModel");
const jwt = require("jsonwebtoken");
const OwnerModel = require("../../models/OwnerModel");
// Get all active subscription plans
exports.getActiveSubscriptionPlans = async (req, res) => {
  try {
    const plans = await SubscriptionPlanModel.find({
      isActive: true,
    })
      .select("planName durationInMonths price")
      .sort({ durationInMonths: 1 })
      .lean();

    return res.status(200).json({
      success: true,
      message: "Subscription plans fetched successfully",
      plans,
    });
  } catch (error) {
    console.error("Error fetching subscription plans:", error);

    return res.status(500).json({
      success: false,
      message: "Unable to fetch subscription plans",
    });
  }
};



exports.validateSubscriptionLink = async (req, res) => {
  try {
    const { token } = req.query;

    if (!token) {
      return res.status(400).json({
        success: false,
        message: "Subscription token is required",
      });
    }

    const decoded = jwt.verify(
      token,
      process.env.SUBSCRIPTION_TOKEN_SECRET
    );

    if (
      decoded.purpose !== "SUBSCRIPTION" ||
      !decoded.ownerId
    ) {
      return res.status(401).json({
        success: false,
        message: "Invalid subscription link",
      });
    }

    const owner = await OwnerModel.findById(decoded.ownerId);

    if (!owner) {
      return res.status(404).json({
        success: false,
        message: "Owner not found",
      });
    }

    if (
      owner.ownerApprovedStatus !== "APPROVE" ||
      owner.ownerAccountStatus !== "ACTIVE"
    ) {
      return res.status(403).json({
        success: false,
        message: "Owner account is not approved or active",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Subscription link is valid",
      owner: {
        ownerId: owner._id,
        ownerName: owner.ownerName,
      },
    });
  } catch (error) {
    if (
      error.name === "JsonWebTokenError" ||
      error.name === "TokenExpiredError"
    ) {
      return res.status(401).json({
        success: false,
        message: "Invalid subscription token",
      });
    }

    console.error("Subscription token validation error:", error);

    return res.status(500).json({
      success: false,
      message: "Unable to validate subscription link",
    });
  }
};
