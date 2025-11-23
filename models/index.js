// models/index.js
const { sequelize } = require("../config/db");

// Import models
const Users = require("./Users");
const Otp = require("./Otp");

const NriAppointment = require("./NriAppointment");
const NriAppointmentSlots = require("./NriAppointmentSlots");
const NriSlotBooking = require("./NriSlotBooking");
const Payment = require("./Payment");

// ======================
// 🔗 Associations
// ======================

// Appointment → Slots (1:N)
NriAppointment.hasMany(NriAppointmentSlots, {
  foreignKey: "appointment_id",
  sourceKey: "appointment_id",
  as: "slots",
});
NriAppointmentSlots.belongsTo(NriAppointment, {
  foreignKey: "appointment_id",
  targetKey: "appointment_id",
  as: "appointment",
});

// Appointment → Bookings (1:N)
NriAppointment.hasMany(NriSlotBooking, {
  foreignKey: "appointment_id",
  sourceKey: "appointment_id",
  as: "bookings",
});
NriSlotBooking.belongsTo(NriAppointment, {
  foreignKey: "appointment_id",
  targetKey: "appointment_id",
  as: "appointment",
});

// Slot → Bookings (1:N)
NriAppointmentSlots.hasMany(NriSlotBooking, {
  foreignKey: "slot_id",
  sourceKey: "slot_id",
  as: "bookings",
});
NriSlotBooking.belongsTo(NriAppointmentSlots, {
  foreignKey: "slot_id",
  targetKey: "slot_id",
  as: "slot",
});

// Booking → Payment (1:1)
NriSlotBooking.hasOne(Payment, {
  foreignKey: "booking_id",
  sourceKey: "booking_id",
  as: "payment",
});
Payment.belongsTo(NriSlotBooking, {
  foreignKey: "booking_id",
  targetKey: "booking_id",
  as: "booking",
});

// ======================
// Export
// ======================
module.exports = {
  sequelize,
  Users,
  Otp,

  NriAppointment,
  NriAppointmentSlots,
  NriSlotBooking,
  Payment,
};
