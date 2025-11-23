// 🔧 Script: bootstrapAdmin.js
// Creates a default Super Admin user if none exists in the `Users` table.
// Used during initial setup to ensure admin access for system configuration.
// Automatically hashes the default password and skips creation if an admin already exists.

const bcrypt = require("bcryptjs");
const { Users } = require("../models");

const bootstrapAdmin = async () => {
  try {
    const adminExists = await Users.findOne({ where: { role: "ADMIN" } });

    if (!adminExists) {
      const defaultEmail = process.env.ADMIN_EMAIL || "admin@example.com";
      const defaultPassword = process.env.ADMIN_PASSWORD || "Admin@123";

      const hashedPassword = await bcrypt.hash(defaultPassword, 10);

      await Users.create({
        name: "Super Admin",
        email: defaultEmail,
        mobile: "9999999999",
        password: hashedPassword,
        role: "ADMIN",
        verified: true,
        status: "ACTIVE",
        createdBy: "System",
      });

      console.log(`✅ Default admin created successfully: ${defaultEmail}`);
    } else {
      console.log("ℹ️ Admin already exists — skipping bootstrap.");
    }
  } catch (error) {
    console.error("❌ Error bootstrapping admin:", error.message);
  }
};

module.exports = { bootstrapAdmin };
