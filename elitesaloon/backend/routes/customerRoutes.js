const express = require('express');
const routes = express.Router();
// const upload = require('../middleware/upload');
const imageUpload = require("../utils/imageUpload");
const CustomerController = require('../controllers/CustomerController/CustomerController');
// const Customer = require('../models/CustomerModel');
const authMiddleware = require("../middleware/authMiddleware");
// routes.post('/register', upload.single('customerProfileImage'), CustomerController.registerCustomer);
routes.post('/register', CustomerController.registerCustomer);

routes.post('/login', CustomerController.loginCustomer);
routes.post('/verifyotp', CustomerController.verifyOTP);
routes.post('/forgotpassword', CustomerController.forgotPassword);
// routes.post('/matchotp', CustomerController.matchOTP);
routes.post('/resetpassword', CustomerController.resetPassword);
routes.post('/resendotp', CustomerController.resendCustomerOtp);
//for imsge
routes.post('/uploadprofile', imageUpload.single('customerProfileImage'), CustomerController.uploadProfileImage);

// routes.put(
//   '/update-profile/:id',
//   imageUpload.single('customerProfileImage'), 
//   CustomerController.updateCustomerProfile
// );

routes.put(
  '/update-profile',
  authMiddleware,
  imageUpload.single('customerProfileImage'),
  CustomerController.updateCustomerProfile
);

routes.post(
  '/change-password',
  authMiddleware,
  CustomerController.changeCustomerPassword
);

routes.get("/get-product-customer/:customerPincode", CustomerController.getProductsForCustomerByPin);
routes.get("/get-service-customer/:customerPincode", CustomerController.getServiceForCustomerByPin);
routes.put("/cancel-appointment", CustomerController.cancelAppointmentByCustomer);

routes.get("/profile", authMiddleware, CustomerController.customerProfile);

routes.post("/nearby-salons", CustomerController.getNearbySalons);
routes.post("/get-service", CustomerController.getServiceByNearBySalons);
routes.get("/get-product", CustomerController.getProductByNearBySalons);

module.exports = routes;

