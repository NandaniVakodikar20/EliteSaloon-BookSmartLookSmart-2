const AppointmentModel = require("../../models/AppointmentModel");
const StaffModel = require("../../models/StaffModel");
const ServiceModel = require("../../models/ServiceModel");
const { generateSlots, toMinutes } = require("../../utils/timeUtils");
const emailSendOptimizeCode = require("../../utils/emailSendOptimizeCode");
const OwnerModel = require("../../models/OwnerModel");
const CustomerModel = require("../../models/CustomerModel");

exports.bookAppointment = async (req, res) => {
  try {
    const { customerId, ownerId, staffId, serviceIds, date, startTime } =
      req.body;

    const services = await ServiceModel.find({ _id: { $in: serviceIds } });

    const totalDuration = services.reduce(
      (sum, s) => sum + s.serviceDuration,
      0,
    );
    const totalPrice = services.reduce((sum, s) => sum + s.servicePrice, 0);

    const { toMinutes, toTime } = require("../../utils/timeUtils");

    const endTime = toTime(toMinutes(startTime) + totalDuration);

    // conflict check
    const existing = await AppointmentModel.findOne({
      staffId,
      appointmentDate: date,
      appointmentStatus: { $in: ["PENDING", "CONFIRMED"] },
      $or: [
        {
          startTime: { $lt: endTime },
          endTime: { $gt: startTime },
        },
      ],
    });

    if (existing) {
      return res.status(400).json({ message: "Slot already booked" });
    }

    const appointment = await AppointmentModel.create({
      customerId,
      ownerId,
      staffId,
      services: services.map((s) => ({
        serviceId: s._id,
        serviceName: s.serviceName,
        duration: s.serviceDuration,
        price: s.servicePrice,
      })),
      appointmentDate: date,
      startTime,
      endTime,
      totalDuration,
      totalPrice,
    });

    res.json({ message: "Booking successful", appointment });

    const owner = await OwnerModel.findById(ownerId).select("ownerEmail ownerName"); 
    const customer = await CustomerModel.findById(customerId).select("customerName customerEmail");
    let subject = "New Appointment Booked";
    let message = `Dear ${owner.ownerName},\n\nYou have a new appointment booked by ${customer.customerName} on ${date} at ${startTime} for the following services:\n\n`;
    services.forEach((s) => {
      message += `- ${s.serviceName} (${s.serviceDuration} mins, ₹${s.servicePrice})\n`;
    }); 

    await emailSendOptimizeCode(owner.ownerEmail, subject, message);
   
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.getAvailableSlots = async (req, res) => {
  try {
    const { staffId, date, serviceIds } = req.body;

    //  Validation
    if (!staffId || !date || !serviceIds || serviceIds.length === 0) {
      return res.status(400).json({ message: "Missing required fields" });
    }

    //  Get services
    const services = await ServiceModel.find({
      _id: { $in: serviceIds },
    });

    if (!services.length) {
      return res.status(404).json({ message: "Services not found" });
    }

    //  Calculate total duration
    const totalDuration = services.reduce(
      (sum, s) => sum + s.serviceDuration,
      0,
    );

    //  Working hours (you can later make dynamic)
    const workStart = "10:00";
    const workEnd = "20:00";

    // Generate all possible slots
    const allSlots = generateSlots(workStart, workEnd, totalDuration);

    //  Get booked appointments
    const bookings = await AppointmentModel.find({
      staffId,
      appointmentDate: date,
      appointmentStatus: { $in: ["PENDING", "CONFIRMED"] },
    });

    // console.log("Bookings:", bookings);

    // Filter available slots ( FIXED LOGIC)
    const availableSlots = allSlots.filter((slot) => {
      return !bookings.some((b) => {
        return (
          toMinutes(slot.startTime) < toMinutes(b.endTime) &&
          toMinutes(slot.endTime) > toMinutes(b.startTime)
        );
      });
    });

    //  Response
    res.json({
      totalDuration,
      availableSlots,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
};

exports.appointmentResult = async (req, res) => {
  try {
    const { appointmentId, status } = req.body;

    // Validate status
    if (!["CONFIRMED", "CANCELLED"].includes(status)) {
      return res.status(400).json({
        message: "Invalid status. Only CONFIRMED or CANCELLED allowed",
      });
    }

    // Find appointment
    const appointment = await AppointmentModel.findById(appointmentId).populate(
      "customerId",
      "customerEmail",
    );

    if (!appointment) {
      return res.status(404).json({
        message: "Appointment not found",
      });
    }

    //  Optional: prevent updating completed appointment
    if (appointment.appointmentStatus === "COMPLETED") {
      return res.status(400).json({
        message: "Cannot update completed appointment",
      });
    }

    const email = appointment.customerId.customerEmail;
    console.log(email);

    if (status === "CONFIRMED") {
      console.log("Procede to send Mail for confirm");
    } else {
      console.log("Procede to send Mail for cancel");
    }

    const subject = "Mail for Appointment Status";
    let message = `Your booking on ${appointment.appointmentDate} at ${appointment.startTime} has been 
                    ${status === "CONFIRMED" ? "successfully confirmed" : "cancelled"}.\n\nThank you for choosing our service!`;

    emailSendOptimizeCode(email, subject, message);

    appointment.appointmentStatus = status;
    await appointment.save();

    res.json({
      message: `Appointment ${status.toLowerCase()} successfully`,
      appointment,
    });
  } catch (error) {
    res.status(500).json({
      error: error.message,
    });
  }
};

exports.getSalons = async (req, res) => {
  try {
    const { pincode } = req.params; // or req.query

    if (!pincode) {
      return res.status(400).json({
        success: false,
        message: "Pincode is required",
      });
    }

    const salons = await OwnerModel.find({
      ownerShopPincode: pincode,
      ownerApprovedStatus: "APPROVE", // only approved shops
      ownerAccountStatus: "ACTIVE", // only active shops
    }).select("-ownerPassword -ownerOTP"); // remove sensitive data

    if (salons.length === 0) {
      return res.status(404).json({
        success: false,
        message: "No salons found in this area",
      });
    }

    res.status(200).json({
      success: true,
      message: "Salons fetched successfully",
      data: salons,
    });
  } catch (error) {
    console.error("Error fetching salons:", error);
    res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};

exports.getOwnersAppointments = async (req, res) => {
  try {
    const { ownerId } = req.params;

    const appointments = await AppointmentModel.find({ ownerId: ownerId })
      .populate("customerId", "customerName customerEmail")
      .populate("staffId", "staffName staffEmail")
      .populate("ownerId", "ownerName ownerShopName")
      .populate("services.serviceId", "serviceName servicePrice");

    console.log("Particular Owner Appointments :", appointments);

    res.json({ appointments });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error fetching appointments" });
  }
};

exports.getCustomersAppointments = async (req, res) => {
  try {
    
    const  customerId  = req.data.customerId;
    const appointments = await AppointmentModel.find({ customerId: customerId });

    console.log("Particular Customer Appointments :", appointments);

    res.json({ appointments });

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error fetching appointments" });
  }

};

// exports.rescheduleAppointment = async (req, res) => {
  

//     try {
//         const { appointmentId, newDate, newStartTime } = req.body;

//         const appointment = await AppointmentModel.findById(appointmentId);

//         if (!appointment) {
//             return res.status(404).json({ message: "Appointment not found" });
//         }

//         const { toMinutes, toTime } = require("../../utils/timeUtils");

//         const newEndTime = toTime(
//             toMinutes(newStartTime) + appointment.totalDuration
//         );

//         // conflict check (exclude current)
//         const conflict = await AppointmentModel.findOne({
//             staffId: appointment.staffId,
//             appointmentDate: newDate,
//             _id: { $ne: appointmentId },
//             appointmentStatus: { $in: ["PENDING", "CONFIRMED"] },
//             $or: [
//                 {
//                     startTime: { $lt: newEndTime },
//                     endTime: { $gt: newStartTime }
//                 }
//             ]
//         });

//         if (conflict) {
//             return res.status(400).json({
//                 message: "Selected slot not available"
//             });
//         }

//         appointment.appointmentDate = newDate;
//         appointment.startTime = newStartTime;
//         appointment.endTime = newEndTime;

//         await appointment.save();

//         res.json({
//             message: "Appointment rescheduled successfully",
//             appointment
//         });

//         const ownerEmail = await OwnerModel.findById(appointment.ownerId).select("ownerEmail");
//         const customerName = await CustomerModel.findById(appointment.customerId).select("customerName");
        
//         // Send email notification to owner about appointment rescheduling
//         let subject = "Appointment Reschedule Notification";
//         let message = `Dear Owner,\n\nThe appointment with Name ${customerName.customerName} has been rescheduled for the Date: ${appointment.appointmentDate}and Time: ${appointment.startTime} by the customer.\n\nBest regards,\nElite Saloon Team`;
//         await emailSendOptimizeCode(ownerEmail.ownerEmail, subject, message);

//     } catch (err) {
//         res.status(500).json({ error: err.message });
//     }
// };




exports.rescheduleAppointment = async (req, res) => {
  try {
    const { appointmentId, newDate, newStartTime, serviceIds } = req.body;

    const appointment = await AppointmentModel.findById(appointmentId);

    if (!appointment) {
      return res.status(404).json({ message: "Appointment not found" });
    }

    let updatedServices = appointment.services;
    let totalDuration = appointment.totalDuration;
    let totalPrice = appointment.totalPrice;

    // ✅ IF services changed
    if (serviceIds && serviceIds.length > 0) {
      const services = await ServiceModel.find({
        _id: { $in: serviceIds },
      });

      if (!services.length) {
        return res.status(404).json({ message: "Services not found" });
      }

      // ✅ ONLY NAMING FIXED HERE
      updatedServices = services.map((s) => ({
        serviceId: s._id,
        serviceName: s.serviceName,
        duration: s.serviceDuration, 
        price: s.servicePrice,       
      }));

      // ✅ recalc (same logic)
      totalDuration = services.reduce(
        (sum, s) => sum + s.serviceDuration,
        0
      );

      totalPrice = services.reduce(
        (sum, s) => sum + s.servicePrice,
        0
      );
    }

    const { toMinutes, toTime } = require("../../utils/timeUtils");

    const newEndTime = toTime(
      toMinutes(newStartTime) + totalDuration
    );

    // ✅ conflict check (same)
    const conflict = await AppointmentModel.findOne({
      staffId: appointment.staffId,
      appointmentDate: newDate,
      _id: { $ne: appointmentId },
      appointmentStatus: { $in: ["PENDING", "CONFIRMED"] },
      $or: [
        {
          startTime: { $lt: newEndTime },
          endTime: { $gt: newStartTime },
        },
      ],
    });

    if (conflict) {
      return res.status(400).json({
        message: "Selected slot not available",
      });
    }

    // ✅ UPDATE (same)
    appointment.appointmentDate = newDate;
    appointment.startTime = newStartTime;
    appointment.endTime = newEndTime;

    appointment.services = updatedServices;
    appointment.totalDuration = totalDuration;
    appointment.totalPrice = totalPrice;

    appointment.appointmentStatus = "PENDING";

    console.log("UPDATED APPOINTMENT:", appointment);

    await appointment.save();

    console.log("SAVED STATUS:", appointment.appointmentStatus);

    res.json({
      message: "Appointment rescheduled successfully",
      appointment,
    });

    // email (same)
    const ownerEmail = await OwnerModel.findById(
      appointment.ownerId
    ).select("ownerEmail");

    const customerName = await CustomerModel.findById(
      appointment.customerId
    ).select("customerName");

    let subject = "Appointment Reschedule Notification";

    let message = `Dear Owner,\n\nThe appointment with Name ${customerName.customerName} has been rescheduled for Date: ${appointment.appointmentDate} and Time: ${appointment.startTime}.\n\nBest regards,\nElite Saloon Team`;

    await emailSendOptimizeCode(ownerEmail.ownerEmail, subject, message);

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};