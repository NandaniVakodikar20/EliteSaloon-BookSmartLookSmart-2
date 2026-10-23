const express = require("express");
const router = express.Router();

const {
  createOrder,
  verifyPayment,
  createSubscriptionOrder,
  verifySubscriptionPayment,
  getRazorpayPayments,
  createProductOrder,
  verifyProductPayment
} = require("../controllers/PaymentController/paymentController");

router.post("/create-order", createOrder);
router.post("/verify-payment", verifyPayment);
router.get("/razorpay-payments", getRazorpayPayments);
router.post("/create-subscription-order", createSubscriptionOrder);
router.post("/verify-subscription-payment", verifySubscriptionPayment);
router.post("/create-product-order", createProductOrder);
router.post("/verify-product-payment", verifyProductPayment);



module.exports = router;