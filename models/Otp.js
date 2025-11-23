// models/Otp.js
const { DataTypes } = require("sequelize");
const { sequelize } = require("../config/db");

const Otp = sequelize.define(
  "Otp",
  {
    id: {
      type: DataTypes.UUID,
      primaryKey: true,
      defaultValue: DataTypes.UUIDV4,
    },
    unique_key: {
      type: DataTypes.STRING(255),
      allowNull: false,
      unique: true,
    },
    otp: {
      type: DataTypes.STRING(10),
      allowNull: false,
    },
    otpExpiry: {
      type: DataTypes.DATE,
      allowNull: false,
    },
    reference: {
      type: DataTypes.STRING(255),
      allowNull: true,
    },
    used: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
    },
  },
  {
    tableName: "otp",
    timestamps: true,
  }
);

module.exports = Otp;
