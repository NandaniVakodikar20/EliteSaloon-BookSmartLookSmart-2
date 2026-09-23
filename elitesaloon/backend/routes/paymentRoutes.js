const express = require("express");
const router = express.Router();

const {
  createOrder,
  verifyPayment,
   createSubscriptionOrder,
  verifySubscriptionPayment,
  getRazorpayPayments
} = require("../controllers/PaymentController/paymentController");

router.post("/create-order", createOrder);
router.post("/verify-payment", verifyPayment);
router.get("/razorpay-payments", getRazorpayPayments);
router.post("/create-subscription-order", createSubscriptionOrder);
router.post("/verify-subscription-payment",verifySubscriptionPayment);



module.exports = router;