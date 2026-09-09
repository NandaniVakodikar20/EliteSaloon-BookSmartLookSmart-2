const CustomerModel = require("../../models/CustomerModel");
const OwnerModel = require("../../models/OwnerModel");
const ProductModel = require("../../models/ProductModel");
const ServiceModel = require("../../models/ServiceModel");
const bcrypt = require("bcrypt");
const { customerFindUsingEmail } = require("./CustomerOptimizeCode");
const emailSendOptimizeCode = require("../../utils/emailSendOptimizeCode");
const generateOTP = require("../../utils/generateOTP");
const AppointmentModel = require("../../models/AppointmentModel");
const jwt = require("jsonwebtoken");
const { findNearbyOwners } = require('../../map-cordinates/CordinatesOptimizeCode');

/**
 * Author : Yogesh Badgujar
 * Date : 06-02-2026
 * Description : This is the controller for customer registration. It handles the logic for registering a new customer.
 * @param {*} req - In this function, we are receiving the request body which contains the customer details that we want to save in the database.
 * @param {*} res - In this function, we are sending the response back to the client after processing the registration request.
 *                  We will send a success message if the registration is successful, or an error message if there is an issue with the registration process.
 * @returns - In this function, we will return a JSON response to the client indicating the success or failure of the registration process.
 *            If the registration is successful, we will return a message indicating that the customer has been registered successfully. If there is an error during the registration process,
 *            we will return an error message with details about the issue.
 */
exports.registerCustomer = async (req, res) => {
  const subject = "Mail for Register in Elite Saloon";
  let message =
    "Please enter OTP for customer registration in Elite Saloon\n\n Your OTP is :";

  // console.log(req.body);
  try {
    const { customerUsername, customerEmail } = req.body;
    console.log("Request Body Username :" + customerUsername);
    console.log("Request Body Email :" + customerEmail);

    let existingCustomer = await CustomerModel.findOne({ customerUsername });
    let existingEmail = await customerFindUsingEmail(customerEmail);

    /**
     * This condition is added to handle the case when a customer tries to register with an email that has already been used for registration but the email is not verified yet.
     * In this case, we will delete the existing customer data associated with that email and allow the new registration to proceed.
     * This way, we can ensure that only one customer can register with a particular email address, and if the email is not verified, we can allow another customer to register with the same email address without any issues.
     */
    if (
      existingEmail == null &&
      existingCustomer != null &&
      existingCustomer.customerVerified === false
    ) {
      console.log("delete this data because email is not varified ... !!!");
      await CustomerModel.deleteOne({ customerUsername });
      existingCustomer = null; // Set existingCustomer to null after deleting the existing customer data

      console.log("Existing Customer after deletion :" + existingCustomer);
    }

    if (existingCustomer == null && existingEmail == null) {
      console.log("You can save data ... !!!");

      // Remove confirmPassword before saving
      const customerData = { ...req.body };
      delete customerData.customerConfirmPassworld;

      // Create customer properly
      const customer = new CustomerModel(customerData);

      // Hash password safely
      // Hash password safely
      if (!req.body.customerPassword) {
        return res.status(400).json({
          message: "Password is required",
        });
      }

      customer.customerPassword = await bcrypt.hash(
        req.body.customerPassword.toString(),
        10,
      );

      // customer.customerPassword = bcrypt.hashSync(req.body.customerPassword, 10);

      //print customer data in console for checking data before saving in database
      console.log(customer);

      //By default, multer will save the uploaded file in the specified destination folder and provide the file path in req.file.path. We can directly assign this path to the customerProfileImage field in our customer model before saving it to the database.

      /**
       *Send email to customer for OTP verification
       *@returns {string} The generated OTP that is sent to the customer's email address.
       * This OTP is also stored in the customer's record in the database for later verification during the OTP verification process.
       * */

      let otp = await generateOTP();
      message = message + otp;

      const generatedOTP = await emailSendOptimizeCode(
        customer.customerEmail,
        subject,
        message,
      ); // Send email with OTP to the customer's email address; // Generate OTP and store it in the variable
      console.log("Generated OTP for registration :" + generatedOTP);

      if (generatedOTP) {
        // Check if OTP generation and email sending was successful

        customer.customerOTP = otp; // Generate OTP and store it in the customer's record in the database
        customer.customerVerified = false; // Set customerVerified to false until OTP is verified

        // Save customer BEFORE sending response to ensure that the OTP is stored in the database and can be verified later
        await customer.save();

        res.status(200).json({
          message: "redirect to OTP verification page",
          customerEmail: customer.customerEmail,
        });
      } else {
        res.status(500).json({
          message: "Failed to send OTP to customer email",
        });
      }
    } else {
      if (existingEmail != null) {
        console.log("Email already exists");
        return res.status(409).json({ message: "Email already exists" });
      } else {
        console.log("Username already exists");
        return res.status(409).json({ message: "Username already exists" });
      }
    }
  } catch (error) {
    console.log("Register Error:", error);
    res.status(500).json({
      error: "Internal error in Customer Saving",
      details: error.message,
    });
  }
};

