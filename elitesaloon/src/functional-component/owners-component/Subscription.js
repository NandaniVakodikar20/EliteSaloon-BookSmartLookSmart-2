
// import React, { useState } from "react";
// import { useNavigate } from "react-router-dom";
// import Swal from "sweetalert2";
// import axios from "axios";

// import {
//   FaCheck,
//   FaCrown,
//   FaGem,
//   FaStar
// } from "react-icons/fa";

// import "./OwnerDashboard.css";

// const Subscription = () => {

//   const navigate = useNavigate();

//   const [selectedPlan, setSelectedPlan] = useState(null);



//   // SUBSCRIPTION PLANS


//   const plans = [
//     {
//       id: "MONTHLY",
//       name: "Monthly",
//       duration: "1 Month",
//       price: 300,
//       icon: <FaStar />,
//       description: "Perfect for getting started",
//       popular: false
//     },

//     {
//       id: "SIX_MONTH",
//       name: "Half Yearly",
//       duration: "6 Months",
//       price: 1000,
//       icon: <FaGem />,
//       description: "Best choice for growing salons",
//       popular: true
//     },

//     {
//       id: "YEARLY",
//       name: "Yearly",
//       duration: "12 Months",
//       price: 2000,
//       icon: <FaCrown />,
//       description: "Complete salon experience",
//       popular: false
//     }
//   ];


//   // =========================================
//   // SELECT PLAN
//   // =========================================

//   const handleSelectPlan = (plan) => {

//     setSelectedPlan(plan);

//   };


//   // =========================================
//   // PAYMENT
//   // =========================================

//   const handlePayment = async () => {

//     if (!selectedPlan) {

//       Swal.fire({
//         icon: "warning",
//         title: "Select a Plan",
//         text: "Please select a subscription plan first.",
//         confirmButtonColor: "#800020"
//       });

//       return;
//     }



//     // CONFIRM SUBSCRIPTION
  

//     const result = await Swal.fire({

//       title: "Confirm Subscription",

//       html: `
//         <div>

//           <p style="margin-bottom:8px;">
//             You selected
//           </p>

//           <h3 style="color:#800020;margin:5px 0;">
//             ${selectedPlan.name}
//           </h3>

//           <p>
//             ${selectedPlan.duration}
//           </p>

//           <h2 style="color:#d4af37;">
//             ₹${selectedPlan.price}
//           </h2>

//         </div>
//       `,

//       icon: "question",

//       showCancelButton: true,

//       confirmButtonText: "Proceed to Payment",

//       cancelButtonText: "Cancel",

//       confirmButtonColor: "#800020",

//       cancelButtonColor: "#777777"

//     });


//     if (!result.isConfirmed) {
//       return;
//     }


//     // CREATE RAZORPAY ORDER
   

//     try {

//       Swal.fire({
//         title: "Please Wait...",
//         text: "Creating payment order",
//         allowOutsideClick: false,
//         didOpen: () => {
//           Swal.showLoading();
//         }
//       });


    
//       const orderRes = await axios.post(
//         "http://localhost:5000/payment/create-subscription-order",
//         {
//           planId: selectedPlan.id,
//           planName: selectedPlan.name,
//           duration: selectedPlan.duration,
//           amount: selectedPlan.price
//         }
//       );


//       const order = orderRes.data;


//       Swal.close();


//       // =========================================
//       // RAZORPAY OPTIONS
//       // =========================================

//       const options = {

//         key: "rzp_test_SPZsgkIqFM9JER",

//         amount: order.amount,

//         currency: "INR",

//         order_id: order.id,

//         name: "Elite Saloon",

//         description:
//           `${selectedPlan.name} Subscription - ${selectedPlan.duration}`,

//       handler: async function (response) {

//   try {

//     // =========================================
//     // RAZORPAY PAYMENT SUCCESS RESPONSE
//     // =========================================

//     console.log("RAZORPAY PAYMENT SUCCESS");
  

//     console.log(
//       "Razorpay Payment ID:",
//       response.razorpay_payment_id
//     );

//     console.log(
//       "Razorpay Order ID:",
//       response.razorpay_order_id
//     );

//     console.log(
//       "Razorpay Signature:",
//       response.razorpay_signature
//     );


//     // =========================================
//     // DATA TO SEND TO BACKEND
//     // =========================================

