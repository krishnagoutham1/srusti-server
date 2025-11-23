const {
  NriSlotBooking,
  NriAppointmentSlots,
  NriAppointment,
} = require("../models");
const { Op } = require("sequelize");

const refreshSlots = async (req, res) => {
  const t = await NriAppointmentSlots.sequelize.transaction();

  try {
    // Current time
    const now = new Date();

    // Find slots where hold expired
    const expiredSlots = await NriAppointmentSlots.findAll({
      where: {
        status: "HOLD",
        hold_until: { [Op.lt]: now },
      },
      transaction: t,
    });

    if (!expiredSlots.length) {
      await t.commit();
      return res.json({
        success: true,
        message: "No expired slots found",
      });
    }

    // Update them back to AVAILABLE
    await Promise.all(
      expiredSlots.map((slot) =>
        slot.update(
          {
            status: "AVAILABLE",
            hold_until: null,
          },
          { transaction: t }
        )
      )
    );

    await t.commit();
    return res.json({
      success: true,
      message: `${expiredSlots.length} slot(s) refreshed to AVAILABLE`,
    });
  } catch (error) {
    await t.rollback();
    console.error("Error in refreshSlots:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to refresh slots",
      error: error.message,
    });
  }
};

// 📌 Get all bookings (with optional filters/pagination)
const getAllBookings = async (req, res) => {
  try {
    // Query params (for pagination or filters)
    const { page = 1, limit = 20, status } = req.query;

    const where = {};
    if (status) {
      where.booking_status = status; // filter by booking_status
    }

    const offset = (page - 1) * limit;

    const bookings = await NriSlotBooking.findAndCountAll({
      where,
      include: [
        {
          model: NriAppointmentSlots,
          as: "slot", // ✅ make sure association is defined
          attributes: [
            "slot_id",
            "ref_date",
            "start_time",
            "end_time",
            "status",
          ],
        },
        {
          model: NriAppointment,
          as: "appointment", // ✅ if association exists
          attributes: ["appointment_id"],
        },
      ],
      order: [["createdAt", "DESC"]],
      limit: parseInt(limit),
      offset: parseInt(offset),
    });

    return res.json({
      success: true,
      total: bookings.count,
      page: parseInt(page),
      limit: parseInt(limit),
      data: bookings.rows,
    });
  } catch (error) {
    console.error("Error fetching bookings:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to fetch bookings",
      error: error.message,
    });
  }
};

module.exports = { refreshSlots, getAllBookings };