/**
 * Author : Yogesh Badgujar
 * Date : 06-02-2026
 * Description : This is the controller for customer login. It handles the logic for authenticating a customer based on their username and password.
 * @param {*} req - In this function, we are receiving the request body which contains the customer login credentials (username and password) that we want to authenticate against the database.
 * @param {*} res - In this function, we are sending the response back to the client after processing the login request. We will send a success message if the login is successful, or an error message if there is an issue with the login process.
 * @returns - In this function, we will return a JSON response to the client indicating the success or failure of the login process. If the login is successful,
 *            we will return a message indicating that the customer has logged in successfully. If there is an error during the login process, we will return an error message with details about the issue.
 */

exports.loginCustomer = async (req, res) => {
  // console.log("Inside Customer Login Controller");

  try {
    const { customerUsername, customerPassword } = req.body;

    const customer = await CustomerModel.findOne({ customerUsername });
    console.log("Customer Data print :", customer);

    if (customer != null) {
      const isMatch = await bcrypt.compare(
        customerPassword,
        customer.customerPassword,
      );
      console.log("Password Match Result :" + isMatch);

      // Check if the password matches and the customer is verified and active
      if (
        isMatch &&
        customer.customerVerified &&
        customer.customerStatus === "active"
      ) {

        const token = jwt.sign(
          {
            // customer : customer.toObject(),
            customerId: customer._id,
            customerUsername: customer.customerUsername
          },
          process.env.JWT_SECRET_KEY, { expiresIn: "1h" }
        );

        res.status(200).json({
          message: "Customer Login Successful and JWT Token Generated",
          token: token
        });
      } else if (customer.customerStatus === "deactive") {
        res.status(401).json({
          message: "Deactivated By Admin",
        });
      } else {
        return res.status(401).json({
          message: "Invalid Password",
        });
      }
    } else {
      // console.log("Invalid Username or Password");
      res.status(401).json({
        message: "Username does not exist",
      });
    }
  } catch (error) {
    console.log("Error in Customer Login :", error.message);
    res.status(500).json({
      error: "Internal error in Customer Login",
      details: error.message,
    });
  }
};

/**
 *
 * @param {customerEmail, otp } req This function receives the customer email and OTP from the request body,
 * when the customer tries to verify their email address using the OTP sent to their email.
 * @param {*} res This function sends a response back to the client indicating whether the OTP verification was successful or not. If the OTP is correct,
 * it will update the customer's record in the database to mark them as verified and active, and send a success message.
 * If the OTP is incorrect, it will send an error message indicating that the OTP is invalid.
 * If there is an issue with finding the customer or any other error during the process,
 * it will send an appropriate error message with details about the issue.
 * @returns This function returns a JSON response to the client indicating the result of the OTP verification process.
 * If the OTP verification is successful, it will return a message indicating that the OTP verification was successful.
 *  If the OTP verification fails due to an invalid OTP, it will return a message indicating that the OTP is invalid.
 * If there is an issue with finding the customer or any other error during the process, it will return an error message with details about the issue.
 */