//     const paymentData = {

//       planId: selectedPlan.id,

//       planName: selectedPlan.name,

//       duration: selectedPlan.duration,

//       amount: selectedPlan.price,

//       razorpay_order_id:
//         response.razorpay_order_id,

//       razorpay_payment_id:
//         response.razorpay_payment_id,

//       razorpay_signature:
//         response.razorpay_signature

//     };


//     console.log("DATA SENDING TO BACKEND");
    

//     console.log(paymentData);


//     // =========================================
//     // VERIFY PAYMENT
//     // =========================================

//     const verifyResponse = await axios.post(

//       "http://localhost:5000/payment/verify-subscription-payment",

//       paymentData

//     );


//     // =========================================
//     // BACKEND RESPONSE
//     // =========================================


//     console.log("BACKEND PAYMENT VERIFICATION RESPONSE");
 

//     console.log(verifyResponse.data);


//     // =========================================
//     // PAYMENT SUCCESS
//     // =========================================

//     await Swal.fire({

//       icon: "success",

//       title: "Payment Successful!",

//       html: `
//         <p>Your subscription payment was successful.</p>

//         <strong>
//           ${selectedPlan.name}
//         </strong>

//         <br/>

//         <span>
//           ${selectedPlan.duration}
//         </span>

//         <br/><br/>

//         <strong style="color:#d4af37;">
//           ₹${selectedPlan.price}
//         </strong>
//       `,

//       confirmButtonColor: "#800020"

//     });


//     // =========================================
//     // NEXT PAGE
//     // =========================================

//     navigate("/owner");


//   } catch (error) {

//     console.log(
//       "Payment Verification Error:",
//       error
//     );

//     Swal.fire({

//       icon: "error",

//       title: "Payment Verification Failed",

//       text:
//         "Payment was completed but verification failed.",

//       confirmButtonColor: "#800020"

//     });

//   }

// },


//         // =========================================
//         // PAYMENT FAILED / CLOSED
//         // =========================================

//         modal: {

//           ondismiss: function () {

//             console.log(
//               "Razorpay payment window closed"
//             );

//           }

//         }

//       };


//       // =========================================
//       // OPEN RAZORPAY
//       // =========================================

//       const rzp = new window.Razorpay(options);

//       rzp.open();


//       // =========================================
//       // RAZORPAY PAYMENT ERROR
//       // =========================================

//       rzp.on("payment.failed", function (response) {

//         console.log(
//           "Razorpay Payment Failed:",
//           response.error
//         );

//         Swal.fire({

//           icon: "error",

//           title: "Payment Failed",

//           text:
//             response.error?.description ||
//             "Something went wrong during payment.",

//           confirmButtonColor: "#800020"

//         });

//       });


//     } catch (error) {

//       Swal.close();

//       console.log(
//         "Create Order Error:",
//         error
//       );


//       Swal.fire({

//         icon: "error",

//         title: "Payment Failed",

//         text:
//           error.response?.data?.message ||
//           "Unable to create payment order.",

//         confirmButtonColor: "#800020"

//       });

//     }

//   };


//   // =========================================
//   // RETURN
//   // =========================================

//   return (

//     <div className="subscription-page">


//       {/* HEADER */}

//       <div className="subscription-top">

//         <div className="subscription-logo">

//           <span>Elite</span>Saloon

//         </div>

//         <p>
//           Glamour Studio
//         </p>

//       </div>


//       {/* MAIN */}

//       <div className="subscription-container">


//         {/* HEADING */}

//         <div className="subscription-heading">

//           <h1>
//             Choose Your Subscription
//           </h1>

//           <p>

//             Your salon has been approved by our admin.

//             <br />

//             Select a subscription plan to activate your
//             EliteSaloon account.

//           </p>

//         </div>


//         {/* PLANS */}

//         <div className="plans-container">

//           {plans.map((plan) => (

//             <div
//               key={plan.id}

//               className={`plan-card ${
//                 selectedPlan?.id === plan.id
//                   ? "selected"
//                   : ""
//               }`}
//             >


//               {/* POPULAR */}

//               {plan.popular && (

//                 <div className="popular-badge">

//                   MOST POPULAR

//                 </div>

//               )}


//               {/* ICON */}

