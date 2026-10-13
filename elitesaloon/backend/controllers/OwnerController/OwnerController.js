const OwnerModel = require("../../models/OwnerModel");
const bcrypt = require("bcrypt");
const emailSendOptimizeCode = require("../../utils/emailSendOptimizeCode");
const generateOTP = require("../../utils/generateOTP");
const ServiceModel = require("../../models/ServiceModel");
const ProductModel = require("../../models/ProductModel");
const StaffModel = require("../../models/StaffModel");
const AppointmentModel = require("../../models/AppointmentModel");
const mongoose = require("mongoose");
const OwnerSubscriptionModel = require("../../models/OwnerSubscriptionModel");

exports.registerOwner = async (req, res) => {
  const subject = "Mail for Register Owner in Elite Saloon";
  let message =
    "Please enter OTP for Owner registration in Elite Saloon\n\n Your OTP is :";

  try {
    const { ownerEmail } = req.body;

    let existingOwner = await OwnerModel.findOne({ ownerEmail });

    console.log("Data :", existingOwner);

    if (
      existingOwner != null &&
      !existingOwner.ownerVerified &&
      existingOwner.ownerAccountStatus === "DEACTIVE"
    ) {
      console.log("Delete unverified Recorde .... !!! ");
      await OwnerModel.deleteOne({ ownerEmail });
      existingOwner = null;
    }

    if (existingOwner === null) {
      //check images are not null
      if (!req.files) {
        return res.status(400).json({ message: "Images are required" });
      }

      req.body.ownerShopCertificate =
        req.files.ownerShopCertificate[0].filename;
      req.body.shopFrontPhoto = req.files.shopFrontPhoto[0].filename;
      req.body.shopInsidePhoto = req.files.shopInsidePhoto[0].filename;

      const owner = new OwnerModel(req.body);

      let tempPassword = passwordGenTemps();
      owner.ownerPassword = await bcrypt.hash(tempPassword.toString(), 10);
      // owner.ownerProfileImage = "backend\profiles\defaultProfile.png";

      if (req.file) {
        owner.ownerProfileImage = req.file.filename;
      } else {
        owner.ownerProfileImage = "defaultProfile.png";
      }

      let otp = await generateOTP();
      message = message + otp;

      const generatedOTP = await emailSendOptimizeCode(
        owner.ownerEmail,
        subject,
        message,
      );

      if (generatedOTP) {
        // Check if OTP generation and email sending was successful
        owner.ownerOTP = otp; // Generate OTP and store it in the customer's record in the database

        // Save Owner BEFORE sending response to ensure that the OTP is stored in the database and can be verified later
        await owner.save();

        res.status(201).json({
          message: "Redirect To Verification Otp Page",
          ownerEmail: owner.ownerEmail,
        });
      } else {
        res.status(500).json({
          message: "Failed to send OTP to customer email",
        });
      }
    } else {
      if (
        existingOwner.ownerAccountStatus === "DEACTIVE" &&
        existingOwner.ownerApprovedStatus === "PENDING"
      ) {
        return res.status(409).json({
          success: false,
          message: "Your application is in process with this Email",
        });
      } else {
        return res.status(409).json({
          success: false,
          message: "Email already exists",
        });
      }
    }
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error registering owner", error: error.message });
  }
};

