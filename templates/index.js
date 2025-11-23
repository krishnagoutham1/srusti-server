// templates/index.js

const otpTemplate = require("./otpTemplate");
const userCreationTemplate = require("./userCreation");
const accountApprovedTemplate = require("./accountApprovedTemplate");
const adminUpcomingAppointments = require("./adminUpcomingAppointments");
const userAppointmentReminder = require("./userAppointmentReminder");
const bookingConfirmation = require("./bookingConfirmation");

// ✅ Export all templates from one place
module.exports = {
  otpTemplate,
  userCreationTemplate,
  accountApprovedTemplate,
  adminUpcomingAppointments,
  userAppointmentReminder,
  bookingConfirmation,
};
