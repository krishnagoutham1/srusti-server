// models/NriAppointmentSlots.js
const { DataTypes } = require("sequelize");
const { sequelize } = require("../config/db");

const NriAppointmentSlots = sequelize.define(
  "NriAppointmentSlots",
  {
    slot_id: {
      type: DataTypes.UUID,
      primaryKey: true,
      defaultValue: DataTypes.UUIDV4,
    },
    appointment_id: {
      type: DataTypes.UUID,
      allowNull: false,
    },
    // Keep a denormalized date for simpler queries
    ref_date: {
      type: DataTypes.DATEONLY,
      allowNull: false,
    },
    start_time: {
      type: DataTypes.STRING(5), // "HH:mm"
      allowNull: false,
    },
    end_time: {
      type: DataTypes.STRING(5), // "HH:mm"
      allowNull: false,
    },
    status: {
      type: DataTypes.ENUM(
        "AVAILABLE",
        "HOLD",
        "BOOKED",
        "CANCELLED"
        // "BLOCKED"
      ),
      allowNull: false,
      defaultValue: "AVAILABLE",
    },
    hold_until: {
      type: DataTypes.DATE,
      allowNull: true, // Only populated when status is "HOLD"
    },
    price_in_paise: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0, // e.g., ₹500 => 50000 paise
      validate: { min: 0 },
    },
    currency: {
      type: DataTypes.STRING(3), // ISO 4217
      allowNull: false,
      defaultValue: "INR",
    },
    consultation: {
      type: DataTypes.ENUM("PENDING", "COMPLETED"),
      allowNull: false,
      defaultValue: "PENDING",
    },

    payment_id: {
      type: DataTypes.UUID,
      allowNull: true, // e.g., Booking table primary key
    },
    booking_id: {
      type: DataTypes.UUID,
      allowNull: true, // e.g., payment table primary key
    },
  },
  {
    timestamps: true,
    tableName: "nri_appointment_slots",
  }
);

module.exports = NriAppointmentSlots;