function passwordGenTemps() {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

// exports.loginOwner = async (req, res) => {
//   const { ownerEmail, ownerPassword } = req.body;

//   const owner = await OwnerModel.findOne({ ownerEmail });

//   // console.log(owner);

//   if (
//     owner != null &&
//     owner.ownerVerified &&
//     owner.ownerAccountStatus === "ACTIVE" &&
//     owner.ownerApprovedStatus === "APPROVE"
//   ) {
//     const isMatch = await bcrypt.compare(ownerPassword, owner.ownerPassword);

//     if (isMatch) {
//       res.status(200).json({
//         message: "Owner Login Successful",
//         owner: owner.toObject(),
//       });
//     } else {
//       res.status(401).json({
//         message: "Password is invalid ... !!!",
//       });
//     }
//   } else {
//     if (owner == null) {
//       res.status(401).json({
//         message: "Email does not exist",
//       });
//     } else if (
//       owner.ownerAccountStatus !== "ACTIVE" &&
//       owner.ownerApprovedStatus !== "APPROVE"
//     ) {
//       res.status(401).json({
//         message: "You are not APPROVED By admin",
//       });
//     } else {
//       res.status(401).json({
//         message: "You are temprory Deactivated By ADMIN",
//       });
//     }
//   }
// };

exports.loginOwner = async (req, res) => {
  const { ownerEmail, ownerPassword } = req.body;

  const owner = await OwnerModel.findOne({ ownerEmail });

  // Owner does not exist
  if (owner == null) {
    return res.status(401).json({
      message: "Email does not exist",
    });
  }

  // Admin approval check
  if (
    !owner.ownerVerified ||
    owner.ownerApprovedStatus !== "APPROVE"
  ) {
    return res.status(401).json({
      message: "You are not APPROVED By admin",
    });
  }

  // Owner account status check
  if (owner.ownerAccountStatus !== "ACTIVE") {
    return res.status(401).json({
      message: "Your account is temporarily deactivated by ADMIN",
    });
  }

  // Password check
  const isMatch = await bcrypt.compare(
    ownerPassword,
    owner.ownerPassword
  );

  if (!isMatch) {
    return res.status(401).json({
      message: "Password is invalid ... !!!",
    });
  }

  // Find owner's latest active subscription
  const subscription = await OwnerSubscriptionModel.findOne({
    ownerId: owner._id,
    status: "ACTIVE",
  }).sort({ endDate: -1 });

  // No active subscription
  if (!subscription) {
    return res.status(403).json({
      message: "Please purchase a subscription to continue.",
    });
  }

  // Check subscription expiry
  const currentDate = new Date();

  if (subscription.endDate <= currentDate) {

    // Mark subscription as expired
    subscription.status = "EXPIRED";
    await subscription.save();

    return res.status(403).json({
      message: "Your subscription has expired. Please renew your subscription.",
    });
  }

  // Everything is valid
  return res.status(200).json({
    message: "Owner Login Successful",
    owner: owner.toObject(),
    subscription: {
      subscriptionId: subscription._id,
      planId: subscription.planId,
      startDate: subscription.startDate,
      endDate: subscription.endDate,
      status: subscription.status,
    },
  });
};

exports.verifyOTP = async (req, res) => {
  try {
    const { ownerEmail, otp } = req.body;
    console.log("OTP received from owner :" + otp);

    const owner = await OwnerModel.findOne({ ownerEmail });

    if (owner != null) {
      if (owner.ownerOTP === otp) {
        owner.ownerVerified = true; // Set customerVerified to true after successful OTP verification
        owner.ownerOTP = null; // Clear the OTP after successful verification
        owner.ownerUpdatedAt = Date.now();
        await owner.save();

        res.status(200).json({
          message: "OTP verification successfull .... Wait for approvals",
        });

        const shopName = owner.ownerShopName;

        let subject = `Application Status for ${shopName}`;
        let message =
          "We receive your application for " +
          shopName +
          "." +
          "We will review your application, verify it and then send you mail.\n\nPlease check regular mail.";

        emailSendOptimizeCode(ownerEmail, subject, message);
      } else {
        res.status(400).json({ message: "enter valid OTP" });
      }
    } else {
      console.log("owner not found for OTP verification");
      res.status(404).json({ message: "Customer not found" });
    }
  } catch (error) {
    console.log("Error in OTP verification :", error.message);
    res.status(500).json({
      error: "Internal error in OTP verification",
      details: error.message,
    });
  }
};

exports.updateOwnerProfile = async (req, res) => {
  try {
    const ownerId = req.params.id;

    const { ownerName, ownerMobile, ownerShopName } = req.body;

    const owner = await OwnerModel.findById(ownerId);

    if (!owner) {
      return res.status(404).json({
        success: false,
        message: "Owner not found",
      });
    }

    // Update fields
    if (ownerName) owner.ownerName = ownerName;
    if (ownerMobile) owner.ownerMobile = ownerMobile;
    if (ownerShopName) owner.ownerShopName = ownerShopName;

    // Profile Image Update
    if (req.file) {
      owner.ownerProfileImage = req.file.filename;
    }

    owner.ownerUpdatedAt = Date.now();

    await owner.save();

    res.status(200).json({
      success: true,
      message: "Owner profile updated successfully",
      data: owner,
    });
  } catch (error) {
    console.error("Update Owner Error:", error);
    res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};

exports.forgotPassword = async (req, res) => {
  const { ownerEmail } = req.body;
  console.log("Owner Email Received:", ownerEmail);
  const owner = await OwnerModel.findOne({ ownerEmail });
  console.log("Owner Found:", owner);
  if (owner != null) {
    let subject = "Mail for Reset Password in Elite Saloon";
    let message =
      "Please enter OTP for reset password in Elite Saloon\n\n Your OTP is :";
    let otp = await generateOTP();

    message = message + otp;

    const generatedOTP = await emailSendOptimizeCode(
      ownerEmail,
      subject,
      message,
    );

    if (generatedOTP) {
      owner.ownerOTP = otp; // Store the generated OTP in the customer's record in the database
      await owner.save(); // Save the updated customer record with the new OTP

      res.status(200).json({
        message:
          "OTP sent successfully to owner email ... redirect to OTP verification page for reset password",
        ownerEmail: owner.ownerEmail,
      });
    } else {
      res.status(500).json({
        message: "Failed to send OTP to owner email",
      });
    }
  } else {
    res.status(404).json({
      message: "Owner not found with the provided email address",
    });
  }
};

exports.resetPassword = async (req, res) => {
  const { ownerEmail, newPassword } = req.body;
  const owner = await OwnerModel.findOne({ ownerEmail });
  if (owner != null) {
    owner.ownerPassword = bcrypt.hashSync(newPassword, 10); // Hash the new password before saving
    owner.ownerOTP = null;
    owner.ownerUpdatedAt = Date.now();
    await owner.save();
    res.status(200).json({
      message: "Password reset successful",
    });
  }
};

exports.addService = async (req, res) => {
  try {
    const serviceImages = req.files.map((file) => file.filename);

    const ownerId = req.body.ownerId; // if using auth middleware

    // Create service
    const service = new ServiceModel({
      ...req.body,
      ownerId: ownerId,
      serviceImages: serviceImages,
    });

    await service.save();

    res.status(201).json({
      success: true,
      message: "Service Added Successfully",
      service,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error Adding Service",
      error: error.message,
    });
  }
};

exports.updateService = async (req, res) => {
  try {
    const { serviceId } = req.params;
    // const { ownerId } = req.body;

    // console.log("Service Id:", serviceId);
    // console.log("Owner Id:", ownerId);
    // console.log("Body:", req.body);

    // Find service with owner check
    const service = await ServiceModel.findOne({
      _id: serviceId,
      // ownerId: ownerId
    });

    if (!service) {
      return res.status(404).json({
        success: false,
        message: "Service Not Found or Unauthorized",
      });
    }

    // Update fields
    Object.assign(service, req.body);

    // Handle images
    if (req.files && req.files.length > 0) {
      const serviceImages = req.files.map((file) => file.filename);
      service.serviceImages = serviceImages;
    }

    await service.save();

    res.status(200).json({
      success: true,
      message: "Service Updated Successfully",
      service,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error Updating Service",
      error: error.message,
    });
  }
};

exports.searchServices = async (req, res) => {
  try {
    const { serviceId } = req.params;
    const { ownerId } = req.bod; // send ownerId in query

    console.log("Service Id:", serviceId);
    console.log("Owner Id:", ownerId);

    const service = await ServiceModel.findOne({
      _id: serviceId,
      ownerId: ownerId,
    });

    if (!service) {
      return res.status(404).json({
        success: false,
        message: "Service Not Found",
      });
    }

    res.status(200).json({
      success: true,
      message: "Service Fetched Successfully",
      service,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error Searching Service",
      error: error.message,
    });
  }
};

exports.searchServicesByOwnerId = async (req, res) => {
  try {
    // const { serviceId } =
    const { ownerId } = req.params; // send ownerId in query
    console.log("Owner Id:", ownerId);

    const services = await ServiceModel.find({
      ownerId: ownerId,
    });

    if (!services) {
      return res.status(404).json({
        success: false,
        message: "Service Not Found",
      });
    } else {
      res.status(200).json({
        success: true,
        totalServices: services.length,
        message: "Owner services fetched successfully",
        services: services || [], // always array
      });
    }
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error Searching Service",
      error: error.message,
    });
  }
};

