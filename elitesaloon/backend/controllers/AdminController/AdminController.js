const OwnerModel = require("../../models/OwnerModel");
const CustomerModel = require("../../models/CustomerModel");
const AdminModel = require("../../models/AdminModel");
const AppointmentModel = require("../../models/AppointmentModel");
const emailSendOptimizeCode = require("../../utils/emailSendOptimizeCode");
const bcrypt = require("bcrypt");

// exports.approveOwner = async (req, res) => {
//   const { ownerId } = req.params;
//   const { ownerApprovedStatus } = req.body;

//   const owner = await OwnerModel.findOne({ _id: ownerId });

//   if (owner !== null) {
//     let wishesh = "";
//     let status = "";
//     const subject = "Owner Request for Elite Saloon Account ... !!!";

//     if (ownerApprovedStatus === "APPROVE") {
//       wishesh = "Congratulations ... ";
//       status =
//         ownerApprovedStatus +
//         "\n\n For login first time, Please reset password ...!!!";

//       owner.ownerApprovedStatus = ownerApprovedStatus;
//       owner.ownerAccountStatus = "ACTIVE";
//       owner.ownerUpdatedAt = Date.now();
//       await owner.save();
//     } else {
//       wishesh = "Hard luck ";
//       status = ownerApprovedStatus;

//       owner.ownerApprovedStatus = ownerApprovedStatus;
//       owner.ownerAccountStatus = "DEACTIVE";
//       owner.ownerUpdatedAt = Date.now();
//       await owner.save();
//     }

//     let message =
//       `${wishesh}...!!!\n\nYour request has been reviewed by ADMIN.\n\n` +
//       `You are ${status}` +
//       `Thank You\nEliteSaloon`;

//     res.status(200).json({
//       message: "DONE",
//     });

//     emailSendOptimizeCode(owner.ownerEmail, subject, message);
//   }
// };


// exports.approveOwner = async (req, res) => {
//   try {
//     const { ownerId } = req.params;
//     const { ownerApprovedStatus } = req.body;

//     const owner = await OwnerModel.findById(ownerId);

//     if (!owner) {
//       return res.status(404).json({
//         success: false,
//         message: "Owner not found",
//       });
//     }

//     if (!["APPROVE", "REJECT"].includes(ownerApprovedStatus)) {
//       return res.status(400).json({
//         success: false,
//         message: "Invalid owner approval status",
//       });
//     }

//     owner.ownerApprovedStatus = ownerApprovedStatus;
//     owner.ownerUpdatedAt = new Date();

//     if (ownerApprovedStatus === "APPROVE") {
//       owner.ownerAccountStatus = "ACTIVE";
//     } else {
//       owner.ownerAccountStatus = "DEACTIVE";
//     }

//     await owner.save();

//     // Send subscription email only when the owner is approved
//     if (ownerApprovedStatus === "APPROVE") {
//       const subject = "EliteSaloon - Complete Your Subscription";

//       const subscriptionLink =
//         "http://localhost:3000/ownersubscription";

//       const message = `
//         Hello ${owner.ownerName},

//         Congratulations! Your EliteSaloon owner account has been
//         approved by the administrator.

//         To activate your salon access, please select a subscription
//         plan and complete the payment using the link below:

//         ${subscriptionLink}

//         Subscription Plans:
//         - 1 Month: Rs. 300
//         - 6 Months: Rs. 1000
//         - 12 Months: Rs. 2000

//         Your login access will be enabled after your payment is
//         successfully verified.

//         Regards,
//         EliteSaloon Team
//       `;

//       await emailSendOptimizeCode(
//         owner.ownerEmail,
//         subject,
//         message
//       );
//     }

//     return res.status(200).json({
//       success: true,
//       message:
//         ownerApprovedStatus === "APPROVE"
//           ? "Owner approved and subscription email sent"
//           : "Owner rejected successfully",
//     });
//   } catch (error) {
//     console.error("Error in approveOwner:", error);