//               <div className="plan-icon">

//                 {plan.icon}

//               </div>


//               {/* PLAN NAME */}

//               <h2>
//                 {plan.name}
//               </h2>


//               <p className="plan-duration">

//                 {plan.duration}

//               </p>


//               {/* PRICE */}

//               <div className="plan-price">

//                 <span>₹</span>

//                 {plan.price}

//               </div>


//               <p className="plan-description">

//                 {plan.description}

//               </p>


//               {/* FEATURES */}

//               <div className="features">

//                 <div>
//                   <FaCheck />
//                   Salon Dashboard
//                 </div>

//                 <div>
//                   <FaCheck />
//                   Service Management
//                 </div>

//                 <div>
//                   <FaCheck />
//                   Product Management
//                 </div>

//                 <div>
//                   <FaCheck />
//                   Appointment Management
//                 </div>

//                 <div>
//                   <FaCheck />
//                   Staff Management
//                 </div>

//               </div>


//               {/* SELECT BUTTON */}

//               <button

//                 className={
//                   selectedPlan?.id === plan.id
//                     ? "plan-btn selected-btn"
//                     : "plan-btn"
//                 }

//                 onClick={() =>
//                   handleSelectPlan(plan)
//                 }

//               >

//                 {selectedPlan?.id === plan.id

//                   ? "Selected ✓"

//                   : "Select Plan"

//                 }

//               </button>

//             </div>

//           ))}

//         </div>


//         {/* PAYMENT SECTION */}

//         <div className="payment-section">


//           {selectedPlan && (

//             <div className="selected-plan">

//               <span>
//                 Selected Plan:
//               </span>

//               <strong>
//                 {selectedPlan.name}
//               </strong>

//               <b>
//                 ₹{selectedPlan.price}
//               </b>

//             </div>

//           )}


//           {/* PAYMENT BUTTON */}

//           <button

//             className="payment-btn"

//             onClick={handlePayment}

//             disabled={!selectedPlan}

//           >

//             {selectedPlan

//               ? `Proceed to Payment - ₹${selectedPlan.price}`

//               : "Select a Plan to Continue"

//             }

//           </button>


//           <p className="secure-text">

//             🔒 Secure Payment &nbsp; • &nbsp;

//             Easy &nbsp; • &nbsp;

//             Fast &nbsp; • &nbsp;

//             Secure

//           </p>

//         </div>

//       </div>


//       {/* FOOTER */}

//       <div className="subscription-footer">

//         © {new Date().getFullYear()} EliteSaloon.

//         All Rights Reserved.

//       </div>

//     </div>

//   );

// };

// export default Subscription;


import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import Swal from "sweetalert2";
import axios from "axios";

import {
  FaCheck,
  FaCrown,
  FaGem,
  FaStar
} from "react-icons/fa";

import "./OwnerDashboard.css";

const API_URL = "http://localhost:5000";