// exports.viewAllServices = async (req, res) => {

//     try {

//         const { ownerId } = req.body;

//         const services = await ServiceModel.find({ ownerId: ownerId });

//         res.status(200).json({
//             success: true,
//             totalServices: services.length,
//             message: "Owner services fetched successfully",
//             services
//         });

//     } catch (error) {

//         res.status(500).json({
//             success: false,
//             message: "Error fetching services",
//             error: error.message
//         });

//     }

// };

exports.deleteService = async (req, res) => {
  try {
    const { serviceId } = req.params;
    // const { ownerId } = req.body;

    console.log("Service Id:", serviceId);
    // console.log("Owner Id:", ownerId);

    const service = await ServiceModel.findOneAndDelete({
      _id: serviceId,
      // ownerId: ownerId
    });

    if (!service) {
      return res.status(404).json({
        success: false,
        message: "Service Not Found or Unauthorized",
      });
    }

    res.status(200).json({
      success: true,
      message: "Service Deleted Successfully",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error Deleting Service",
      error: error.message,
    });
  }
};

exports.addProduct = async (req, res) => {
  try {
    const productImages = req.files.map((file) => file.filename);

    const product = new ProductModel(req.body);

    product.productImages = productImages;

    await product.save();

    res.status(201).json({
      success: true,
      message: "Product Added Successfully",
      product,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error Adding Product",
      error: error.message,
    });
  }
};

