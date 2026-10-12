const express = require("express");
const router = express.Router();

const {
  getActiveSubscriptionPlans,
  validateSubscriptionLink
} = require("../controllers/Subscription/subscriptionController");

router.get("/plans", getActiveSubscriptionPlans);
router.get("/validate-link", validateSubscriptionLink);

module.exports = router;
