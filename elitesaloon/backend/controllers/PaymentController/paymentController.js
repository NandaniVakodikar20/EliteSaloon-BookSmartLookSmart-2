const Razorpay = require("razorpay");
const crypto = require("crypto");
const emailSendOptimizeCode = require("../../utils/emailSendOptimizeCode");
const jwt = require("jsonwebtoken");

const OwnerModel = require("../../models/OwnerModel");
const SubscriptionPlanModel = require("../../models/SubscriptionPlanModel");
const OwnerSubscriptionModel = require("../../models/OwnerSubscriptionModel");

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
// exports.createSubscriptionOrder = async (req, res) => {
//   try {

//     const {
//       planId,
//       planName,
//       duration,
//       amount
//     } = req.body;


//     console.log(
//       "========== CREATE SUBSCRIPTION ORDER =========="
//     );

//     console.log("Plan ID:", planId);
//     console.log("Plan Name:", planName);
//     console.log("Duration:", duration);
//     console.log("Amount:", amount);


//     // ------------------------------------------
//     // Check required data
//     // ------------------------------------------
//     if (
//       !planId ||
//       !planName ||
//       !duration ||
//       !amount
//     ) {

//       return res.status(400).json({
//         success: false,
//         message:
//           "Subscription details are required"
//       });

//     }


//     // ------------------------------------------
//     // Convert amount into number
//     // ------------------------------------------
//     const subscriptionAmount =
//       Number(amount);


//     // ------------------------------------------
//     // Check valid amount
//     // ------------------------------------------
//     if (
//       Number.isNaN(subscriptionAmount) ||
//       subscriptionAmount <= 0
//     ) {

//       return res.status(400).json({
//         success: false,
//         message:
//           "Invalid subscription amount"
//       });

//     }


//     // ------------------------------------------
//     // Create Razorpay order
//     // ------------------------------------------
//     const order =
//       await razorpay.orders.create({

//         amount:
//           subscriptionAmount * 100,

//         currency: "INR",

//         receipt:
//           `sub_${Date.now()}`
//       });


//     console.log(
//       "Subscription Order Created:",
//       order.id
//     );


//     // ------------------------------------------
//     // Send order to frontend
//     // ------------------------------------------
//     res.status(200).json(order);


//   } catch (error) {

//     console.log(
//       "Subscription Order Error:",
//       error
//     );


//     res.status(500).json({
//       success: false,
//       message:
//         "Unable to create subscription order"
//     });

//   }
// };
// CREATE SUBSCRIPTION PAYMENT ORDER
exports.createSubscriptionOrder = async (req, res) => {
  try {
    const { planId, token } = req.body;

    if (!planId || !token) {
      return res.status(400).json({
        success: false,
        message: "Plan and subscription token are required",
      });
    }

    // 1. Verify subscription token
    let decoded;

    try {
      decoded = jwt.verify(
        token,
        process.env.SUBSCRIPTION_TOKEN_SECRET
      );
    } catch (error) {
      return res.status(401).json({
        success: false,
        message: "Invalid subscription link",
      });
    }

    if (
      decoded.purpose !== "SUBSCRIPTION" ||
      !decoded.ownerId
    ) {
      return res.status(401).json({
        success: false,
        message: "Invalid subscription token",
      });
    }

    // 2. Find owner
    const owner = await OwnerModel.findById(decoded.ownerId);

    if (
      !owner ||
      owner.ownerApprovedStatus !== "APPROVE" ||
      owner.ownerAccountStatus !== "ACTIVE" ||
      !owner.ownerVerified
    ) {
      return res.status(403).json({
        success: false,
        message: "Owner is not approved, verified, or active",
      });
    }

    // 3. Map the frontend plan ID to a database plan name
    const planNames = {
      MONTHLY: "Monthly",
      SIX_MONTH: "Half-Yearly",
      YEARLY: "Yearly",
    };

    const planName = planNames[planId];

    if (!planName) {
      return res.status(400).json({
        success: false,
        message: "Invalid subscription plan",
      });
    }

    // 4. Get the real plan and price from MongoDB
    const plan = await SubscriptionPlanModel.findOne({
      planName,
      isActive: true,
    });

    if (!plan) {
      return res.status(404).json({
        success: false,
        message: "Subscription plan not found or inactive",
      });
    }

    // 5. Create Razorpay order using database price
    const order = await razorpay.orders.create({
      amount: Math.round(plan.price * 100),
      currency: "INR",
      receipt: `sub_${Date.now()}`,
      notes: {
        ownerId: owner._id.toString(),
        planId: plan._id.toString(),
      },
    });

    // 6. Save pending subscription
    await OwnerSubscriptionModel.create({
      ownerId: owner._id,
      planId: plan._id,
      amount: plan.price,
      paymentOrderId: order.id,
      status: "PENDING",
      paymentVerified: false,
    });

    console.log("Subscription order created:", order.id);

    return res.status(201).json({
      success: true,
      id: order.id,
      amount: order.amount,
      currency: order.currency,
    });
  } catch (error) {
    console.error("Create subscription order error:", error);

    return res.status(500).json({
      success: false,
      message: "Unable to create subscription order",
    });
  }
};



