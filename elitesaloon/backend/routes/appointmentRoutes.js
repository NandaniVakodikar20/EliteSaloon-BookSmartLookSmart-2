const express = require("express");
const routes = express.Router();
const authMiddleware = require("../middleware/authMiddleware");

const {
  getAvailableSlots,
  bookAppointment,
  appointmentResult,
  getSalons,
  getOwnersAppointments,
  getCustomersAppointments,
  rescheduleAppointment
} = require("../controllers/AppointmentController/appointmentController");

routes.post("/slots", getAvailableSlots);
routes.post("/book", bookAppointment);
routes.put("/appointment-result", appointmentResult);
routes.get("/get-salon/:pincode", getSalons);
routes.get("/get-appointment/:ownerId", getOwnersAppointments );
// routes.get("/customer-appointments/:customerId", getCustomersAppointments );
routes.get("/customer-appointments", authMiddleware, getCustomersAppointments );
routes.put("/reschedule-appointment", rescheduleAppointment);

module.exports = routes;
