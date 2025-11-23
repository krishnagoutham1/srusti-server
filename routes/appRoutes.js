// routes/appRoutes.js

const router = require("express").Router();

const nriAppointmentRoutes = require("./nriAppointmentRoutes");
const userRoutes = require("./userRoutes");
const paymentRoutes = require("./paymentRoutes");
const authRoutes = require("./authRoutes");

router.use("/nriAppointment", nriAppointmentRoutes);
router.use("/user", userRoutes);
router.use("/payment", paymentRoutes);
router.use("/auth", authRoutes);

module.exports = router;