const Subscription = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const [selectedPlan, setSelectedPlan] = useState(null);
  const [isValidating, setIsValidating] = useState(true);
  const [isLinkValid, setIsLinkValid] = useState(false);
  const [owner, setOwner] = useState(null);

  // Read token from the email link.
  const token = new URLSearchParams(location.search).get("token");

  // Validate subscription link with backend.
  useEffect(() => {
    let isMounted = true;

    const validateSubscriptionLink = async () => {
      if (!token) {
        setIsLinkValid(false);
        setIsValidating(false);
        return;
      }

      try {
        const response = await axios.get(
          `${API_URL}/subscription/validate-link`,
          {
            params: { token }
          }
        );

        if (!isMounted) return;

        if (response.data.success) {
          setOwner(response.data.owner);
          setIsLinkValid(true);
        } else {
          setIsLinkValid(false);
        }
      } catch (error) {
        if (!isMounted) return;

        console.error(
          "Subscription link validation failed:",
          error.response?.data || error.message
        );

        setIsLinkValid(false);
      } finally {
        if (isMounted) {
          setIsValidating(false);
        }
      }
    };

    validateSubscriptionLink();

    return () => {
      isMounted = false;
    };
  }, [token]);

  // Subscription plans.
  const plans = [
    {
      id: "MONTHLY",
      name: "Monthly",
      duration: "1 Month",
      price: 300,
      icon: <FaStar />,
      description: "Perfect for getting started",
      popular: false
    },
    {
      id: "SIX_MONTH",
      name: "Half Yearly",
      duration: "6 Months",
      price: 1000,
      icon: <FaGem />,
      description: "Best choice for growing salons",
      popular: true
    },
    {
      id: "YEARLY",
      name: "Yearly",
      duration: "12 Months",
      price: 2000,
      icon: <FaCrown />,
      description: "Complete salon experience",
      popular: false
    }
  ];

  // Select plan.
  const handleSelectPlan = (plan) => {
    if (!isLinkValid) return;
    setSelectedPlan(plan);
  };

  // Payment.
  const handlePayment = async () => {
    if (!isLinkValid || !token) {
      Swal.fire({
        icon: "error",
        title: "Invalid Subscription Link",
        text: "Please open the subscription link received in your email.",
        confirmButtonColor: "#800020"
      });
      return;
    }

    if (!selectedPlan) {
      Swal.fire({
        icon: "warning",
        title: "Select a Plan",
        text: "Please select a subscription plan first.",
        confirmButtonColor: "#800020"
      });
      return;
    }

    const result = await Swal.fire({
      title: "Confirm Subscription",
      html: `
        <div>
          <p style="margin-bottom:8px;">You selected</p>
          <h3 style="color:#800020;margin:5px 0;">
            ${selectedPlan.name}
          </h3>
          <p>${selectedPlan.duration}</p>
          <h2 style="color:#d4af37;">
            ₹${selectedPlan.price}
          </h2>
        </div>
      `,
      icon: "question",
      showCancelButton: true,
      confirmButtonText: "Proceed to Payment",
      cancelButtonText: "Cancel",
      confirmButtonColor: "#800020",
      cancelButtonColor: "#777777"
    });

    if (!result.isConfirmed) return;

    try {
      Swal.fire({
        title: "Please Wait...",
        text: "Creating payment order",
        allowOutsideClick: false,
        didOpen: () => Swal.showLoading()
      });

      // Create order.
      // The backend must verify the subscription token and
      // determine the actual price from its database.
      const orderRes = await axios.post(
        `${API_URL}/payment/create-subscription-order`,
        {
          planId: selectedPlan.id,
          token
        }
      );

      const order = orderRes.data;

      Swal.close();

      if (!window.Razorpay) {
        throw new Error("Razorpay Checkout has not loaded.");
      }

      const options = {
        key: "rzp_test_SPZsgkIqFM9JER",
        amount: order.amount,
        currency: order.currency || "INR",
        order_id: order.id,
        name: "Elite Saloon",
        description:
          `${selectedPlan.name} Subscription - ${selectedPlan.duration}`,

        handler: async function (response) {
          try {
            Swal.fire({
              title: "Verifying Payment...",
              text: "Please wait while we verify your payment.",
              allowOutsideClick: false,
              didOpen: () => Swal.showLoading()
            });

            // Verify payment on backend.
            const verifyResponse = await axios.post(
              `${API_URL}/payment/verify-subscription-payment`,
              {
                token,
                planId: selectedPlan.id,
                razorpay_order_id: response.razorpay_order_id,
                razorpay_payment_id: response.razorpay_payment_id,
                razorpay_signature: response.razorpay_signature
              }
            );

            if (!verifyResponse.data.success) {
              throw new Error(
                verifyResponse.data.message ||
                "Payment verification failed."
              );
            }

            await Swal.fire({
              icon: "success",
              title: "Payment Successful!",
              html: `
                <p>Your subscription payment was verified.</p>
                <strong>${selectedPlan.name}</strong>
                <br/>
                <span>${selectedPlan.duration}</span>
                <br/><br/>
                <strong style="color:#d4af37;">
                  ₹${selectedPlan.price}
                </strong>
              `,
              confirmButtonColor: "#800020"
            });

            navigate("/OwnerLogin");
          } catch (error) {
            console.error(
              "Payment verification error:",
              error.response?.data || error.message
            );

            Swal.fire({
              icon: "error",
              title: "Payment Verification Failed",
              text:
                error.response?.data?.message ||
                error.message ||
                "Payment could not be verified. Please contact support.",
              confirmButtonColor: "#800020"
            });
          }
        },

        modal: {
          ondismiss: function () {
            console.log("Razorpay payment window closed");
          }
        }
      };

      const rzp = new window.Razorpay(options);

      rzp.on("payment.failed", function (response) {
        console.error("Razorpay payment failed:", response.error);

        Swal.fire({
          icon: "error",
          title: "Payment Failed",
          text:
            response.error?.description ||
            "Something went wrong during payment.",
          confirmButtonColor: "#800020"
        });
      });

      rzp.open();
    } catch (error) {
      Swal.close();

      console.error(
        "Create order error:",
        error.response?.data || error.message
      );

      Swal.fire({
        icon: "error",
        title: "Payment Failed",
        text:
          error.response?.data?.message ||
          error.message ||
          "Unable to create payment order.",
        confirmButtonColor: "#800020"
      });
    }
  };

  // Loading state.
  if (isValidating) {
    return (
      <div className="subscription-page">
        <div className="subscription-container">
          <div className="subscription-heading">
            <h1>Validating Subscription Link...</h1>
            <p>Please wait while we verify your email link.</p>
          </div>
        </div>
      </div>
    );
  }

  // Invalid link state.
  if (!isLinkValid) {
    return (
      <div className="subscription-page">
        <div className="subscription-container">
          <div className="subscription-heading">
            <h1>Invalid Subscription Link</h1>
            <p>
              This link is missing or invalid. Please use the
              subscription link sent to your registered email.
            </p>
            <button
              className="payment-btn"
              onClick={() => navigate("/")}
            >
              Go to Home
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Existing design and CSS class names preserved.
  return (
    <div className="subscription-page">
      <div className="subscription-top">
        <div className="subscription-logo">
          <span>Elite</span>Saloon
        </div>
        <p>Glamour Studio</p>
      </div>

      <div className="subscription-container">
        <div className="subscription-heading">
          <h1>Choose Your Subscription</h1>
          <p>
            Your salon has been approved by our admin.
            <br />
            {owner?.ownerName
              ? `Welcome, ${owner.ownerName}.`
              : "Select a subscription plan to activate your EliteSaloon account."}
            <br />
            Select a subscription plan to continue.
          </p>
        </div>

        <div className="plans-container">
          {plans.map((plan) => (
            <div
              key={plan.id}
              className={`plan-card ${
                selectedPlan?.id === plan.id ? "selected" : ""
              }`}
            >
              {plan.popular && (
                <div className="popular-badge">MOST POPULAR</div>
              )}

              <div className="plan-icon">{plan.icon}</div>

              <h2>{plan.name}</h2>

              <p className="plan-duration">{plan.duration}</p>

              <div className="plan-price">
                <span>₹</span>
                {plan.price}
              </div>

              <p className="plan-description">{plan.description}</p>

              <div className="features">
                <div><FaCheck /> Salon Dashboard</div>
                <div><FaCheck /> Service Management</div>
                <div><FaCheck /> Product Management</div>
                <div><FaCheck /> Appointment Management</div>
                <div><FaCheck /> Staff Management</div>
              </div>

              <button
                className={
                  selectedPlan?.id === plan.id
                    ? "plan-btn selected-btn"
                    : "plan-btn"
                }
                onClick={() => handleSelectPlan(plan)}
              >
                {selectedPlan?.id === plan.id
                  ? "Selected ✓"
                  : "Select Plan"}
              </button>
            </div>
          ))}
        </div>

        <div className="payment-section">
          {selectedPlan && (
            <div className="selected-plan">
              <span>Selected Plan:</span>
              <strong>{selectedPlan.name}</strong>
              <b>₹{selectedPlan.price}</b>
            </div>
          )}

          <button
            className="payment-btn"
            onClick={handlePayment}
            disabled={!selectedPlan}
          >
            {selectedPlan
              ? `Proceed to Payment - ₹${selectedPlan.price}`
              : "Select a Plan to Continue"}
          </button>

          <p className="secure-text">
            🔒 Secure Payment &nbsp; • &nbsp; Easy &nbsp; • &nbsp;
            Fast &nbsp; • &nbsp; Secure
          </p>
        </div>
      </div>

      <div className="subscription-footer">
        © {new Date().getFullYear()} EliteSaloon. All Rights Reserved.
      </div>
    </div>
  );
};

export default Subscription;