exports.viewAllProductsByOwnerId = async (req, res) => {
  try {
    const { ownerId } = req.params;

    const products = await ProductModel.find({ ownerId: ownerId });

    res.status(200).json({
      success: true,
      totalProducts: products.length,
      products: products,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error Fetching Products",
      error: error.message,
    });
  }
};

exports.searchProduct = async (req, res) => {
  try {
    const { productId } = req.params;

    const product = await ProductModel.findOne({
      _id: productId,
      ownerId: req.body.ownerId,
    });

    if (!product) {
      return res.status(404).json({
        success: false,
        message: "Product Not Found or Unauthorized",
      });
    }

    res.status(200).json({
      success: true,
      product,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error Fetching Product",
      error: error.message,
    });
  }
};

exports.updateProduct = async (req, res) => {
  try {
    const { productId } = req.params;
    console.log("Product Id", productId);
    const updateData = req.body;
    console.log("Data :", updateData);

    if (req.files && req.files.length > 0) {
      updateData.productImages = req.files.map((file) => file.filename);
    }

    const product = await ProductModel.findOneAndUpdate(
      { _id: productId, ownerId: req.body.ownerId }, // added owner check
      updateData,
      { new: true },
    );

    if (!product) {
      return res.status(404).json({
        success: false,
        message: "Product Not Found or Unauthorized",
      });
    }

    res.status(200).json({
      success: true,
      message: "Product Updated Successfully",
      product,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error Updating Product",
      error: error.message,
    });
  }
};

exports.deleteProduct = async (req, res) => {
  try {
    const { productId } = req.params;

    const product = await ProductModel.findOneAndDelete({
      _id: productId,
      // ownerId: req.body.ownerId
    });

    if (!product) {
      return res.status(404).json({
        success: false,
        message: "Product Not Found or Unauthorized",
      });
    }

    res.status(200).json({
      success: true,
      message: "Product Deleted Successfully",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error Deleting Product",
      error: error.message,
    });
  }
};

exports.addStaff = async (req, res) => {
  const subject = "Staff Registration in Elite Saloon";
  let message =
    "Please enter OTP for Staff Verification in Elite Saloon\n\n Your OTP is : ";

  try {
    const { staffEmail } = req.body;
    const { ownerId } = req.params;

    console.log("Request Data :", req.body);

    let existingStaff = await StaffModel.findOne({ staffEmail });

    console.log("Existing Staff :", existingStaff);

    // Delete old unverified staff
    if (existingStaff !== null && !existingStaff.isVerified) {
      console.log("Deleting old unverified staff...");
      await StaffModel.deleteOne({ staffEmail });
      existingStaff = null;
    }

    if (existingStaff === null) {
      const staff = new StaffModel(req.body);

      // staff.staffProfile = req.file.filename;
      if (req.file) {
        staff.staffProfile = req.file.filename;
      } else {
        staff.staffProfile = "defaultProfile.png";
      }

      // Generate OTP
      let otp = await generateOTP();

      message = message + otp;

      const generatedOTP = await emailSendOptimizeCode(
        staff.staffEmail,
        subject,
        message,
      );

      if (generatedOTP) {
        staff.staffOTP = otp;

        await staff.save();

        res.status(201).json({
          success: true,
          message: "Redirect To Staff OTP Verification Page",
          staffEmail: staff.staffEmail,
        });
      } else {
        res.status(500).json({
          success: false,
          message: "Failed to send OTP to staff email",
        });
      }
    } else {
      return res.status(409).json({
        success: false,
        message: "Staff Email Already Exists",
      });
    }
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error Adding Staff",
      error: error.message,
    });
  }
};

