console.log("cron service started");

require("./nriAppointmentStatusJob");
require("./hourlyUpcomingSlotsCheck");