// ==========================================
// VERIFY SUBSCRIPTION PAYMENT
// ==========================================
// exports.verifySubscriptionPayment = async (req, res) => {
//   try {

//     const {
//       razorpay_order_id,
//       razorpay_payment_id,
//       razorpay_signature
//     } = req.body;


//     console.log(
//       "========== SUBSCRIPTION PAYMENT VERIFY =========="
//     );

//     console.log(
//       "Order ID:",
//       razorpay_order_id
//     );

//     console.log(
//       "Payment ID:",
//       razorpay_payment_id
//     );

//     console.log(
//       "Signature:",
//       razorpay_signature
//     );


//     // ------------------------------------------
//     // Check required data
//     // ------------------------------------------
//     if (
//       !razorpay_order_id ||
//       !razorpay_payment_id ||
//       !razorpay_signature
//     ) {

//       return res.status(400).json({
//         success: false,
//         message:
//           "Payment verification details are missing"
//       });

//     }


//     // ------------------------------------------
//     // Create signature body
//     // ------------------------------------------
//     const body =
//       razorpay_order_id +
//       "|" +
//       razorpay_payment_id;


//     // ------------------------------------------
//     // Generate expected signature
//     // ------------------------------------------
//     const expectedSignature =
//       crypto
//         .createHmac(
//           "sha256",
//           process.env.RAZORPAY_SECRET
//         )
//         .update(body)
//         .digest("hex");


//     console.log(
//       "Expected Signature:",
//       expectedSignature
//     );

//     console.log(
//       "Received Signature:",
//       razorpay_signature
//     );


//     // ------------------------------------------
//     // Compare signatures
//     // ------------------------------------------
//     if (
//       expectedSignature !==
//       razorpay_signature
//     ) {

//       console.log(
//         "❌ Signature does not match"
//       );


//       return res.status(400).json({
//         success: false,
//         message:
//           "Invalid payment signature"
//       });

//     }


//     // ------------------------------------------
//     // Payment verified
//     // ------------------------------------------
//     console.log(
//       "✅ Subscription payment verified"
//     );


//     return res.status(200).json({

//       success: true,

//       message:
//         "Subscription payment verified successfully",

//       paymentId:
//         razorpay_payment_id,

//       orderId:
//         razorpay_order_id

//     });


//   } catch (error) {

//     console.log(
//       "❌ Subscription Verification Error:",
//       error
//     );


//     return res.status(500).json({
//       success: false,
//       message:
//         "Payment verification failed"
//     });

//   }
// };
// VERIFY SUBSCRIPTION PAYMENT

