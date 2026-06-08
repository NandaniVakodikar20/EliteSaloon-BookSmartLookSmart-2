import React from "react";

import { BrowserRouter, Routes, Route, useLocation } from "react-router-dom";

// Guest
import Navbar from "./functional-component/guest-component/Navbar";
import GuestHome from "./functional-component/guest-component/GuestHome";


//admin
import AdminLogin from "./functional-component/admin-component/AdminLogin";

// Customer
import CustomerLogin from "./functional-component/customers-component/CustomerLogin";
import CustomerRegistration from "./functional-component/customers-component/CustomerRegistration";
import CustomerLoginWithOTP from "./functional-component/customers-component/CustomerLoginWithOTP";
import CustomerOtpVerify from "./functional-component/customers-component/CustomerOtpVerify";
import CustomerProfileSetup from "./functional-component/customers-component/CustomerProfileSetup";
import ResetPassword from "./functional-component/customers-component/ResetPassword";
import CustomerDashboard from "./functional-component/customers-component/CustomerDashboard";
import CustomerBookingForm from "./functional-component/customers-component/CustomerBookingForm";
import CustomerServices from "./functional-component/customers-component/CustomerServices";
 import CustomerProducts from "./functional-component/customers-component/CustomerProducts";

import ForgotPassword from "./functional-component/customers-component/ForgotPassword";
import ResetOtp from "./functional-component/customers-component/ResetOtp";

import OtpVerify from "./components/OtpVerify";


//customer service
import SelectServices from "./functional-component/customers-component/SelectServices";
import RescheduleService from "./functional-component/customers-component/RescheduleService";

// Owner
import OwnerRegistration from "./functional-component/owners-component/OwnerRegistration";
import OwnerDashboard from "./functional-component/owners-component/OwnerDashboard";
import OwnerOtpVerify from "./functional-component/owners-component/OwnerOtpVerify";
import OwnerLogin from "./functional-component/owners-component/OwnerLogin";

import OwnerForgotPassword from "./functional-component/owners-component/OwnerForgotPassword";
import OwnerResetOtp from "./functional-component/owners-component/OwnerResetOtp";
import OwnerResetPassword from "./functional-component/owners-component/OwnerResetPassword";

import OwnerAppointmentDetails from "./functional-component/owners-component/OwnerAppointmentDetails";


// Admin
import AdminDashboard from "./functional-component/admin-component/AdminDashboard";
import StaffOtpVerify from "./functional-component/owners-component/StaffOtpVerify";

function AppContent() {
  const location = useLocation();

  // Pages where Navbar should NOT appear
  const hideNavbarRoutes = [
    "/customerregister",
    "/customerlogin",
    "/customerloginotp",
    "/customerotpverify",
    "/profilesetup",
    "/customerdashboard",
    "/OtpVerify",
    "/forgotpassword",
    "/resetOtp",
    "/resetpassword",
    "/ownerregister",
    "/ownerotpverify",
    "/ownerlogin",
    "/ownerdashboard",
    "/adminlogin",
    "/admindashboard",
    "/ownerforgotpassword",
    "/ownerresetotp",
    "/staffotpveryfy",
    "/ownerresetpassword",
    "bookappointment",
    "/selectservices",
   "/reschedulservice", 
    "/appointment-details",
    "/services",
    "/products",
  
  ];

  const showNavbar = !hideNavbarRoutes.includes(location.pathname);

  return (
    <>
      {showNavbar && <Navbar />}

      <Routes>
        {/* GUEST */}
        <Route path="/" element={<GuestHome />} />
    

        {/* CUSTOMER */}
        <Route path="/customerregister" element={<CustomerRegistration />} />
        <Route path="/customerlogin" element={<CustomerLogin />} />
        <Route path="/customerloginotp" element={<CustomerLoginWithOTP />} />
        <Route path="/customerotpverify" element={<CustomerOtpVerify />} />
        <Route path="/profilesetup" element={<CustomerProfileSetup />} />
        <Route path="/customerdashboard" element={<CustomerDashboard />} />
        <Route path="/bookappointment" element={<CustomerBookingForm />} />
        <Route path="/services" element={<CustomerServices />}/>
<Route path="/products" element ={<CustomerProducts/>}/>
        <Route path="/OtpVerify" element={<OtpVerify />} />

        <Route path="/selectservices" element={<SelectServices />} />
        <Route path="/rescheduleservice" element ={<RescheduleService/>}/>

        {/* FORGOT PASSWORD */}
        <Route path="/forgotpassword" element={<ForgotPassword />} />
        <Route path="/resetotp" element={<ResetOtp />} />
        <Route path="/resetpassword" element={<ResetPassword />} />

        {/* ADMIN */}
        <Route path="/adminlogin" element={<AdminLogin />} />
        <Route path="/admindashboard" element={<AdminDashboard />} />

        {/* OWNER */}
        <Route path="/ownerregister" element={<OwnerRegistration />} />
        <Route path="/ownerotpverify" element={<OwnerOtpVerify />} />
        <Route path="/ownerlogin" element={<OwnerLogin />} />
        <Route path="/ownerdashboard" element={<OwnerDashboard />} />
        <Route path="/appointment-details" element={<OwnerAppointmentDetails />} />

        {/* OWNER FORGOT PASSWORD */}
        <Route path="/ownerforgotpassword" element={<OwnerForgotPassword />} />
        <Route path="/ownerresetotp" element={<OwnerResetOtp />} />
        <Route path="/staffotpverify" element={<StaffOtpVerify />} />

        <Route path="/ownerresetpassword" element={<OwnerResetPassword />} />
      </Routes>
    </>
  );
}

function App() {
  return (
    <BrowserRouter>
      <AppContent />
    </BrowserRouter>
  );
}

export default App;
