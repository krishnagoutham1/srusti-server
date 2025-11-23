// models/NriAppointment.js
const { DataTypes } = require("sequelize");
const { sequelize } = require("../config/db");

const NriAppointment = sequelize.define(
  "NriAppointment",
  {
    appointment_id: {
      type: DataTypes.UUID,
      primaryKey: true,
      defaultValue: DataTypes.UUIDV4,
    },
    appointment_date: {
      type: DataTypes.DATEONLY,
      allowNull: false,
      unique: true, // one config per date
    },
    duration: {
      type: DataTypes.INTEGER,
      allowNull: false,
      validate: { isIn: [[30, 60]] },
    },
    total_appointments: {
      type: DataTypes.INTEGER,
      allowNull: false,
      validate: { min: 0 },
    },
    is_published: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false,
    },
    status: {
      type: DataTypes.ENUM("ACTIVE", "INACTIVE"),
      allowNull: false,
      defaultValue: "ACTIVE",
    },
    appointment_price_in_paise: {
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
    notes: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
  },
  {
    tableName: "nri_appointments",
    timestamps: true,
  }
);

module.exports = NriAppointment;