//     return res.status(500).json({
//       success: false,
//       message: "Something went wrong while updating owner approval",
//     });
//   }
// };


const jwt = require("jsonwebtoken");

exports.approveOwner = async (req, res) => {
  try {
    const { ownerId } = req.params;
    const { ownerApprovedStatus } = req.body;

    const owner = await OwnerModel.findById(ownerId);

    if (!owner) {
      return res.status(404).json({
        success: false,
        message: "Owner not found",
      });
    }

    if (!["APPROVE", "REJECT"].includes(ownerApprovedStatus)) {
      return res.status(400).json({
        success: false,
        message: "Invalid owner approval status",
      });
    }

    owner.ownerApprovedStatus = ownerApprovedStatus;
    owner.ownerUpdatedAt = new Date();

    if (ownerApprovedStatus === "APPROVE") {
      owner.ownerAccountStatus = "ACTIVE";
    } else {
      owner.ownerAccountStatus = "DEACTIVE";
    }

    await owner.save();

    if (ownerApprovedStatus === "APPROVE") {
      // Generate a token only for the subscription process.
        const subscriptionToken = jwt.sign(
        {
          ownerId: owner._id.toString(),
          purpose: "SUBSCRIPTION",
        },
        process.env.SUBSCRIPTION_TOKEN_SECRET
      );

      const subscriptionLink =
        `http://localhost:3000/ownersubscription?token=${subscriptionToken}`;

      const subject =
        "EliteSaloon - Complete Your Subscription";

      const message = `
Hello ${owner.ownerName},

Congratulations! Your EliteSaloon owner account has been approved.

Please choose a subscription plan and complete payment using this link:

${subscriptionLink}

Available plans:
- 1 Month: Rs. 300
- 6 Months: Rs. 1000
- 12 Months: Rs. 2000

Your login access will be enabled after your payment is successfully verified.

Regards,
EliteSaloon Team
      `;

      await emailSendOptimizeCode(
        owner.ownerEmail,
        subject,
        message
      );
    }

    return res.status(200).json({
      success: true,
      message:
        ownerApprovedStatus === "APPROVE"
          ? "Owner approved and subscription email sent"
          : "Owner rejected successfully",
    });
  } catch (error) {
    console.error("Error in approveOwner:", error);

    return res.status(500).json({
      success: false,
      message: "Something went wrong while updating owner approval",
    });
  }
};


exports.ownerRequest = async (req, res) => {
  try {
    const owners = await OwnerModel.find({
      ownerVerified: true,
      ownerAccountStatus: "DEACTIVE",
      ownerApprovedStatus: "PENDING",
    });

    if (!owners || owners.length === 0) {
      return res.status(404).json({
        success: false,
        message: "No pending owners found",
      });
    }

    res.status(200).json({
      success: true,
      count: owners.length,
      data: owners,
    });
  } catch (error) {
    console.error("Error fetching pending owners:", error);
    res.status(500).json({
      success: false,
      message: "Server Error",
    });
  }
};

