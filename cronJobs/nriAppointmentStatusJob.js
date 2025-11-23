const cron = require("node-cron");
const { Op } = require("sequelize");
const NriAppointment = require("../models/NriAppointment");

// 🕛 Run every night at 12:05 AM (IST)
cron.schedule(
  "5 0 * * *",
  async () => {
    console.log("🕐 Running NRI Appointment status update job...");

    try {
      const today = new Date();
      const dateOnly = today.toISOString().split("T")[0]; // 'YYYY-MM-DD'

      // ✅ Mark past appointments as INACTIVE
      const [updatedCount] = await NriAppointment.update(
        { status: "INACTIVE" },
        {
          where: {
            status: "ACTIVE",
            appointment_date: { [Op.lt]: dateOnly }, // before today
          },
        }
      );

      console.log(`✅ ${updatedCount} appointments marked as INACTIVE.`);
    } catch (error) {
      console.error("❌ Error updating NRI appointment statuses:", error);
    }
  },
  { timezone: "Asia/Kolkata" } // 👈 runs at 12:05 AM IST
);

console.log("✅ NRI Appointment Filter expired appointments INACTIVE.");
