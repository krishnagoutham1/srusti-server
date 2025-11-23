const {
  refreshSlots,
  getAllBookings,
} = require("../controllers/appointmentController");
const {
  createNriAppointmentController,
  getAllNriAppointments,
  editNriAppointmentSlots,
  getSlotsByAppointmentId,
  getPublishedAppointmentsByMonth,
  publishAppointment,
  deleteAppointment,
  getSlotById,
  appointmentBooking,
  confirmBookingController,
} = require("../controllers/nriAppointmentController");
const { requireAuth } = require("../middleware/authMiddleware");

const router = require("express").Router();

// Appointment admin side
router.post("/", requireAuth, createNriAppointmentController);
router.get("/", requireAuth, getAllNriAppointments);

router.post("/publish", requireAuth, publishAppointment);
router.delete("/:appointment_id", requireAuth, deleteAppointment);
router.put("/", requireAuth, editNriAppointmentSlots);

// Appoinmet user side
router.get("/refresh-slots", refreshSlots);
router.get("/published-appointments-month", getPublishedAppointmentsByMonth);
router.get("/:appointment_id/slots", getSlotsByAppointmentId);
router.get("/:slotId", getSlotById);

router.post("/confirm-slot", appointmentBooking);
router.post("/confirm-slot-booking", confirmBookingController);

// bookings admin side
router.get("/getAllBookings", getAllBookings);

module.exports = router;