exports.staffOTPverify = async (req, res) => {
  try {
    const { staffEmail, otp } = req.body;
    const staff = await StaffModel.findOne({ staffEmail });

    if (staff != null) {
      if (staff.staffOTP == otp) {
        staff.isVerified = true;
        staff.staffOTP = null;

        await staff.save();

        res.status(200).json({
          message: "OTP verification successfull ... !!!",
        });
      } else {
        res.status(400).json({ message: "enter valid OTP" });
      }
    } else {
      res.status(404).json({ message: "staff not found" });
    }
  } catch (error) {
    res.status(500).json({
      error: "Internal error in OTP verification",
      details: error.message,
    });
  }
};

exports.updateStaff = async (req, res) => {
  try {
    const { staffId } = req.params;

    console.log("Staff ID :", staffId);
    console.log("Body Data :", req.body);

    const staff = await StaffModel.findById(staffId);

    if (!staff) {
      return res.status(404).json({
        success: false,
        message: "Staff not found",
      });
    }

    // Update fields
    if (req.body.staffName) {
      staff.staffName = req.body.staffName;
    }

    if (req.body.staffPhone) {
      staff.staffPhone = req.body.staffPhone;
    }

    if (req.body.staffAddress) {
      staff.staffAddress = req.body.staffAddress;
    }

    // Update profile image if new file uploaded
    if (req.file) {
      staff.staffProfile = req.file.filename;
    }

    await staff.save();

    res.status(200).json({
      success: true,
      message: "Staff updated successfully",
      staff,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error updating staff",
      error: error.message,
    });
  }
};

exports.deleteStaff = async (req, res) => {
  try {
    const { staffId } = req.params;

    console.log("Deleting Staff ID :", staffId);

    const staff = await StaffModel.findById(staffId);

    if (!staff) {
      return res.status(404).json({
        success: false,
        message: "Staff not found",
      });
    }

    await StaffModel.findByIdAndDelete(staffId);

    res.status(200).json({
      success: true,
      message: "Staff deleted successfully",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error deleting staff",
      error: error.message,
    });
  }
};

exports.getOwnerStaff = async (req, res) => {
  try {
    const { ownerId } = req.params;

    console.log("Owner ID :", ownerId);

    const staffList = await StaffModel.find({
      ownerId: ownerId,
      isVerified: true,
    });

    res.status(200).json({
      success: true,
      totalStaff: staffList.length,
      staff: staffList,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error fetching staff list",
      error: error.message,
    });
  }
};


//resend otp
exports.resendOwnerOtp = async (req, res) => {
  try {
    const { ownerEmail } = req.body;

    // 1. Check karo ki owner exist karta hai ya nahi
    const owner = await OwnerModel.findOne({ ownerEmail });

    if (!owner) {
      return res.status(404).json({
        message: "Owner not found",
      });
    }

    // 2. Email subject aur message content set karo
    const subject = "Resend OTP for Elite Saloon Owner Verification";

    let message =
      "Please enter OTP for Owner registration in Elite Saloon\n\n Your OTP is :";

    // 3. Naya OTP generate karo
    let otp = await generateOTP();

    message = message + otp;

    // 4. Email send karo
    const generatedOTP = await emailSendOptimizeCode(
      owner.ownerEmail,
      subject,
      message
    );

    if (generatedOTP) {
      // 5. Database me naya OTP update aur save karo
      owner.ownerOTP = otp;

      await owner.save();

      return res.status(200).json({
        message: "OTP Resent Successfully",
      });
    } else {
      return res.status(500).json({
        message: "Failed to resend OTP to owner email",
      });
    }
  } catch (error) {
    console.log("Resend Owner OTP Error:", error);

    res.status(500).json({
      message: "Internal Server Error",
      error: error.message,
    });
  }
};



// ==========================================
// 1. TOTAL UNIQUE CUSTOMERS FOR AN OWNER
// ==========================================
exports.totalOwnerCustomers = async (req, res) => {
  try {
    const { ownerId } = req.params;

    if (!ownerId || !mongoose.Types.ObjectId.isValid(ownerId)) {
      return res.status(400).json({ message: "Valid Owner ID parameter is required" });
    }

    const ownerObjectId = new mongoose.Types.ObjectId(ownerId);

    const distinctCustomers = await AppointmentModel.aggregate([
      { $match: { ownerId: ownerObjectId } },
      { $group: { _id: "$customerId" } },
      { $count: "uniqueCount" }
    ]);

    const count = distinctCustomers[0]?.uniqueCount || 0;
    return res.status(200).json(count);
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Error counting unique owner customers",
      error: error.message,
    });
  }
};

