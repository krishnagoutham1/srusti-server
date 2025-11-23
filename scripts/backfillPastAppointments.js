// scripts/backfillPastAppointments.js

//  ---------------- TO RUN WITH NPM SCRIPT  -----------------
// ==============npm run backfill:dry / backfill:apply=============

require("dotenv").config();
const { Op } = require("sequelize");
const { sequelize } = require("../config/db");
const { NriAppointment } = require("../models");

const isDryRun = process.argv.includes("--dry-run");

function todayIST() {
  const ist = new Date(
    new Date().toLocaleString("en-US", { timeZone: "Asia/Kolkata" })
  );
  const y = ist.getFullYear();
  const m = String(ist.getMonth() + 1).padStart(2, "0");
  const d = String(ist.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`; // YYYY-MM-DD
}

async function main() {
  try {
    await sequelize.authenticate();

    // Safety: check if status column exists in the model
    const hasStatus =
      NriAppointment.rawAttributes &&
      Object.prototype.hasOwnProperty.call(
        NriAppointment.rawAttributes,
        "status"
      );

    if (!hasStatus) {
      console.error(
        "[ERROR] NriAppointment.status not found. " +
          "Add the column first: ENUM('ACTIVE','INACTIVE') with default 'ACTIVE'."
      );
      process.exit(2);
    }

    const today = todayIST();

    if (isDryRun) {
      const rows = await NriAppointment.findAll({
        where: { appointment_date: { [Op.lt]: today } },
        attributes: ["appointment_id", "appointment_date", "status"],
        order: [["appointment_date", "ASC"]],
      });

      console.log(`(dry-run) Today: ${today}`);
      console.log(
        `(dry-run) Would set INACTIVE for ${rows.length} appointments with appointment_date < ${today}:`
      );
      rows.forEach((r) =>
        console.log(
          `- ${r.appointment_date}  | current status: ${r.status || "N/A"}`
        )
      );
      process.exit(0);
    } else {
      const [updated] = await NriAppointment.update(
        { status: "INACTIVE" },
        { where: { appointment_date: { [Op.lt]: today } } }
      );

      console.log(
        `Backfill complete. Marked ${updated} past appointments as INACTIVE (cutoff ${today}).`
      );
      process.exit(0);
    }
  } catch (err) {
    console.error(isDryRun ? "(dry-run) Failed:" : "Backfill failed:", err);
    process.exit(1);
  }
}

main();

// ------------------- TO UPDATE DIRECTLY ------------

// require("dotenv").config();
// const { Op } = require("sequelize");
// const { sequelize } = require("../config/db");
// const { NriAppointment } = require("../models");

// function todayIST() {
//   const istNow = new Date(
//     new Date().toLocaleString("en-US", { timeZone: "Asia/Kolkata" })
//   );
//   const y = istNow.getFullYear();
//   const m = String(istNow.getMonth() + 1).padStart(2, "0");
//   const d = String(istNow.getDate()).padStart(2, "0");
//   return `${y}-${m}-${d}`;
// }

// (async () => {
//   try {
//     await sequelize.authenticate();

//     const today = todayIST();

//     // Find past appointments
//     const pastAppointments = await NriAppointment.findAll({
//       where: { appointment_date: { [Op.lt]: today } },
//       attributes: ["appointment_id", "appointment_date", "status"],
//       order: [["appointment_date", "ASC"]],
//     });

//     console.log(`Today: ${today}`);
//     console.log(
//       `Found ${pastAppointments.length} past appointments that would be set to INACTIVE:`
//     );
//     pastAppointments.forEach((app) => {
//       console.log(
//         `- ${app.appointment_date} (Current status: ${app.status || "N/A"})`
//       );
//     });

//     process.exit(0);
//   } catch (err) {
//     console.error("Dry-run failed:", err);
//     process.exit(1);
//   }
// })();

// {
/*
  
  
  
  
  
  */
// }

// ------------------ to CHECK COUNT --------------

// require("dotenv").config();
// const { Op } = require("sequelize");
// const { sequelize } = require("../config/db");
// const { NriAppointment } = require("../models");

// function todayIST() {
//   const istNow = new Date(
//     new Date().toLocaleString("en-US", { timeZone: "Asia/Kolkata" })
//   );
//   const y = istNow.getFullYear();
//   const m = String(istNow.getMonth() + 1).padStart(2, "0");
//   const d = String(istNow.getDate()).padStart(2, "0");
//   return `${y}-${m}-${d}`;
// }

// (async () => {
//   try {
//     await sequelize.authenticate();

//     const today = todayIST();

//     // Find past appointments
//     const pastAppointments = await NriAppointment.findAll({
//       where: { appointment_date: { [Op.lt]: today } },
//       attributes: ["appointment_id", "appointment_date", "status"],
//       order: [["appointment_date", "ASC"]],
//     });

//     console.log(`Today: ${today}`);
//     console.log(
//       `Found ${pastAppointments.length} past appointments that would be set to INACTIVE:`
//     );
//     pastAppointments.forEach((app) => {
//       console.log(
//         `- ${app.appointment_date} (Current status: ${app.status || "N/A"})`
//       );
//     });

//     process.exit(0);
//   } catch (err) {
//     console.error("Dry-run failed:", err);
//     process.exit(1);
//   }
// })();

// scripts/backfillPastAppointmentsDryRun.js