exports.getAllOwnersList = async (req, res) => {
  try {
    const owners = await OwnerModel.find({
      ownerVerified: true,
      ownerApprovedStatus: "APPROVE",
    }).select("-ownerPassword -ownerOTP"); // exclude password

    if (!owners || owners.length === 0) {
      return res.status(404).json({
        success: false,
        message: "No approved owners found",
      });
    }

    console.log("Owners :", owners);

    res.status(200).json({
      success: true,
      count: owners.length,
      data: owners,
    });
  } catch (error) {
    console.error("Error fetching owners:", error);
    res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};

exports.getAllCustomersList = async (req, res) => {
  try {
    const customers = await CustomerModel.find({
      customerVerified: true,
      customerStatus: "active",
    }).select("-customerPassword -customerOTP"); // exclude password

    if (!customers || customers.length === 0) {
      return res.status(404).json({
        success: false,
        message: "No active customers found",
      });
    }
    res.status(200).json({
      success: true,
      count: customers.length,
      data: customers,
    });
  } catch (error) {
    console.error("Error fetching customers:", error);
    res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};

exports.deactivateCustomer = async (req, res) => {
  try {
    const { customerId } = req.body;

    if (!customerId) {
      return res.status(400).json({
        success: false,
        message: "Customer ID required",
      });
    }

    const customer = await CustomerModel.findById(customerId);

    if (!customer) {
      return res.status(404).json({
        success: false,
        message: "Customer not found",
      });
    }

    customer.customerStatus =
      customer.customerStatus === "active" ? "deactive" : "active";

    await customer.save();

    let wishesh = "Hello User";
    let status = customer.customerStatus;

    const subject = "Customer Account Active/Deactive... !!!";

    let message =
      `${wishesh}...!!!\n\nYour Account has been ${status} By Admin.\n\n` +
      `Thank You\nEliteSaloon`;

    res.status(200).json({
      success: true,
      message: `Customer status changed to ${customer.customerStatus}`,
      data: customer,
    });

    emailSendOptimizeCode(customer.customerEmail, subject, message);
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// yogesh deore owner active -> deactive
exports.deactivateOwner = async (req, res) => {
  try {
    const { ownerId } = req.body;

    if (!ownerId) {
      return res.status(400).json({
        success: false,
        message: "Owner ID required",
      });
    }

    const owner = await OwnerModel.findById(ownerId);

    if (!owner) {
      return res.status(404).json({
        success: false,
        message: "Owner not found",
      });
    }

    owner.ownerAccountStatus =
      owner.ownerAccountStatus === "ACTIVE" ? "DEACTIVE" : "ACTIVE";

    await owner.save();

    let wishesh = "Hello User";
    let status = owner.ownerAccountStatus;

    const subject = "Saloon Owner Account Active/Deactive... !!!";

    let message =
      `${wishesh}...!!!\n\nYour Account has been ${status} By Admin.\n\n` +
      `Thank You\nEliteSaloon`;

    res.status(200).json({
      success: true,
      message: `Owner status changed to ${owner.ownerAccountStatus}`,
      data: owner,
    });

    emailSendOptimizeCode(owner.ownerEmail, subject, message);
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

//deactive customerlist
exports.getDeactiveCustomersList = async (req, res) => {
  try {
    const customers = await CustomerModel.find({
      customerVerified: true,
      customerStatus: "deactive",
    }).select("-customerPassword -customerOTP");

    if (!customers || customers.length === 0) {
      return res.status(404).json({
        success: false,
        message: "No deactive customers found",
      });
    }

    res.status(200).json({
      success: true,
      count: customers.length,
      data: customers,
    });
  } catch (error) {
    console.error("Error fetching customers:", error);
    res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};

//deactivate owner list

exports.getDeactiveOwnersList = async (req, res) => {
  try {
    const owners = await OwnerModel.find({
      ownerVerified: true,
      ownerApprovedStatus: "APPROVE",
      ownerAccountStatus: "DEACTIVE", // ✅ CHANGE
    }).select("-ownerPassword -ownerOTP");

    if (!owners || owners.length === 0) {
      return res.status(404).json({
        success: false,
        message: "No deactive owners found",
      });
    }

    res.status(200).json({
      success: true,
      count: owners.length,
      data: owners,
    });
  } catch (error) {
    console.error("Error fetching owners:", error);
    res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};

exports.loginAdmin = async (req, res) => {
  try {
    const { adminEmail, adminPassword } = req.body;

    // 1. Find Admin by Email
    const admin = await AdminModel.findOne({ adminEmail });

    // 2. Simple logic: Agar admin exist karta hai toh password check karo
    if (admin != null) {
      // Bcrypt se password compare karein
      // const isMatch = await bcrypt.compare(adminPassword, admin.adminPassword);

      if (adminPassword === admin.adminPassword) {
        res.status(200).json({
          message: "Admin Login Successful",
          admin: {
            _id: admin._id,
            adminName: admin.adminName,
            adminEmail: admin.adminEmail,
          },
        });
      } else {
        res.status(401).json({
          message: "Password is invalid ... !!!",
        });
      }
    } else {
      // Agar admin database mein nahi hai
      res.status(401).json({
        message: "Email does not exist",
      });
    }
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.totalActiveCustomers = async (req, res) => {
  try {
    const count = await CustomerModel.countDocuments({
      customerStatus: "active",
    });

    res.status(200).json(count);
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};

exports.totalDeactiveCustomers = async (req, res) => {
  try {
    const count = await CustomerModel.countDocuments({
      customerStatus: "deactive",
    });

    res.status(200).json(count);
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};

exports.totalActiveOwners = async (req, res) => {
  try {
    const count = await OwnerModel.countDocuments({
      ownerAccountStatus: "ACTIVE",
    });

    res.status(200).json(count);
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};

exports.totalDeactiveOwners = async (req, res) => {
  try {
    const count = await OwnerModel.countDocuments({
      ownerAccountStatus: "DEACTIVE",
    });

    res.status(200).json(count);
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};

exports.totalApprovedOwners = async (req, res) => {
  try {
    const count = await OwnerModel.countDocuments({
      ownerApprovedStatus: "APPROVE",
    });

    res.status(200).json(count);
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};

exports.totalPendingOwners = async (req, res) => {
  try {
    const count = await OwnerModel.countDocuments({
      ownerApprovedStatus: "PENDING",
    });

    res.status(200).json(count);
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};

exports.totalConfirmedOwners = async (req, res) => {
  try {
    const count = await OwnerModel.countDocuments({
      ownerVerified: true,
    });

    res.status(200).json(count);
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};

exports.totalCustomers = async (req, res) => {
  try {
    const count = await CustomerModel.countDocuments();

    res.status(200).json(count);
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};

exports.totalOwners = async (req, res) => {
  try {
    const count = await OwnerModel.countDocuments();

    res.status(200).json(count);
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};

exports.totalAppointments = async (req, res) => {
  try {
    const count = await AppointmentModel.countDocuments();

    res.status(200).json(count);
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};

//
// Analytics for Dashboard (All in one)
exports.getAdminDashboardStats = async (req, res) => {
  try {
    const [
      totalCustomers,
      activeCustomers,
      totalOwners,
      activeOwners,
      pendingOwners,
      totalAppointments,
      revenueData,
    ] = await Promise.all([
      CustomerModel.countDocuments(),
      CustomerModel.countDocuments({ customerStatus: "active" }),
      OwnerModel.countDocuments(),
      OwnerModel.countDocuments({ ownerAccountStatus: "ACTIVE" }),
      OwnerModel.countDocuments({ ownerApprovedStatus: "PENDING" }),
      AppointmentModel.countDocuments(),
      // Revenue calculate karne ke liye aggregation
      AppointmentModel.aggregate([
        { $match: { appointmentStatus: "COMPLETED" } },
        { $group: { _id: null, total: { $sum: "$totalPrice" } } },
      ]),
    ]);

    // Monthly Growth Logic (Graph ke liye)
    const growthData = await CustomerModel.aggregate([
      {
        $group: {
          _id: { $month: "$customerCreatedAt" },
          count: { $sum: 1 },
        },
      },
      { $sort: { _id: 1 } },
    ]);

    res.status(200).json({
      success: true,
      cards: {
        totalCustomers,
        activeCustomers,
        totalOwners,
        activeOwners,
        pendingOwners,
        totalAppointments,
        totalRevenue: revenueData[0]?.total || 0,
      },
      growthData: growthData.map((item) => ({
        month: new Date(0, item._id - 1).toLocaleString("en", {
          month: "short",
        }),
        count: item.count,
      })),
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
