import { jsPDF } from "jspdf";
import autoTable from "jspdf-autotable";

/**
 * Format currency to INR style
 */
export const formatCurrency = (amount) => {
  const num = Number(amount) || 0;
  return `Rs. ${num.toLocaleString("en-IN", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
};

/**
 * Format date to readable string
 */
export const formatDate = (dateInput) => {
  if (!dateInput) return new Date().toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" });
  const d = new Date(dateInput);
  return d.toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
};

/**
 * Generate and download professional PDF invoice
 */
export const downloadInvoicePDF = (order) => {
  if (!order) return;

  const doc = new jsPDF({
    orientation: "portrait",
    unit: "mm",
    format: "a4",
  });

  const pageWidth = doc.internal.pageSize.getWidth();
  const primaryBurgundy = [128, 0, 32]; // #800020
  const secondaryGold = [212, 175, 55]; // #d4af37
  const charcoal = [54, 69, 79];
  const lightGray = [245, 245, 245];

  // 1. Top Decorative Banner
  doc.setFillColor(...primaryBurgundy);
  doc.rect(0, 0, pageWidth, 22, "F");

  doc.setFillColor(...secondaryGold);
  doc.rect(0, 22, pageWidth, 2, "F");

  // Header Title
  doc.setTextColor(255, 255, 255);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(16);
  doc.text("ELITESALON", 14, 14);

  doc.setFont("helvetica", "normal");
  doc.setFontSize(9);
  doc.text("BOOK SMART, LOOK SMART", 14, 19);

  doc.setFont("helvetica", "bold");
  doc.setFontSize(14);
  doc.text("TAX INVOICE / RECEIPT", pageWidth - 14, 15, { align: "right" });

  // 2. Store Info (Left) & Invoice Metadata (Right)
  let y = 34;

  // Left side: Store Details
  doc.setTextColor(...charcoal);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(11);
  doc.text("EliteSalon Retail & Services", 14, y);

  doc.setFont("helvetica", "normal");
  doc.setFontSize(9);
  doc.setTextColor(90, 90, 90);
  doc.text("Official Salon Care & Beauty Store", 14, y + 5);
  doc.text("Email: elitesaloon18@gmail.com", 14, y + 10);
  doc.text("Support: Available 7 days a week", 14, y + 15);

  // Right side: Invoice Details Box
  doc.setFillColor(...lightGray);
  doc.roundedRect(pageWidth - 85, y - 4, 71, 32, 2, 2, "F");

  doc.setFont("helvetica", "bold");
  doc.setFontSize(8.5);
  doc.setTextColor(...primaryBurgundy);
  doc.text(`Invoice No:`, pageWidth - 81, y + 2);
  doc.setTextColor(...charcoal);
  doc.setFont("helvetica", "normal");
  doc.text(`${order.invoiceNumber || "INV-" + (order._id || "").slice(-6)}`, pageWidth - 42, y + 2);

  doc.setFont("helvetica", "bold");
  doc.text(`Invoice Date:`, pageWidth - 81, y + 7);
  doc.setFont("helvetica", "normal");
  doc.text(`${formatDate(order.invoiceDate || order.createdAt)}`, pageWidth - 42, y + 7);

  doc.setFont("helvetica", "bold");
  doc.text(`Order ID:`, pageWidth - 81, y + 12);
  doc.setFont("helvetica", "normal");
  doc.text(`${order.orderNumber || order._id || "N/A"}`, pageWidth - 42, y + 12);

  doc.setFont("helvetica", "bold");
  doc.text(`Payment Status:`, pageWidth - 81, y + 17);
  doc.setTextColor(34, 139, 34); // Green
  doc.text(`${(order.paymentStatus || "PAID").toUpperCase()}`, pageWidth - 42, y + 17);

  doc.setTextColor(...charcoal);
  doc.setFont("helvetica", "bold");
  doc.text(`Payment Ref:`, pageWidth - 81, y + 22);
  doc.setFont("helvetica", "normal");
  doc.text(`${(order.razorpayPaymentId || "N/A").slice(0, 15)}`, pageWidth - 42, y + 22);

  // 3. Customer Billing / Shipping Information
  y = 74;
  doc.setFillColor(250, 248, 245);
  doc.roundedRect(14, y, pageWidth - 28, 26, 2, 2, "F");

  doc.setFont("helvetica", "bold");
  doc.setFontSize(10);
  doc.setTextColor(...primaryBurgundy);
  doc.text("CUSTOMER & SHIPPING DETAILS", 18, y + 6);

  doc.setFont("helvetica", "normal");
  doc.setFontSize(9);
  doc.setTextColor(...charcoal);
  doc.text(`Name: ${order.customerName || "Customer"}`, 18, y + 12);
  doc.text(`Email: ${order.customerEmail || "N/A"}`, 18, y + 17);
  doc.text(`Mobile: ${order.customerMobile || "N/A"}`, 18, y + 22);

  const addr = order.shippingAddress || {};
  const addressLine1 = addr.street || "Address provided";
  const addressLine2 = `${addr.city || ""}${addr.city && addr.state ? ", " : ""}${addr.state || ""} - ${addr.pincode || ""}`;

  doc.text(`Shipping Address:`, 110, y + 12);
  doc.setFont("helvetica", "normal");
  doc.text(addressLine1, 110, y + 17);
  doc.text(addressLine2, 110, y + 22);

  // 4. Products Table
  const tableData = (order.items || []).map((item, index) => {
    const unitPrice = Number(item.productPrice) || 0;
    const qty = Number(item.quantity) || 1;
    const lineTot = Number(item.lineTotal) || unitPrice * qty;
    return [
      index + 1,
      item.productName || "Salon Product",
      item.productType || "Cosmetics",
      qty,
      `Rs. ${unitPrice.toFixed(2)}`,
      `Rs. ${lineTot.toFixed(2)}`,
    ];
  });

  autoTable(doc, {
    startY: 106,
    head: [["#", "Product Description", "Type", "Qty", "Unit Price", "Total"]],
    body: tableData,
    theme: "striped",
    headStyles: {
      fillColor: primaryBurgundy,
      textColor: [255, 255, 255],
      fontSize: 9,
      fontStyle: "bold",
    },
    bodyStyles: {
      fontSize: 9,
      textColor: charcoal,
    },
    alternateRowStyles: {
      fillColor: [249, 246, 240],
    },
    columnStyles: {
      0: { cellWidth: 10, halign: "center" },
      1: { cellWidth: 70 },
      2: { cellWidth: 32 },
      3: { cellWidth: 15, halign: "center" },
      4: { cellWidth: 26, halign: "right" },
      5: { cellWidth: 29, halign: "right" },
    },
    margin: { left: 14, right: 14 },
  });

  // 5. Financial Summary (Right aligned)
  const finalY = doc.lastAutoTable.finalY + 8;
  const summaryX = pageWidth - 80;

  doc.setFont("helvetica", "normal");
  doc.setFontSize(9);
  doc.setTextColor(80, 80, 80);

  doc.text("Subtotal:", summaryX, finalY);
  doc.text(`Rs. ${(Number(order.subtotal) || 0).toFixed(2)}`, pageWidth - 14, finalY, { align: "right" });

  doc.text("Delivery / Shipping:", summaryX, finalY + 5);
  const shippingText = Number(order.shippingCharges) > 0 ? `Rs. ${Number(order.shippingCharges).toFixed(2)}` : "FREE";
  doc.text(shippingText, pageWidth - 14, finalY + 5, { align: "right" });

  doc.text("GST Tax (18% included):", summaryX, finalY + 10);
  doc.text(`Rs. ${(Number(order.taxAmount) || 0).toFixed(2)}`, pageWidth - 14, finalY + 10, { align: "right" });

  doc.setDrawColor(...secondaryGold);
  doc.setLineWidth(0.5);
  doc.line(summaryX, finalY + 13, pageWidth - 14, finalY + 13);

  doc.setFont("helvetica", "bold");
  doc.setFontSize(11);
  doc.setTextColor(...primaryBurgundy);
  doc.text("Final Total Amount:", summaryX, finalY + 19);
  doc.text(`Rs. ${(Number(order.finalAmount) || 0).toFixed(2)}`, pageWidth - 14, finalY + 19, { align: "right" });

  // 6. Payment Information Box
  doc.setFillColor(...lightGray);
  doc.roundedRect(14, finalY - 2, 75, 24, 2, 2, "F");

  doc.setFont("helvetica", "bold");
  doc.setFontSize(8.5);
  doc.setTextColor(...charcoal);
  doc.text("Payment Verification Details", 18, finalY + 4);

  doc.setFont("helvetica", "normal");
  doc.setFontSize(8);
  doc.setTextColor(90, 90, 90);
  doc.text(`Method: Razorpay Payment Gateway`, 18, finalY + 9);
  doc.text(`Transaction Ref: ${order.razorpayPaymentId || "Verified Online"}`, 18, finalY + 14);
  doc.text(`Order Reference: ${order.razorpayOrderId || "N/A"}`, 18, finalY + 19);

  // 7. Footer
  const footerY = 280;
  doc.setDrawColor(...secondaryGold);
  doc.setLineWidth(0.5);
  doc.line(14, footerY - 5, pageWidth - 14, footerY - 5);

  doc.setFont("helvetica", "italic");
  doc.setFontSize(8);
  doc.setTextColor(120, 120, 120);
  doc.text(
    "Thank you for choosing EliteSalon. This is an official computer-generated receipt for your purchase.",
    pageWidth / 2,
    footerY,
    { align: "center" }
  );
  doc.text(
    "For customer inquiries or salon service bookings, please reach out to elitesaloon18@gmail.com",
    pageWidth / 2,
    footerY + 4,
    { align: "center" }
  );

  // 8. Save and download
  const filename = `invoice-${order.orderNumber || order._id || "order"}.pdf`;
  doc.save(filename);
};

/**
 * Print invoice layout using standard browser print
 */
export const printInvoice = (order) => {
  if (!order) return;

  const printWindow = window.open("", "_blank");
  if (!printWindow) {
    alert("Please allow popups to print the invoice.");
    return;
  }

  const addr = order.shippingAddress || {};
  const itemsHtml = (order.items || [])
    .map(
      (item, idx) => `
    <tr>
      <td style="padding: 10px; border-bottom: 1px solid #eee; text-align: center;">${idx + 1}</td>
      <td style="padding: 10px; border-bottom: 1px solid #eee;"><strong>${item.productName}</strong><br><small style="color: #666;">${item.productType || "Cosmetics"}</small></td>
      <td style="padding: 10px; border-bottom: 1px solid #eee; text-align: center;">${item.quantity}</td>
      <td style="padding: 10px; border-bottom: 1px solid #eee; text-align: right;">₹${Number(item.productPrice).toFixed(2)}</td>
      <td style="padding: 10px; border-bottom: 1px solid #eee; text-align: right;"><strong>₹${Number(item.lineTotal || item.productPrice * item.quantity).toFixed(2)}</strong></td>
    </tr>`
    )
    .join("");

  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <title>Invoice - ${order.orderNumber || "EliteSalon"}</title>
      <style>
        body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; margin: 40px; color: #333; line-height: 1.5; }
        .header { display: flex; justify-content: space-between; border-bottom: 3px solid #800020; padding-bottom: 20px; }
        .brand { color: #800020; font-size: 28px; font-weight: bold; }
        .brand-sub { color: #d4af37; font-size: 13px; font-weight: 600; letter-spacing: 1px; }
        .invoice-title { text-align: right; }
        .invoice-title h2 { margin: 0; color: #800020; }
        .details-grid { display: flex; justify-content: space-between; margin: 30px 0; gap: 20px; }
        .details-box { background: #faf8f5; border: 1px solid #eee; padding: 16px; border-radius: 8px; flex: 1; }
        .details-box h4 { margin-top: 0; color: #800020; border-bottom: 1px solid #ddd; padding-bottom: 6px; }
        table { width: 100%; border-collapse: collapse; margin-top: 20px; }
        th { background: #800020; color: #fff; padding: 12px 10px; text-align: left; }
        .summary-wrap { display: flex; justify-content: flex-end; margin-top: 25px; }
        .summary-box { width: 320px; background: #fafafa; border: 1px solid #eee; border-radius: 8px; padding: 16px; }
        .summary-row { display: flex; justify-content: space-between; margin-bottom: 8px; font-size: 14px; }
        .summary-total { border-top: 2px solid #800020; padding-top: 10px; margin-top: 10px; font-size: 18px; font-weight: bold; color: #800020; }
        .footer { text-align: center; margin-top: 50px; padding-top: 20px; border-top: 1px solid #eee; font-size: 12px; color: #888; }
        @media print {
          body { margin: 0; padding: 20px; }
          .no-print { display: none; }
        }
      </style>
    </head>
    <body>
      <div class="header">
        <div>
          <div class="brand">EliteSalon</div>
          <div class="brand-sub">BOOK SMART, LOOK SMART</div>
          <div style="font-size: 12px; color: #666; margin-top: 5px;">
            Official Beauty & Grooming Store<br>
            Email: elitesaloon18@gmail.com
          </div>
        </div>
        <div class="invoice-title">
          <h2>TAX INVOICE</h2>
          <div style="font-size: 13px; color: #555;">
            <strong>Invoice #:</strong> ${order.invoiceNumber || "INV-" + (order._id || "").slice(-6)}<br>
            <strong>Date:</strong> ${formatDate(order.invoiceDate || order.createdAt)}<br>
            <strong>Order #:</strong> ${order.orderNumber || "N/A"}<br>
            <strong>Status:</strong> <span style="color: #2e7d32; font-weight: bold;">${(order.paymentStatus || "PAID").toUpperCase()}</span>
          </div>
        </div>
      </div>

      <div class="details-grid">
        <div class="details-box">
          <h4>Customer Details</h4>
          <strong>${order.customerName || "Customer"}</strong><br>
          Email: ${order.customerEmail || "N/A"}<br>
          Phone: ${order.customerMobile || "N/A"}
        </div>
        <div class="details-box">
          <h4>Shipping Address</h4>
          ${addr.street || "Address"}<br>
          ${addr.city || ""}, ${addr.district ? addr.district + ", " : ""}${addr.state || ""} - ${addr.pincode || ""}<br>
          Country: India
        </div>
        <div class="details-box">
          <h4>Payment Information</h4>
          Method: Razorpay Online<br>
          Transaction Ref: <code>${order.razorpayPaymentId || "N/A"}</code><br>
          Currency: INR (₹)
        </div>
      </div>

      <table>
        <thead>
          <tr>
            <th style="text-align: center; width: 40px;">#</th>
            <th>Product Description</th>
            <th style="text-align: center; width: 60px;">Qty</th>
            <th style="text-align: right; width: 100px;">Price</th>
            <th style="text-align: right; width: 120px;">Line Total</th>
          </tr>
        </thead>
        <tbody>
          ${itemsHtml}
        </tbody>
      </table>

      <div class="summary-wrap">
        <div class="summary-box">
          <div class="summary-row"><span>Subtotal:</span><span>₹${Number(order.subtotal || 0).toFixed(2)}</span></div>
          <div class="summary-row"><span>Shipping Charges:</span><span>${Number(order.shippingCharges) > 0 ? "₹" + Number(order.shippingCharges).toFixed(2) : "FREE"}</span></div>
          <div class="summary-row"><span>GST (18% included):</span><span>₹${Number(order.taxAmount || 0).toFixed(2)}</span></div>
          <div class="summary-row summary-total"><span>Total Paid:</span><span>₹${Number(order.finalAmount || 0).toFixed(2)}</span></div>
        </div>
      </div>

      <div class="footer">
        Thank you for your business with EliteSalon!<br>
        For inquiries regarding this purchase, contact support at elitesaloon18@gmail.com
      </div>

      <script>
        window.onload = function() {
          window.print();
        };
      </script>
    </body>
    </html>
  `;

  printWindow.document.open();
  printWindow.document.write(html);
  printWindow.document.close();
};
