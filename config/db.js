const { Sequelize } = require("sequelize");
require("dotenv").config();

const sequelize = new Sequelize(
  process.env.DB_DATABASE,
  process.env.DB_USERNAME,
  process.env.DB_PASSWORD,
  {
    host: process.env.DB_HOST,
    port: process.env.DB_PORT || 3306,
    dialect: "mysql",
    logging: process.env.NODE_ENV === "development" ? console.log : false,
    pool: {
      max: 10,
      min: 0,
      acquire: 30000,
      idle: 10000,
    },
    timezone: "+05:30", // set according to your region
    dialectOptions: {
      dateStrings: true,
      typeCast: true,
    },
  }
);

const connectToDB = async () => {
  try {
    await sequelize.authenticate();
    console.log("✅ DB connection established.");
  } catch (error) {
    console.error("❌ DB connection failed:", error);
    process.exit(1); // stop the app if DB is unreachable
  }
};

// Optional: sync tables in dev
const syncDB = async () => {
  try {
    await sequelize.sync({ alter: true });
    console.log("✅ DB synced.");
  } catch (error) {
    console.error("❌ DB sync failed:", error);
  }
};

module.exports = { sequelize, connectToDB, syncDB };
