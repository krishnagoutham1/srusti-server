// cronJobs/hourlyUpcomingSlotsJob.js
const cron = require("node-cron");
const { Op } = require("sequelize");
const { NriAppointmentSlots } = require("../models");

// Main logic: check upcoming booked slots in the next hour
async function hourlyUpcomingSlotsCheck() {
  try {
    const now = new Date();
    const currentDate = now.toISOString().slice(0, 10);

    // Define next hour range (e.g. at 23:00 → check 00:00–01:00)
    const nextHourStart = new Date(now.getTime() + 60 * 60 * 1000);
    const nextHourEnd = new Date(now.getTime() + 2 * 60 * 60 * 1000);

    const nextHourStartDate = nextHourStart.toISOString().slice(0, 10);
    const nextHourStartTime = nextHourStart.toTimeString().slice(0, 5);
    const nextHourEndTime = nextHourEnd.toTimeString().slice(0, 5);

    // If next hour crosses into tomorrow, switch to that date
    const dateToCheck =
      nextHourStartDate !== currentDate ? nextHourStartDate : currentDate;

    // 1️⃣ Check if there are any appointments on that date
    const appointments = await NriAppointmentSlots.count({
      where: { ref_date: dateToCheck },
    });

    if (appointments === 0) {
      console.log(
        `🔔 [${now.toLocaleString()}] No appointments for ${dateToCheck}.`
      );
      return;
    }

    // 2️⃣ Find BOOKED slots in the upcoming 1-hour window
    const bookedSlots = await NriAppointmentSlots.findAll({
      where: {
        ref_date: dateToCheck,
        status: "BOOKED",
        start_time: {
          [Op.between]: [nextHourStartTime, nextHourEndTime],
        },
      },
      order: [["start_time", "ASC"]],
    });

    if (bookedSlots.length === 0) {
      console.log(
        `🔔 [${now.toLocaleString()}] No booked slots between ${nextHourStartTime} and ${nextHourEndTime} (${dateToCheck}).`
      );
      return;
    }

    // 3️⃣ Print booked slots
    console.log(
      `\n🔔 [${now.toLocaleString()}] Upcoming booked slots between ${nextHourStartTime} and ${nextHourEndTime} (${dateToCheck}):`
    );
    bookedSlots.forEach((slot) => {
      console.log(
        `📅 ${slot.ref_date} | 🕒 ${slot.start_time}–${slot.end_time} | 💰 ₹${
          slot.price_in_paise / 100
        } ${slot.currency}`
      );
    });
  } catch (err) {
    console.error("❌ Error in hourlyUpcomingSlotsCheck:", err.message);
  }
}

// ⏱ Schedule job to run automatically at the start of every hour
cron.schedule("0 * * * *", () => {
  console.log("⏰ Running hourly NRI slot check...");
  hourlyUpcomingSlotsCheck();
});

console.log(
  "✅ Hourly NRI Appointment Reminder scheduled (auto-starts on require)."
);