// ==========================================
// 2. TOTAL SERVICES LISTED BY AN OWNER
// ==========================================
exports.totalOwnerServices = async (req, res) => {
  try {
    const { ownerId } = req.params;

    if (!ownerId) {
      return res.status(400).json({ message: "Owner ID parameter is required" });
    }

    const count = await ServiceModel.countDocuments({ ownerId: ownerId });
    return res.status(200).json(count);
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Error counting owner services",
      error: error.message,
    });
  }
};

// ==========================================
// 3. TOTAL EARNINGS FOR AN OWNER (COMPLETED ONLY)
// ==========================================
exports.totalOwnerEarning = async (req, res) => {
  try {
    const { ownerId } = req.params;

    if (!ownerId || !mongoose.Types.ObjectId.isValid(ownerId)) {
      return res.status(400).json({ message: "Valid Owner ID parameter is required" });
    }

    const ownerObjectId = new mongoose.Types.ObjectId(ownerId);

    const earningData = await AppointmentModel.aggregate([
      {
        $match: {
          ownerId: ownerObjectId,
          appointmentStatus: "COMPLETED"
        }
      },
      {
        $group: {
          _id: null,
          total: { $sum: "$totalPrice" }
        }
      }
    ]);

    const totalEarning = earningData[0]?.total || 0;
    return res.status(200).json(totalEarning);
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Error calculating owner total earnings",
      error: error.message,
    });
  }
};

// ==========================================
// 4. TOTAL APPOINTMENTS RECEIVED BY AN OWNER
// ==========================================
exports.totalOwnerAppointments = async (req, res) => {
  try {
    const { ownerId } = req.params;

    if (!ownerId) {
      return res.status(400).json({ message: "Owner ID parameter is required" });
    }

    const count = await AppointmentModel.countDocuments({ ownerId: ownerId });
    return res.status(200).json(count);
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Error counting owner appointments",
      error: error.message,
    });
  }
};

// ==========================================
// 5. UNIFIED ALL-IN-ONE ANALYTICS (FOR GRAPH & REPORT COMPONENT)
// ==========================================
exports.getOwnerDashboardStats = async (req, res) => {
  try {
    const { ownerId } = req.params;

    if (!ownerId || !mongoose.Types.ObjectId.isValid(ownerId)) {
      return res.status(400).json({ success: false, message: "Valid Owner ID is required" });
    }

    const ownerObjectId = new mongoose.Types.ObjectId(ownerId);

    // Parallel execution using Promise.all for high performance
    const [
      totalServices,
      totalProducts,
      totalStaff,
      totalAppointments,
      earningData,
      distinctCustomers
    ] = await Promise.all([
      ServiceModel.countDocuments({ ownerId: ownerId }),
      ProductModel.countDocuments({ ownerId: ownerId }),
      StaffModel.countDocuments({ ownerId: ownerId, isVerified: true }),
      AppointmentModel.countDocuments({ ownerId: ownerId }),
      AppointmentModel.aggregate([
        { $match: { ownerId: ownerObjectId, appointmentStatus: "COMPLETED" } },
        { $group: { _id: null, total: { $sum: "$totalPrice" } } }
      ]),
      AppointmentModel.aggregate([
        { $match: { ownerId: ownerObjectId } },
        { $group: { _id: "$customerId" } },
        { $count: "uniqueCount" }
      ])
    ]);

    // String Date splitting logic targeting "YYYY-MM-DD" schema structures securely
    const growthData = await AppointmentModel.aggregate([
      { $match: { ownerId: ownerObjectId } },
      {
        $group: {
          _id: { $substr: ["$appointmentDate", 5, 2] }, // Cuts the "MM" portion
          count: { $sum: 1 }
        }
      },
      { $sort: { _id: 1 } }
    ]);

    return res.status(200).json({
      success: true,
      cards: {
        totalCustomers: distinctCustomers[0]?.uniqueCount || 0,
        totalServices,
        totalProducts,
        totalStaff,
        totalAppointments,
        totalEarning: earningData[0]?.total || 0,
      },
      growthData: growthData.map((item) => {
        const monthIndex = parseInt(item._id, 10);
        return {
          month: isNaN(monthIndex) || monthIndex < 1 || monthIndex > 12
            ? "Unknown"
            : new Date(0, monthIndex - 1).toLocaleString("en", { month: "short" }),
          count: item.count,
        };
      }),
    });

  } catch (error) {
    console.error("Dashboard Stats Engine Crash:", error);
    return res.status(500).json({ success: false, message: error.message });
  }
};