exports.verifySubscriptionPayment = async (req, res) => {
  try {
    const {
      token,
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature,
    } = req.body;

    if (
      !token ||
      !razorpay_order_id ||
      !razorpay_payment_id ||
      !razorpay_signature
    ) {
      return res.status(400).json({
        success: false,
        message: "Payment verification details are required",
      });
    }

    // 1. Verify subscription token
    let decoded;

    try {
      decoded = jwt.verify(
        token,
        process.env.SUBSCRIPTION_TOKEN_SECRET
      );
    } catch (error) {
      return res.status(401).json({
        success: false,
        message: "Invalid subscription link",
      });
    }

    if (
      decoded.purpose !== "SUBSCRIPTION" ||
      !decoded.ownerId
    ) {
      return res.status(401).json({
        success: false,
        message: "Invalid subscription token",
      });
    }

    // 2. Find the exact pending subscription order
    const subscription = await OwnerSubscriptionModel.findOne({
      ownerId: decoded.ownerId,
      paymentOrderId: razorpay_order_id,
    });

    if (!subscription) {
      return res.status(404).json({
        success: false,
        message: "Subscription order not found",
      });
    }

    // 3. Prevent duplicate activation
    if (subscription.paymentVerified) {
      return res.status(200).json({
        success: true,
        message: "Subscription payment was already verified",
      });
    }

    // 4. Verify Razorpay signature
    const signatureBody =
      `${razorpay_order_id}|${razorpay_payment_id}`;

    const expectedSignature = crypto
      .createHmac("sha256", process.env.RAZORPAY_SECRET)
      .update(signatureBody)
      .digest("hex");

    const expectedBuffer = Buffer.from(expectedSignature);
    const receivedBuffer = Buffer.from(razorpay_signature);

    if (
      expectedBuffer.length !== receivedBuffer.length ||
      !crypto.timingSafeEqual(expectedBuffer, receivedBuffer)
    ) {
      return res.status(400).json({
        success: false,
        message: "Invalid Razorpay payment signature",
      });
    }

    // 5. Fetch payment directly from Razorpay
    const payment = await razorpay.payments.fetch(
      razorpay_payment_id
    );

    if (
      payment.order_id !== razorpay_order_id ||
      payment.status !== "captured" ||
      payment.amount !== Math.round(subscription.amount * 100) ||
      payment.currency !== "INR"
    ) {
      return res.status(400).json({
        success: false,
        message: "Payment is not captured or does not match the order",
      });
    }

    // 6. Confirm the owner is still eligible
    const owner = await OwnerModel.findById(decoded.ownerId);

    if (
      !owner ||
      owner.ownerApprovedStatus !== "APPROVE" ||
      owner.ownerAccountStatus !== "ACTIVE" ||
      !owner.ownerVerified
    ) {
      return res.status(403).json({
        success: false,
        message: "Owner is not eligible for subscription activation",
      });
    }

    // 7. Get plan duration from database
    const plan = await SubscriptionPlanModel.findById(
      subscription.planId
    );

    if (!plan || !plan.isActive) {
      return res.status(400).json({
        success: false,
        message: "Subscription plan is unavailable",
      });
    }

    // 8. Activate the subscription
    const startDate = new Date();
    const endDate = new Date(startDate);

    endDate.setMonth(
      endDate.getMonth() + plan.durationInMonths
    );

    subscription.startDate = startDate;
    subscription.endDate = endDate;
    subscription.status = "ACTIVE";
    subscription.paymentId = razorpay_payment_id;
    subscription.paymentVerified = true;

    await subscription.save();


    // Send subscription success email to owner
    const subject = "🎉 Welcome to EliteSaloon - Subscription Successful!";

    const message = `
Dear ${owner.ownerName},

Congratulations! 🎉

Your subscription payment has been completed successfully,
and your EliteSaloon subscription is now ACTIVE.

Thank you for choosing EliteSaloon for your salon business.

We wish you great success, more customers, and continued growth
with your salon. May your journey with EliteSaloon be rewarding!

For your account security, if you wish to change or reset your
password, please use the Forgot Password option on the EliteSaloon
login page.

We look forward to being part of your success!

Best wishes,
Team EliteSaloon
Book Smart, Look Smart
`;

    // Send email using your existing email function
    const emailSent = await emailSendOptimizeCode(
      owner.ownerEmail,
      subject,
      message
    );

    if (!emailSent) {
      console.error(
        "Subscription activated, but confirmation email could not be sent:",
        owner.ownerEmail
      );
    }

    return res.status(200).json({
      success: true,
      message: "Subscription activated successfully",
      subscription: {
        planName: plan.planName,
        startDate: subscription.startDate,
        endDate: subscription.endDate,
        status: subscription.status,
      },
    });
  } catch (error) {
    console.error("Verify subscription payment error:", error);

    return res.status(500).json({
      success: false,
      message: "Unable to verify subscription payment",
    });
  }
};
