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
  getNriAppointmentById,
  getAdminSlotById,
  markConsultationCompleted,
  markExpiredAppointments,
} = require("../controllers/nriAppointmentController");
const { requireAuth } = require("../middleware/authMiddleware");

const router = require("express").Router();

// Appointment admin side
router.post("/", requireAuth, createNriAppointmentController);
router.get("/", requireAuth, getAllNriAppointments);
router.get("/appointment/:id", requireAuth, getNriAppointmentById);

router.post("/publish", requireAuth, publishAppointment);
router.delete("/:appointment_id", requireAuth, deleteAppointment);
router.put("/", requireAuth, editNriAppointmentSlots);

// Appoinmet user side
router.get("/refresh-slots", refreshSlots);
router.get("/published-appointments-month", getPublishedAppointmentsByMonth);
router.get("/appointment/:appointment_id/slots", getSlotsByAppointmentId);
router.get("/slot/:slotId", getSlotById);
router.get("/admin/slot/:slotId", requireAuth, getAdminSlotById);

router.post("/confirm-slot", appointmentBooking);
router.post("/confirm-slot-booking", confirmBookingController);

router.patch(
  "/slots/:slotId/consultation-complete",
  requireAuth,
  markConsultationCompleted
);

router.patch("/expire-appointments", markExpiredAppointments);

// bookings admin side
router.get("/getAllBookings", requireAuth, getAllBookings);

module.exports = router;
