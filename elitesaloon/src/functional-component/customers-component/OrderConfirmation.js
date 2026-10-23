import React, { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import axios from "axios";
import {
  FaCheckCircle,
  FaFileDownload,
  FaPrint,
  FaShoppingBag,
  FaListAlt,
  FaMapMarkerAlt,
} from "react-icons/fa";
import { downloadInvoicePDF, printInvoice, formatDate } from "../../utils/invoiceGenerator";
import "../../css/CustomerCheckout.css";

const OrderConfirmation = () => {
  const location = useLocation();
  const navigate = useNavigate();

  const [order, setOrder] = useState(location.state?.order || null);
  const [loading, setLoading] = useState(!location.state?.order);

  useEffect(() => {
    // If order was not in state, attempt to fetch the latest customer order from API
    if (!order) {
      const token = localStorage.getItem("token");
      if (!token) {
        navigate("/customerlogin");
        return;
      }

      const fetchLatestOrder = async () => {
        try {
          const res = await axios.get("http://localhost:5000/customer/orders", {
            headers: { Authorization: `Bearer ${token}` },
          });

          if (res.data?.orders && res.data.orders.length > 0) {
            setOrder(res.data.orders[0]);
          }
        } catch (err) {
          console.error("Fetch latest order error:", err);
        } finally {
          setLoading(false);
        }
      };

      fetchLatestOrder();
    }
  }, [order, navigate]);

  if (loading) {
    return (
      <div className="confirmation-wrapper">
        <div className="confirmation-card" style={{ textAlign: "center", padding: "60px 20px" }}>
          <h3>Retrieving your confirmed order...</h3>
        </div>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="confirmation-wrapper">
        <div className="confirmation-card" style={{ textAlign: "center", padding: "60px 20px" }}>
          <h2>No Order Found</h2>
          <p style={{ color: "#666", marginBottom: "24px" }}>
            We could not find the order details. Please visit your order history.
          </p>
          <button
            className="btn-continue-shopping"
            onClick={() => navigate("/customerdashboard", { state: { activeSection: "orders" } })}
          >
            Go to My Orders
          </button>
        </div>
      </div>
    );
  }

  const addr = order.shippingAddress || {};

  return (
    <div className="confirmation-wrapper">
      <div className="confirmation-card">
        {/* SUCCESS HEADER */}
        <div className="confirmation-header">
          <div className="confirmation-success-icon">
            <FaCheckCircle />
          </div>
          <h2>Payment Successful! Order Confirmed</h2>
          <p>
            Thank you, <strong>{order.customerName}</strong>! Your order has been placed and verified
            via Razorpay.
          </p>
        </div>

        {/* ORDER KEY METADATA */}
        <div className="order-metadata-grid">
          <div className="metadata-box">
            <span className="metadata-label">Order Number</span>
            <span className="metadata-value">{order.orderNumber}</span>
          </div>

          <div className="metadata-box">
            <span className="metadata-label">Order Date</span>
            <span className="metadata-value">{formatDate(order.createdAt)}</span>
          </div>

          <div className="metadata-box">
            <span className="metadata-label">Payment Status</span>
            <div>
              <span className={`payment-status-pill ${order.paymentStatus?.toLowerCase()}`}>
                {order.paymentStatus}
              </span>
            </div>
          </div>

          <div className="metadata-box">
            <span className="metadata-label">Razorpay Payment Ref</span>
            <span className="metadata-value" style={{ fontFamily: "monospace", fontSize: "0.85rem" }}>
              {order.razorpayPaymentId || "Verified Online"}
            </span>
          </div>
        </div>

        {/* CUSTOMER & SHIPPING INFO */}
        <div
          style={{
            background: "#ffffff",
            border: "1px solid var(--border-color)",
            borderRadius: "10px",
            padding: "16px 20px",
            marginBottom: "24px",
            display: "grid",
            gridTemplateColumns: "1fr 1fr",
            gap: "20px",
          }}
        >
          <div>
            <h5 style={{ margin: "0 0 8px 0", color: "var(--burgundy)" }}>Billed To</h5>
            <div style={{ fontSize: "0.9rem", color: "#333" }}>
              <strong>{order.customerName}</strong>
              <br />
              Email: {order.customerEmail}
              <br />
              Phone: {order.customerMobile}
            </div>
          </div>

          <div>
            <h5 style={{ margin: "0 0 8px 0", color: "var(--burgundy)" }}>
              <FaMapMarkerAlt /> Delivery Address
            </h5>
            <div style={{ fontSize: "0.9rem", color: "#333" }}>
              {addr.street}
              <br />
              {addr.city}
              {addr.district ? `, ${addr.district}` : ""}, {addr.state} - {addr.pincode}
            </div>
          </div>
        </div>

        {/* PURCHASED PRODUCTS TABLE */}
        <h4 style={{ color: "var(--burgundy)", marginBottom: "12px" }}>Purchased Products</h4>
        <div className="table-responsive">
          <table className="confirmation-table">
            <thead>
              <tr>
                <th style={{ width: "60px" }}>Item</th>
                <th>Product Description</th>
                <th style={{ textAlign: "center" }}>Qty</th>
                <th style={{ textAlign: "right" }}>Unit Price</th>
                <th style={{ textAlign: "right" }}>Total</th>
              </tr>
            </thead>
            <tbody>
              {(order.items || []).map((item, idx) => {
                const imgUrl =
                  item.productImage
                    ? `http://localhost:5000/uploads/productImages/${item.productImage}`
                    : "https://via.placeholder.com/60";

                return (
                  <tr key={idx}>
                    <td>
                      <img
                        src={imgUrl}
                        alt={item.productName}
                        style={{
                          width: "48px",
                          height: "48px",
                          borderRadius: "6px",
                          objectFit: "cover",
                          border: "1px solid #eee",
                        }}
                      />
                    </td>
                    <td>
                      <strong>{item.productName}</strong>
                      <div style={{ fontSize: "0.78rem", color: "#777" }}>
                        Category: {item.productType || "Cosmetics"}
                      </div>
                    </td>
                    <td style={{ textAlign: "center", fontWeight: "600" }}>{item.quantity}</td>
                    <td style={{ textAlign: "right" }}>₹{Number(item.productPrice).toFixed(2)}</td>
                    <td style={{ textAlign: "right", fontWeight: "700", color: "var(--burgundy)" }}>
                      ₹{Number(item.lineTotal || item.productPrice * item.quantity).toFixed(2)}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* FINANCIAL SUMMARY */}
        <div
          style={{
            maxWidth: "340px",
            marginLeft: "auto",
            background: "#faf8f5",
            padding: "16px",
            borderRadius: "10px",
            marginBottom: "20px",
          }}
        >
          <div className="breakdown-row">
            <span>Subtotal:</span>
            <span>₹{Number(order.subtotal || 0).toFixed(2)}</span>
          </div>
          <div className="breakdown-row">
            <span>Delivery:</span>
            <span>
              {Number(order.shippingCharges) > 0
                ? `₹${Number(order.shippingCharges).toFixed(2)}`
                : "FREE"}
            </span>
          </div>
          <div className="breakdown-row">
            <span>GST (18% included):</span>
            <span>₹{Number(order.taxAmount || 0).toFixed(2)}</span>
          </div>
          <div className="breakdown-row grand-total-row">
            <span>Total Paid:</span>
            <span>₹{Number(order.finalAmount || 0).toFixed(2)}</span>
          </div>
        </div>

        {/* INVOICE & ACTION BUTTONS */}
        <div className="invoice-actions-group">
          <button className="btn-download-inv" onClick={() => downloadInvoicePDF(order)}>
            <FaFileDownload /> Download PDF Invoice
          </button>

          <button className="btn-print-inv" onClick={() => printInvoice(order)}>
            <FaPrint /> Print Invoice
          </button>

          <button
            className="btn-continue-shopping"
            onClick={() =>
              navigate("/customerdashboard", { state: { activeSection: "products" } })
            }
          >
            <FaShoppingBag /> Continue Shopping
          </button>

          <button
            className="btn-continue-shopping"
            onClick={() =>
              navigate("/customerdashboard", { state: { activeSection: "orders" } })
            }
          >
            <FaListAlt /> My Orders
          </button>
        </div>
      </div>
    </div>
  );
};

export default OrderConfirmation;
