import React, { useState, useEffect } from "react";
import axios from "axios";
import { FiRefreshCw } from "react-icons/fi";

const PaymentHistory = () => {
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);

  // API Call function
  const fetchPayments = async () => {
    setLoading(true);
    try {
      // Apne backend ka sahi URL yahan dalein
      const response = await axios.get(
        "http://localhost:5000/payment/razorpay-payments",
      );
      if (response.data.success) {
        setPayments(response.data.payments);
      }
    } catch (error) {
      console.error("Error fetching payments:", error);
    } finally {
      setLoading(false);
    }
  };

  // Component load hote hi data fetch karega
  useEffect(() => {
    fetchPayments();
  }, []);

  const formatDate = (timestamp) => {
    return new Date(timestamp * 1000).toLocaleString("en-IN", {
      day: "2-digit",
      month: "short",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  if (loading) {
    return (
      <div className="text-center py-5">
        <div className="spinner-border text-warning" role="status"></div>
        <p className="mt-2 text-muted" style={{ fontFamily: "Poppins" }}>
          Fetching Elite Transactions...
        </p>
      </div>
    );
  }

  return (
    <div className="ad-table-section">
      <div className="ad-section-header">
        <h2 className="ad-section-title">Payment Transactions</h2>
        <button className="btn-view" onClick={fetchPayments}>
          <FiRefreshCw className="me-1" /> Sync
        </button>
      </div>

      <div className="ad-table-container">
        <table className="table ad-table">
          <thead>
            <tr>
              <th>Payment ID</th>
              <th>Customer</th>
              <th>Method</th>
              <th>Amount</th>
              <th>Status</th>
              <th>Date</th>
              {/* <th>Action</th> */}
            </tr>
          </thead>
          <tbody>
            {payments.length > 0 ? (
              payments.map((pay) => (
                <tr key={pay.id}>
                  <td>{pay.id}</td>
                  <td>
                    <div style={{ fontWeight: "500" }}>
                      {pay.contact || "N/A"}
                    </div>
                    <div className="text-muted" style={{ fontSize: "11px" }}>
                      {pay.email}
                    </div>
                  </td>
                  <td>
                    <div style={{ textTransform: "capitalize" }}>
                      {pay.method}
                    </div>
                    <small className="text-muted" style={{ fontSize: "11px" }}>
                      {pay.wallet || pay.bank || "Online"}
                    </small>
                  </td>
                  <td className="fw-bold text-dark">
                    ₹{(pay.amount / 100).toLocaleString("en-IN")}
                  </td>
                  <td>
                    <span
                      className={
                        pay.status === "captured"
                          ? "status-active"
                          : "status-inactive"
                      }
                    >
                      {pay.status === "captured" ? "● Success" : "● Failed"}
                    </span>
                  </td>
                  <td className="text-muted">{formatDate(pay.created_at)}</td>
                  {/* <td>
                    <button className="btn-view">Details</button>
                  </td> */}
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="7" className="text-center py-4 text-muted">
                  No transactions found
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default PaymentHistory;
