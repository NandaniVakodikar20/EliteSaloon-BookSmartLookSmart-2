const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");
require("dotenv").config();

const app = express();

app.use(cors());
app.use(express.json());

app.use("/uploads", express.static("C:/uploadEliteSaloonImages"));

app.use("/default", express.static("C:/uploadEliteSaloonImages/default"));

// Connect to MongoDB
// mongoose.connect('mongodb://localhost:27017/elitesaloon')
mongoose
  .connect("mongodb://127.0.0.1:27017/elitesaloon")

  .then(() => console.log("MongoDB connected"))
  .catch((err) => console.log(err, "MongoDB connection error"));

// mongoose
//   .connect(process.env.MONGO_URL)
//   .then(() => console.log("MongoDB connected"))
//   .catch((err) => console.log(err, "MongoDB connection error"));

//routes for customer
app.use("/customer", require("./routes/customerRoutes"));

//routes for owner
app.use("/owner", require("./routes/ownerRoutes"));

app.use("/admin", require("./routes/adminRoutes"));

app.use("/appointment", require("./routes/appointmentRoutes"));

// app.use("/appointment", require("./routes/appointmentRoutes") );

app.use("/subscription", require("./routes/subscriptionRouter"));

app.use("/payment", require("./routes/paymentRoutes"));
   app.use("/guest",require("./routes/guestRoutes"));
app.listen(5000, () => {
  console.log("Server is running on port 5000");
});
