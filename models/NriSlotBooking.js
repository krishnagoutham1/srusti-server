const { DataTypes } = require("sequelize");
const { sequelize } = require("../config/db");

const NriSlotBooking = sequelize.define(
  "NriSlotBooking",
  {
    booking_id: {
      type: DataTypes.UUID,
      primaryKey: true,
      defaultValue: DataTypes.UUIDV4,
    },

    appointment_id: {
      type: DataTypes.UUID,
      allowNull: false,
    },

    slot_id: {
      type: DataTypes.UUID,
      allowNull: false,
    },

    // human-friendly
    booking_code: {
      type: DataTypes.STRING(32),
      unique: true,
      allowNull: false,
    },

    // --- Customer details from your form ---
    selected_timezone: {
      type: DataTypes.STRING(100), // e.g., "Asia/Kolkata"
      allowNull: false,
    },
    name: {
      type: DataTypes.STRING(100),
      allowNull: false,
    },
    email: {
      type: DataTypes.STRING(150),
      allowNull: false,
      validate: { isEmail: true },
    },
    mobile: {
      type: DataTypes.STRING(15),
      allowNull: false,
    },
    country: {
      type: DataTypes.STRING(100),
      allowNull: true,
    },
    gender: {
      type: DataTypes.ENUM("MALE", "FEMALE", "OTHER"),
      allowNull: true,
    },
    dob: {
      type: DataTypes.DATEONLY,
      allowNull: true,
    },

    place_of_birth: {
      type: DataTypes.STRING(150),
      allowNull: true,
    },
    time_of_birth: {
      type: DataTypes.TIME,
      allowNull: true,
    },
    user_notes: {
      type: DataTypes.TEXT,
      allowNull: true,
    },

    // --- Payment info ---
    amount_in_paise: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    currency: {
      type: DataTypes.STRING(3),
      allowNull: false,
      defaultValue: "INR",
    },
    payment_provider: {
      type: DataTypes.STRING(50),
      allowNull: false,
      defaultValue: "razorpay",
    },
    payment_status: {
      type: DataTypes.ENUM("PENDING", "SUCCESS", "FAILED", "REFUNDED"),
      allowNull: false,
      defaultValue: "PENDING",
    },
    payment_reference: {
      type: DataTypes.STRING,
      allowNull: true, // e.g., Razorpay/Stripe transaction ID
    },

    // --- Booking status ---
    booking_status: {
      type: DataTypes.ENUM("PENDING", "CONFIRMED", "CANCELLED", "RESCHEDULED"),
      allowNull: false,
      defaultValue: "PENDING",
    },

    cancellation_reason: { type: DataTypes.TEXT, allowNull: true },

    meeting_link: {
      type: DataTypes.STRING,
      allowNull: true,
    },
  },
  {
    timestamps: true,
    tableName: "nri_slot_bookings",
  }
);

module.exports = NriSlotBooking;