exports.verifyOTP = async (req, res) => {
  try {
    const { customerEmail, otp } = req.body;
    console.log("OTP received from client :" + otp);

    const customer = await customerFindUsingEmail(customerEmail);

    if (customer != null) {
      if (customer.customerOTP === otp) {
        customer.customerVerified = true; // Set customerVerified to true after successful OTP verification
        customer.customerOTP = null; // Clear the OTP after successful verification
        customer.customerStatus = "active"; // Update customer status to active after successful verification
        customer.customerUpdatedAt = Date.now();
        await customer.save();

        res.status(200).json({
          message: "OTP verification successful",
          customerEmail: customer.customerEmail,
        });
      } else {
        res.status(400).json({ message: "enter valid OTP" });
      }
    } else {
      console.log("Customer not found for OTP verification");
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

/**
 * Author : Yogesh Badgujar
 * Date : 12-02-2026
 * Description : This is the controller for handling the forgot password functionality for customers.
 * It allows customers to request a password reset by providing their email address.
 *
 */
exports.forgotPassword = async (req, res) => {
  const { customerEmail } = req.body;
  const customer = await customerFindUsingEmail(customerEmail);

  if (customer != null) {
    let subject = "Mail for Reset Password in Elite Saloon";
    let message =
      "Please enter OTP for reset password in Elite Saloon\n\n Your OTP is :";
    let otp = await generateOTP();

    message = message + otp;

    const generatedOTP = await emailSendOptimizeCode(
      customerEmail,
      subject,
      message,
    );

    if (generatedOTP) {
      customer.customerOTP = otp; // Store the generated OTP in the customer's record in the database
      await customer.save(); // Save the updated customer record with the new OTP

      res.status(200).json({
        message:
          "OTP sent successfully to customer email ... redirect to OTP verification page for reset password",
        customerEmail: customer.customerEmail,
      });
    } else {
      res.status(500).json({
        message: "Failed to send OTP to customer email",
      });
    }
  } else {
    res.status(404).json({
      message: "Customer not found with the provided email address",
    });
  }
};

// /**
//  * Author : Yogesh Badgujar
//  * Date : 12-02-2026
//  * Description : This is the controller for matching the OTP provided by the customer during the password reset process.
//  * @param {*} req  - In this function, we are receiving the request body
//  * which contains the customer email and the OTP that the customer has entered for verification during the password reset process.
//  * @param {*} res - In this function, we are sending the response back to the client after processing the OTP verification request for password reset.
//  * @returns - In this function, we will return a JSON response to the client indicating whether the OTP verification for password reset was successful or not.
//  * If the OTP is correct, we will return a message indicating that the OTP verification was successful and the customer can proceed to reset their password.
//  * If the OTP is incorrect, we will return a message indicating that the OTP is invalid for password reset.
//  * If there is an issue with finding the customer or any other error during the process, we will return an appropriate error message with details about the issue.
//  */
// exports.matchOTP = async (req, res) => {
//   const { customerEmail, otp } = req.body;
//   const customer = await customerFindUsingEmail(customerEmail);
//   if (customer != null) {
//     if (customer.customerOTP === otp) {

//         customer.customerOTP = null ;
//         customer.save();

//       res.status(200).json({
//         message:
//           "OTP verification successful for password reset ... redirect to reset password page",
//         customerEmail: customer.customerEmail,
//       });
//     } else {
//       res.status(400).json({
//         message: "Invalid OTP provided for password reset",
//       });
//     }
//   }
// };

/**
 * Author : Yogesh Badgujar
 * Date : 12-02-2026
 * Description : This is the controller for resetting the customer's password after successful OTP verification during the forgot password process.
 * @param {*} req - In this function, we are receiving the request body which contains the customer email and the new password that the customer wants to set after successful OTP verification.
 * @param {*} res - In this function, we are sending the response back to the client after processing the password reset request. We will send a success message if the password reset is successful,
 * or an error message if there is an issue with the password reset process.
 * @returns - In this function, we will return a JSON response to the client indicating the success or failure of the password reset process. If the password reset is successful,
 *  we will return a message indicating that the password has been reset successfully. If there is an error during the password reset process, we will return an error message with details about the issue.
 */

exports.resetPassword = async (req, res) => {
  const { customerEmail, newPassword } = req.body;
  const customer = await customerFindUsingEmail(customerEmail);
  if (customer != null) {
    customer.customerPassword = bcrypt.hashSync(newPassword, 10); // Hash the new password before saving
    customer.customerOTP = null;
    customer.customerUpdatedAt = Date.now();
    await customer.save();
    res.status(200).json({
      message: "Password reset successful",
    });
  }
};

/**
 * add image controller
 * @param {*} req
 * @param {*} res
 * @returns
 */
exports.uploadProfileImage = async (req, res) => {
  try {
    const { customerEmail } = req.body;

    const customer = await customerFindUsingEmail(customerEmail);

    if (!customer) {
      return res.status(404).json({ message: "Customer not found" });
    }

    // If user selected image
    if (req.file) {
      customer.customerProfileImage = req.file.filename; // Save the filename of the uploaded image to the customer's record in the database
    } else {
      customer.customerProfileImage = "default/defaultProfile.png";
      // customer.customerProfileImage = "defaultProfile.png";
    }

    // customer.customerStatus = "active";

    await customer.save();

    res.status(200).json({
      message: "Profile image updated successfully",
      customerProfileImage: customer.customerProfileImage,
    });
  } catch (error) {
    res.status(500).json({
      error: "Error uploading profile image",
      details: error.message,
    });
  }
};

exports.updateCustomerProfile = async (req, res) => {
  try {
    const customerId = req.data.customerId;

    const {
      customerName,
      customerMobile,
      customerStreet,
      customerPincode,
      customerBlock,
      customerCity,
      customerDistrict,
      customerState,
    } = req.body;

    const customer = await CustomerModel.findById(customerId);

    if (!customer) {
      return res.status(404).json({
        success: false,
        message: "Customer not found",
      });
    }

    if (customerName) customer.customerName = customerName;
    if (customerMobile) customer.customerMobile = customerMobile;
    if (customerStreet) customer.customerStreet = customerStreet;
    if (customerPincode) customer.customerPincode = customerPincode;
    if (customerBlock) customer.customerBlock = customerBlock;
    if (customerCity) customer.customerCity = customerCity;
    if (customerDistrict) customer.customerDistrict = customerDistrict;
    if (customerState) customer.customerState = customerState;

    if (req.file) {
      customer.customerProfileImage = req.file.filename;
    }

    customer.customerUpdatedAt = Date.now();

    await customer.save();

    res.status(200).json({
      success: true,
      message: "Customer profile updated successfully",
      data: customer,
    });
  } catch (error) {
    console.error("Update Customer Error:", error);
    res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};

exports.changeCustomerPassword = async (req, res) => {
  try {
    const customerId = req.data.customerId;

    const { currentPassword, newPassword } = req.body;

    const customer = await CustomerModel.findById(customerId);

    if (!customer) {
      return res.status(404).json({
        success: false,
        message: "Customer not found",
      });
    }

    const isMatch = await bcrypt.compare(
      currentPassword,
      customer.customerPassword,
    );

    if (!isMatch) {
      return res.status(400).json({
        success: false,
        message: "Current password is incorrect",
      });
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);

    customer.customerPassword = hashedPassword;
    customer.customerUpdatedAt = Date.now();

    await customer.save();

    res.status(200).json({
      success: true,
      message: "Password updated successfully",
    });
  } catch (error) {
    console.error("Change Password Error:", error);
    res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};

exports.getServiceForCustomerByPin = async (req, res) => {
  try {
    const { customerPincode } = req.params;

    if (!customerPincode) {
      return res.status(400).json({
        success: false,
        message: "Customer pincode is required",
      });
    }

    const owners = await OwnerModel.find({
      ownerShopPincode: String(customerPincode),
      ownerAccountStatus: "ACTIVE",
      ownerApprovedStatus: "APPROVE",
    });
    console.log("OWNERS FOUND:", owners);

    if (owners.length === 0) {
      return res.status(404).json({
        success: false,
        message: "No salons found in this area",
      });
    }

    const ownerIds = owners.map((owner) => owner._id);

    const services = await ServiceModel.find({
      ownerId: { $in: ownerIds },
    }).populate(
      "ownerId",
      "ownerShopName ownerShopStreet ownerShopDistrict ownerShopCity ownerShopPincode ownerEmail",
    );

    res.status(200).json({
      success: true,
      totalOwners: owners.length,
      totalServices: services.length,
      services: services,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: "Server Error",
    });
  }
};

exports.getProductsForCustomerByPin = async (req, res) => {
  try {
    const { customerPincode } = req.params;

    if (!customerPincode) {
      return res.status(400).json({
        success: false,
        message: "Customer pincode is required",
      });
    }

    const owners = await OwnerModel.find({
      ownerShopPincode: customerPincode,
      ownerAccountStatus: "ACTIVE",
      ownerApprovedStatus: "APPROVE",
    });

    // console.log("Owners found for pincode " + customerPincode + " : " + owners.length + " owners" + owners);

    if (owners.length === 0) {
      return res.status(404).json({
        success: false,
        message: "No shops found in this area",
      });
    }

    // Extract owner IDs
    const ownerIds = owners.map((owner) => owner._id);

    const products = await ProductModel.find({
      ownerId: { $in: ownerIds },
    }).populate(
      "ownerId",
      "ownerShopName ownerEmail ownerShopCity ownerShopPincode",
    );
    // .populate("ownerId", "ownerShopName ownerShopCity ownerShopPincode");

    res.status(200).json({
      success: true,
      totalOwners: owners.length,
      totalProducts: products.length,
      products: products,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: "Server Error",
    });
  }
};

//create By yogesh deore
exports.cancelAppointmentByCustomer = async (req, res) => {
  try {
    const { appointmentId } = req.body;

    console.log("Appointment For cancel :", appointmentId);

    if (!appointmentId) {
      return res.status(400).json({
        message: "Appointment ID required",
      });
    }

    const appointment = await AppointmentModel.findById(appointmentId);

    if (!appointment) {
      return res.status(404).json({
        message: "Appointment not found",
      });
    }

    if (appointment.appointmentStatus === "COMPLETED") {
      return res.status(400).json({
        message: "Cannot cancel completed appointment",
      });
    }

    appointment.appointmentStatus = "CANCELLED";
    await appointment.save();

    const ownerEmail = await OwnerModel.findById(appointment.ownerId).select(
      "ownerEmail",
    );
    const customerName = await CustomerModel.findById(
      appointment.customerId,
    ).select("customerName");

    // Send email notification to owner about appointment cancellation
    let subject = "Appointment Cancellation Notification";
    let message = `Dear Owner,\n\nThe appointment with Name ${customerName.customerName} has been cancelled for the Date: ${appointment.appointmentDate}and Time: ${appointment.startTime} by the customer.\n\nBest regards,\nElite Saloon Team`;
    await emailSendOptimizeCode(ownerEmail.ownerEmail, subject, message);

    res.json({
      message: "Appointment cancelled successfully",
      appointment,
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({
      message: "Error cancelling appointment",
    });
  }
};



// resend otp

exports.resendCustomerOtp = async (req, res) => {
  try {
    const { customerEmail } = req.body;

    const customer = await CustomerModel.findOne({ customerEmail });

    if (!customer) {
      return res.status(404).json({
        message: "Customer not found",
      });
    }

    const subject = "Resend OTP for Elite Saloon";

    let message =
      "Please enter OTP for customer registration in Elite Saloon\n\n Your OTP is :";

    // Generate New OTP
    let otp = await generateOTP();

    message = message + otp;

    // Send Email
    const generatedOTP = await emailSendOptimizeCode(
      customer.customerEmail,
      subject,
      message
    );

    if (generatedOTP) {
      // Update OTP in database
      customer.customerOTP = otp;

      await customer.save();

      return res.status(200).json({
        message: "OTP Resent Successfully",
      });
    } else {
      return res.status(500).json({
        message: "Failed to resend OTP",
      });
    }
  } catch (error) {
    console.log("Resend OTP Error:", error);

    res.status(500).json({
      message: "Internal Server Error",
      error: error.message,
    });
  }
};

exports.customerProfile = async (req, res) => {

  console.log("Authenticate Profile .... ");
  const customerId = req.data.customerId;

  const customer = await CustomerModel.findById(customerId);
  console.log("Customer Data print :", customer);

  const customerData = {
    customerName: customer.customerName,
    customerEmail: customer.customerEmail,
    customerMobile: customer.customerMobile,
    customerGender: customer.customerGender,
    customerDOB: customer.customerDOB,
    customerStreet: customer.customerStreet,
    customerPincode: customer.customerPincode,
    customerCity: customer.customerCity,
    customerBlock: customer.customerBlock,
    customerDistrict: customer.customerDistrict,
    customerState: customer.customerState,
    customerUsername: customer.customerUsername,
    customerProfileImage: customer.customerProfileImage
  };

  return res.status(200).json({
    message: "Authenticate Profile .... ",
    customer: customerData
  });

};

// exports.getNearbySalons = async (req, res) => {

//     const owners = [];
//     owners = nearBySalons( req, res);
//     console.log("Owners of Salons"+ owners + "\n\nOwners Lenght" + owners.length);

//      return res.status(200).json({
//             success: true,
//             message: "Nearby salons retrieved successfully",

//             customerLocation: {
//                 latitude: req.latitude,
//                 longitude: req.longitude
//             },
//             totalSalons: owners.length,
//             owners : owners
//         }); 

// }

// const { findNearbyOwners } = require("../services/nearbyService");

exports.getNearbySalons = async (req, res) => {

  try {

    const { latitude, longitude } = req.body;

    if (latitude === undefined || longitude === undefined) {
      return res.status(400).json({
        success: false,
        message: "Latitude and longitude are required"
      });
    }

    const owners = await findNearbyOwners(
      latitude,
      longitude,
      5
    );

    return res.status(200).json({
      success: true,
      message: "Nearby salons retrieved successfully",

      customerLocation: {
        latitude: Number(latitude),
        longitude: Number(longitude)
      },

      totalSalons: owners.length,

      owners: owners
    });

  } catch (error) {

    console.error("Nearby Salon API Error:", error);

    return res.status(500).json({
      success: false,
      message: "Internal server error"
    });
  }
};

exports.getServiceByNearBySalons = async (req, res) => {

  try {

    const { latitude, longitude } = req.body;

    if (latitude === undefined || longitude === undefined) {
      return res.status(400).json({
        success: false,
        message: "Latitude and longitude are required"
      });
    }

    const owners = await findNearbyOwners(
      latitude,
      longitude,
      5
    );

    console.log("owner lenght " + owners.length);

    if (owners.length === 0) {
      return res.status(404).json({
        success: false,
        message: "No salons found in this area",
      });
    }

    const ownerIds = owners.map((owner) => owner.ownerId);

    const services = await ServiceModel.find({
      ownerId: { $in: ownerIds },
    }).populate(
      "ownerId",
      "ownerShopName ownerShopStreet ownerShopDistrict ownerShopCity ownerShopPincode ownerEmail",
    );

    res.status(200).json({
      success: true,
      totalOwners: owners.length,
      totalServices: services.length,
      services : services,
    });

    // return res.status(200).json({
    //     success: true,
    //     message: "Nearby salons retrieved successfully",
    //     customerLocation: {
    //         latitude: Number(latitude),
    //         longitude: Number(longitude)
    //     },
    //     totalSalons: owners.length,
    //     owners: owners
    // });

  } catch (error) {

    console.error("Nearby Salon API Error:", error);

    return res.status(500).json({
      success: false,
      message: "Internal server error"
    });
  }

};

exports.getProductByNearBySalons = async (req, res) => {

  try {

    const { latitude, longitude } = req.body;

    if (latitude === undefined || longitude === undefined) {
      return res.status(400).json({
        success: false,
        message: "Latitude and longitude are required"
      });
    }

    const owners = await findNearbyOwners(
      latitude,
      longitude,
      5
    );

    console.log("owner lenght " + owners.length);

    if (owners.length === 0) {
      return res.status(404).json({
        success: false,
        message: "No salons found in this area",
      });
    }

    const ownerIds = owners.map((owner) => owner.ownerId);

    const products = await ProductModel.find({
      ownerId: { $in: ownerIds },
    }).populate(
      "ownerId",
      "ownerShopName ownerEmail ownerShopCity ownerShopPincode",
    );

    res.status(200).json({
      success: true,
      totalOwners: owners.length,
      totalProducts: products.length,
      products : products,
    });
  } catch (error) {

    console.error("Nearby Salon API Error:", error);

    return res.status(500).json({
      success: false,
      message: "Internal server error"
    });
  }

};
