const Razorpay = require("razorpay");
const crypto = require("crypto");

const AppointmentModel = require("../../models/AppointmentModel");

const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY,
  key_secret: process.env.RAZORPAY_SECRET
});

// create order
exports.createOrder = async (req, res) => {
  try {
    const { appointmentId } = req.body;

    const appointment = await AppointmentModel.findById(appointmentId);

    if (!appointment) {
      return res.status(404).json({ message: "Appointment not found" });
    }

    const order = await razorpay.orders.create({
      amount: appointment.totalPrice * 100,
      currency: "INR"
    });

    appointment.orderId = order.id;
    await appointment.save();

    res.json(order);

  } catch (error) {
    console.log(error);
    res.status(500).send("Order error");
  }
};

          // verify payment

exports.verifyPayment = async (req, res) => {
  try {

    const {
      appointmentId,
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature
    } = req.body;

    const appointment = await AppointmentModel.findById(appointmentId);

    if (!appointment) {
      return res.status(404).json({ message: "Appointment not found" });
    }

    const body = razorpay_order_id + "|" + razorpay_payment_id;

    const expectedSignature = crypto
      .createHmac("sha256", process.env.RAZORPAY_SECRET)
      .update(body.toString())
      .digest("hex");

    if (expectedSignature !== razorpay_signature) {
      return res.status(400).json({ message: "Invalid payment" });
    }

    appointment.paymentId = razorpay_payment_id;
    appointment.paymentStatus = "SUCCESS";
    appointment.appointmentStatus = "COMPLETED";

    await appointment.save();

    res.json({ message: "Payment verified & saved" });

  } catch (error) {
    console.log(error);
    res.status(500).send("Verification error");
  }
};


//payment history

exports.getRazorpayPayments = async (req, res) => {
  try {

    const payments = await razorpay.payments.all({
      count: 100
    });

    res.json({
      success: true,
      payments: payments.items
    });

  } catch (error) {

    console.log(error);

    res.status(500).json({
      success: false,
      message: "Error fetching Razorpay payments"
    });

  }
};




// ==========================================
// CREATE SUBSCRIPTION PAYMENT ORDER
// ==========================================
exports.createSubscriptionOrder = async (req, res) => {
  try {

    const {
      planId,
      planName,
      duration,
      amount
    } = req.body;


    console.log(
      "========== CREATE SUBSCRIPTION ORDER =========="
    );

    console.log("Plan ID:", planId);
    console.log("Plan Name:", planName);
    console.log("Duration:", duration);
    console.log("Amount:", amount);


    // ------------------------------------------
    // Check required data
    // ------------------------------------------
    if (
      !planId ||
      !planName ||
      !duration ||
      !amount
    ) {

      return res.status(400).json({
        success: false,
        message:
          "Subscription details are required"
      });

    }


    // ------------------------------------------
    // Convert amount into number
    // ------------------------------------------
    const subscriptionAmount =
      Number(amount);


    // ------------------------------------------
    // Check valid amount
    // ------------------------------------------
    if (
      Number.isNaN(subscriptionAmount) ||
      subscriptionAmount <= 0
    ) {

      return res.status(400).json({
        success: false,
        message:
          "Invalid subscription amount"
      });

    }


    // ------------------------------------------
    // Create Razorpay order
    // ------------------------------------------
    const order =
      await razorpay.orders.create({

        amount:
          subscriptionAmount * 100,

        currency: "INR",

        receipt:
          `sub_${Date.now()}`
      });


    console.log(
      "Subscription Order Created:",
      order.id
    );


    // ------------------------------------------
    // Send order to frontend
    // ------------------------------------------
    res.status(200).json(order);


  } catch (error) {

    console.log(
      "Subscription Order Error:",
      error
    );


    res.status(500).json({
      success: false,
      message:
        "Unable to create subscription order"
    });

  }
};



// ==========================================
// VERIFY SUBSCRIPTION PAYMENT
// ==========================================
exports.verifySubscriptionPayment = async (req, res) => {
  try {

    const {
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature
    } = req.body;


    console.log(
      "========== SUBSCRIPTION PAYMENT VERIFY =========="
    );

    console.log(
      "Order ID:",
      razorpay_order_id
    );

    console.log(
      "Payment ID:",
      razorpay_payment_id
    );

    console.log(
      "Signature:",
      razorpay_signature
    );


    // ------------------------------------------
    // Check required data
    // ------------------------------------------
    if (
      !razorpay_order_id ||
      !razorpay_payment_id ||
      !razorpay_signature
    ) {

      return res.status(400).json({
        success: false,
        message:
          "Payment verification details are missing"
      });

    }


    // ------------------------------------------
    // Create signature body
    // ------------------------------------------
    const body =
      razorpay_order_id +
      "|" +
      razorpay_payment_id;


    // ------------------------------------------
    // Generate expected signature
    // ------------------------------------------
    const expectedSignature =
      crypto
        .createHmac(
          "sha256",
          process.env.RAZORPAY_SECRET
        )
        .update(body)
        .digest("hex");


    console.log(
      "Expected Signature:",
      expectedSignature
    );

    console.log(
      "Received Signature:",
      razorpay_signature
    );


    // ------------------------------------------
    // Compare signatures
    // ------------------------------------------
    if (
      expectedSignature !==
      razorpay_signature
    ) {

      console.log(
        "❌ Signature does not match"
      );


      return res.status(400).json({
        success: false,
        message:
          "Invalid payment signature"
      });

    }


    // ------------------------------------------
    // Payment verified
    // ------------------------------------------
    console.log(
      "✅ Subscription payment verified"
    );


    return res.status(200).json({

      success: true,

      message:
        "Subscription payment verified successfully",

      paymentId:
        razorpay_payment_id,

      orderId:
        razorpay_order_id

    });


  } catch (error) {

    console.log(
      "❌ Subscription Verification Error:",
      error
    );


    return res.status(500).json({
      success: false,
      message:
        "Payment verification failed"
    });

  }
};