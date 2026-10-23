import React, { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import {
  FaFileDownload,
  FaPrint,
  FaShoppingBag,
  FaCalendarAlt,
  FaMapMarkerAlt,
  FaBoxOpen,
} from "react-icons/fa";
import { downloadInvoicePDF, printInvoice, formatDate } from "../../utils/invoiceGenerator";
import "../../css/CustomerCheckout.css";

const CustomerProductOrders = () => {
  const navigate = useNavigate();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchOrders = async () => {
    const token = localStorage.getItem("token");
    if (!token) {
      navigate("/customerlogin");
      return;
    }

    try {
      setLoading(true);
      const res = await axios.get("http://localhost:5000/customer/orders", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (res.data?.success) {
        setOrders(res.data.orders || []);
      }
    } catch (err) {
      console.error("Fetch orders error:", err);
      setError("Failed to load your order history.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  if (loading) {
    return (
      <div className="dashboard-content">
        <p className="no-data">Loading your orders...</p>
      </div>
    );
  }

  return (
    <div className="dashboard-content">
      {/* HEADER */}
      <div className="content-header" style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <h2>My Product Orders ({orders.length})</h2>

        <button
          className="action-btn-primary"
          onClick={() => navigate("/products")}
        >
          <FaShoppingBag /> Browse Products
        </button>
      </div>

      {error && <p className="no-data" style={{ color: "#d32f2f" }}>{error}</p>}

      {orders.length === 0 ? (
        <div className="section-card" style={{ textAlign: "center", padding: "50px 20px" }}>
          <div style={{ fontSize: "3rem", color: "#ccc", marginBottom: "16px" }}>
            <FaBoxOpen />
          </div>
          <h3>No Orders Yet</h3>
          <p style={{ color: "#666", marginBottom: "20px" }}>
            You haven't purchased any salon products yet. Check out our grooming & beauty collection!
          </p>
          <button
            className="action-btn-primary"
            onClick={() => navigate("/products")}
          >
            Shop Now
          </button>
        </div>
      ) : (
        <div className="orders-history-container">
          {orders.map((order) => {
            const addr = order.shippingAddress || {};

            return (
              <div key={order._id} className="order-history-card">
                {/* CARD HEADER */}
                <div className="order-history-header">
                  <div className="order-history-meta">
                    <div>
                      <span className="metadata-label">Order ID</span>
                      <strong style={{ color: "var(--burgundy)" }}>{order.orderNumber}</strong>
                    </div>

                    <div>
                      <span className="metadata-label">Placed On</span>
                      <span style={{ fontSize: "0.9rem", color: "#555" }}>
                        <FaCalendarAlt style={{ marginRight: "4px" }} />
                        {formatDate(order.createdAt)}
                      </span>
                    </div>

                    <div>
                      <span className="metadata-label">Payment Status</span>
                      <div>
                        <span className={`payment-status-pill ${order.paymentStatus?.toLowerCase()}`}>
                          {order.paymentStatus}
                        </span>
                      </div>
                    </div>

                    {order.razorpayPaymentId && (
                      <div>
                        <span className="metadata-label">Razorpay Ref</span>
                        <code style={{ fontSize: "0.8rem", color: "#666" }}>
                          {order.razorpayPaymentId}
                        </code>
                      </div>
                    )}
                  </div>

                  <div className="order-total-badge">
                    ₹{Number(order.finalAmount || 0).toFixed(2)}
                  </div>
                </div>

                {/* ITEMS PREVIEW */}
                <div className="order-history-items-row">
                  {(order.items || []).map((item, idx) => {
                    const imgUrl = item.productImage
                      ? `http://localhost:5000/uploads/productImages/${item.productImage}`
                      : "https://via.placeholder.com/50";

                    return (
                      <div key={idx} className="order-item-snippet">
                        <img src={imgUrl} alt={item.productName} className="order-snippet-img" />
                        <div>
                          <strong style={{ fontSize: "0.85rem", color: "#222" }}>
                            {item.productName}
                          </strong>
                          <div style={{ fontSize: "0.75rem", color: "#777" }}>
                            Qty: {item.quantity} × ₹{Number(item.productPrice).toFixed(2)}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* ADDRESS SNIPPET */}
                <div
                  style={{
                    fontSize: "0.82rem",
                    color: "#666",
                    marginBottom: "12px",
                    display: "flex",
                    alignItems: "center",
                    gap: "6px",
                  }}
                >
                  <FaMapMarkerAlt style={{ color: "var(--burgundy)" }} />
                  <span>
                    Delivering to: {addr.street}, {addr.city}, {addr.state} - {addr.pincode}
                  </span>
                </div>

                {/* FOOTER ACTIONS */}
                <div className="order-history-footer">
                  <div style={{ fontSize: "0.85rem", color: "#888" }}>
                    Invoice #: <strong>{order.invoiceNumber || "N/A"}</strong>
                  </div>

                  <div className="order-history-btns">
                    <button
                      className="btn-print-inv"
                      style={{ padding: "8px 14px", fontSize: "0.85rem" }}
                      onClick={() => printInvoice(order)}
                    >
                      <FaPrint /> Print
                    </button>

                    <button
                      className="btn-download-inv"
                      style={{ padding: "8px 16px", fontSize: "0.85rem" }}
                      onClick={() => downloadInvoicePDF(order)}
                    >
                      <FaFileDownload /> Download PDF
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default CustomerProductOrders;
