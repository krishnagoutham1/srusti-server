// models/Payment.js
const { DataTypes } = require("sequelize");
const { sequelize } = require("../config/db");

const Payment = sequelize.define(
  "Payment",
  {
    payment_id: {
      type: DataTypes.UUID,
      primaryKey: true,
      defaultValue: DataTypes.UUIDV4,
    },
    booking_id: {
      type: DataTypes.UUID,
      allowNull: false,
    },

    // Razorpay identifiers
    razorpay_order_id: {
      type: DataTypes.STRING(191),
      allowNull: false,
    },
    razorpay_payment_id: {
      type: DataTypes.STRING(191),
      allowNull: true, // populated after success
    },
    razorpay_signature: {
      type: DataTypes.STRING(255),
      allowNull: true, // used for verification
    },

    // Amount info
    amount_in_paise: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    currency: {
      type: DataTypes.STRING(3),
      allowNull: false,
      defaultValue: "INR",
    },

    // Status flow
    status: {
      type: DataTypes.ENUM("created", "paid", "failed", "refunded"),
      allowNull: false,
      defaultValue: "created",
    },

    // Meta
    failure_reason: { type: DataTypes.STRING(255), allowNull: true },
    receipt_url: { type: DataTypes.STRING(255), allowNull: true },
    payload: { type: DataTypes.JSON, allowNull: true }, // store webhook data
  },
  {
    tableName: "payments",
    timestamps: true,
  }
);

module.exports = Payment;
