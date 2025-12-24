const {
  NriAppointment,
  NriAppointmentSlots,
  NriSlotBooking,
  Payment,
} = require("../models");
const { Op } = require("sequelize");

const { sequelize } = require("../config/db");
const { generateBookingCode } = require("../utils.js/utils");
const { sendBookingConfirmationEmail } = require("../utils.js/sendEmail");
const { createGoogleMeetEvent } = require("../config/createMeet");

// 📅 Controller: createNriAppointmentController
// Creates a new NRI appointment configuration for a specific date.
// It inserts one record into `NriAppointment` and multiple related slot records into `NriAppointmentSlots`.
// Ensures no duplicate date, validates slots count, and handles transactional consistency (rollback on failure).
const createNriAppointmentController = async (req, res) => {
  const t = await sequelize.transaction();
  try {
    const {
      appointment_date,
      total_appointments,
      price,
      duration,
      slots,
      notes,
    } = req.body;

    // ---- Basic validations ----
    if (!appointment_date) {
      return res.status(400).json({ message: "appointment_date is required." });
    }

    if (slots.length !== total_appointments) {
      return res.status(400).json({
        message: "Slot count mismatch.",
        details: `Provided ${slots.length} slots, but total_appointments is ${total_appointments}.`,
      });
    }

    // ---- Past date check ----
    const apptDate = new Date(appointment_date);
    if (isNaN(apptDate.getTime())) {
      return res
        .status(400)
        .json({ message: "Invalid date format (use YYYY-MM-DD)." });
    }
    const startOfToday = new Date();
    startOfToday.setHours(0, 0, 0, 0);
    if (apptDate < startOfToday) {
      return res.status(400).json({
        message: "Invalid appointment_date.",
        details: "appointment_date cannot be in the past.",
      });
    }

    // ---- Check duplicate appointment date ----
    const existing = await NriAppointment.findOne({
      where: { appointment_date: apptDate },
    });
    if (existing) {
      return res.status(409).json({
        message: "Appointment already exists for this date.",
        details: `An appointment on ${appointment_date} is already created.`,
      });
    }

    const convertedPrice = Number(price) * 100;

    // ---- Create appointment ----
    const appointment = await NriAppointment.create(
      {
        appointment_date: apptDate,
        duration,
        total_appointments,
        appointment_price_in_paise: convertedPrice,
        notes: notes || null,
      },
      { transaction: t }
    );

    const slotsToCreate = slots.map((slot) => ({
      appointment_id: appointment.appointment_id,
      ref_date: appointment.appointment_date,
      start_time: slot.start_time,
      end_time: slot.end_time,
      price_in_paise: convertedPrice,
    }));

    await NriAppointmentSlots.bulkCreate(slotsToCreate, { transaction: t });

    await t.commit();

    // 🔁 Reload using the EXACT same include + order + (findAll) shape
    const createdList = await NriAppointment.findAll({
      where: { appointment_date: appointment.appointment_date },
      include: [
        {
          model: NriAppointmentSlots,
          as: "slots",
          attributes: [
            "slot_id",
            "ref_date",
            "start_time",
            "end_time",
            "status",
            "price_in_paise",
            "consultation",
          ],
        },
      ],
      order: [
        ["appointment_date", "ASC"],
        [{ model: NriAppointmentSlots, as: "slots" }, "start_time", "ASC"],
      ],
    });
    return res.status(201).json({
      success: true,
      count: createdList.length,
      data: createdList.map((a) => a.toJSON()),
      message: "Appointment and slots created successfully.",
    });
  } catch (err) {
    await t.rollback();

    console.error(err);
    return res.status(500).json({
      message: "Failed to create appointment and slots.",
      error: err.message,
    });
  }
};

// 📋 Controller: getAllNriAppointments
// Fetches all NRI appointments along with their slot details from `NriAppointment` and `NriAppointmentSlots`.
// Supports optional filters — by status, published flag, or specific date.
// Used primarily for admin dashboards to view and manage appointment schedules.
const getAllNriAppointments = async (req, res) => {
  const { status, published, date } = req.query;

  try {
    if (status && published) {
      const appointments = await NriAppointment.findAll({
        where: {
          status: status,
          is_published: published === "true" ? true : false,
        },
        include: [
          {
            model: NriAppointmentSlots,
            as: "slots",
            attributes: [
              "slot_id",
              "ref_date",
              "start_time",
              "end_time",
              "status",
              "price_in_paise",
              "consultation",
            ],
          },
        ],
        order: [
          ["appointment_date", "ASC"],
          [{ model: NriAppointmentSlots, as: "slots" }, "start_time", "ASC"],
        ],
      });

      return res.status(200).json({
        success: true,
        count: appointments.length,
        data: appointments.map((a) => a.toJSON()),
        message: "search by filters status",
      });
    }

    if (date) {
      const appointment = await NriAppointment.findAll({
        where: { appointment_date: date },
        include: [
          {
            model: NriAppointmentSlots,
            as: "slots",
            attributes: [
              "slot_id",
              "ref_date",
              "start_time",
              "end_time",
              "status",
              "price_in_paise",
              "consultation",
            ],
          },
        ],
        order: [
          ["appointment_date", "ASC"],
          [{ model: NriAppointmentSlots, as: "slots" }, "start_time", "ASC"],
        ],
      });

      return res.status(200).json({
        success: true,
        count: appointment.length,
        data: appointment.map((a) => a.toJSON()),
        message: "search by date",
      });
    }

    const allAppointments = await NriAppointment.findAll({
      include: [
        {
          model: NriAppointmentSlots,
          as: "slots",
          attributes: [
            "slot_id",
            "ref_date",
            "start_time",
            "end_time",
            "status",
            "price_in_paise",
            "consultation",
          ],
        },
      ],
      order: [
        ["appointment_date", "ASC"],
        [{ model: NriAppointmentSlots, as: "slots" }, "start_time", "ASC"],
      ],
    });

    const result = allAppointments.map((app) => app.toJSON());

    return res.status(200).json({
      success: true,
      count: result.length,
      data: result,
      message: "all appointments",
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({
      success: false,
      message: "Failed to fetch appointments.",
      error: err.message,
    });
  }
};

// 📋 Controller: getNriAppointmentById
// Fetch a single NRI appointment by appointment_id along with its slots.
// Used for viewing appointment details in viewer / admin screens.
const getNriAppointmentById = async (req, res) => {
  const { id } = req.params;

  try {
    if (!id) {
      return res.status(400).json({
        success: false,
        message: "Appointment ID is required",
      });
    }

    const appointment = await NriAppointment.findOne({
      where: {
        appointment_id: id,
      },
      include: [
        {
          model: NriAppointmentSlots,
          as: "slots",
          attributes: [
            "slot_id",
            "ref_date",
            "start_time",
            "end_time",
            "status",
            "price_in_paise",
            "consultation",
          ],
        },
      ],
      order: [
        ["appointment_date", "ASC"],
        [{ model: NriAppointmentSlots, as: "slots" }, "start_time", "ASC"],
      ],
    });

    if (!appointment) {
      return res.status(404).json({
        success: false,
        message: "Appointment not found",
      });
    }

    return res.status(200).json({
      success: true,
      data: appointment.toJSON(),
      message: "Appointment fetched successfully",
    });
  } catch (err) {
    console.error("Error fetching appointment by ID:", err);
    return res.status(500).json({
      success: false,
      message: "Failed to fetch appointment",
      error: err.message,
    });
  }
};

// ✏️ Controller: editNriAppointmentSlots
// Updates an existing NRI appointment (only if it's active).
// Modifies the appointment record in `NriAppointment`, deletes old related slots,
// and recreates them in `NriAppointmentSlots` with the updated details — all inside a transaction.
const editNriAppointmentSlots = async (req, res) => {
  const t = await sequelize.transaction();
  try {
    const { appointment_id, slots, total_appointments, price, notes } =
      req.body;

    if (!appointment_id || !slots || !total_appointments || !price) {
      return res.status(400).json({
        success: false,
        data: null,
        message: "Missing fields",
      });
    }

    if (slots.length !== total_appointments) {
      return res.status(400).json({
        success: false,
        data: null,
        message: "Slot count mismatch.",
        details: `Provided ${slots.length} slots, but total_appointments is ${total_appointments}.`,
      });
    }

    // Fetch the appointment (optionally, to validate)
    const appointment = await NriAppointment.findByPk(appointment_id, {
      transaction: t,
    });
    if (!appointment) {
      return res.status(404).json({
        success: false,
        data: null,
        message: "Appointment not found",
      });
    }

    const convertedPrice = Number(price) * 100;

    appointment.total_appointments = total_appointments;

    appointment.notes = notes;

    appointment.appointment_price_in_paise = convertedPrice;

    await appointment.save({
      fields: ["total_appointments", "notes", "appointment_price_in_paise"],
      transaction: t,
    });

    // Delete all slots for this appointment
    await NriAppointmentSlots.destroy({
      where: { appointment_id },
      transaction: t,
    });

    // Prepare new slots
    const slotsToCreate = slots.map((slot) => ({
      appointment_id: appointment.appointment_id,
      ref_date: appointment.appointment_date,
      start_time: slot.start_time,
      end_time: slot.end_time,
      price_in_paise: convertedPrice,
    }));

    // Bulk create new slots
    await NriAppointmentSlots.bulkCreate(slotsToCreate, { transaction: t });

    await t.commit();

    // 🔁 Reload using the SAME include + order as your GET/CREATE responses
    const updatedList = await NriAppointment.findAll({
      where: { appointment_id: appointment.appointment_id },
      include: [
        {
          model: NriAppointmentSlots,
          as: "slots",
          attributes: [
            "slot_id",
            "ref_date",
            "start_time",
            "end_time",
            "status",
            "price_in_paise",
            "consultation",
          ],
        },
      ],
      order: [
        ["appointment_date", "ASC"],
        [{ model: NriAppointmentSlots, as: "slots" }, "start_time", "ASC"],
      ],
    });

    return res.status(200).json({
      success: true,
      count: updatedList.length,
      data: updatedList.map((a) => a.toJSON()),
      message: "Appointment updated successfully!",
    });
  } catch (err) {
    console.error(err);
    // If the transaction exists and is still active, try rolling back
    try {
      if (t) await t.rollback();
    } catch (_) {}

    return res.status(500).json({
      success: false,
      count: 0,
      data: null,
      message: "Failed to update slots.",
      error: err.message,
    });
  }
};

// 🚀 Controller: publishAppointment
// Marks an appointment as published in `NriAppointment` so users can view and book its slots.
// Only unpublished appointments are eligible; prevents duplicate publishing and ensures data consistency.
const publishAppointment = async (req, res) => {
  try {
    const { appointment_id } = req.body;

    if (!appointment_id) {
      return res.status(400).json({ message: "appointment id is required" });
    }

    const appointment = await NriAppointment.findByPk(appointment_id);

    if (!appointment) {
      return res
        .status(404)
        .json({ message: "no appointment found for this id" });
    }

    if (appointment.is_published) {
      return res
        .status(400)
        .json({ message: "appointment already published for this id" });
    }

    appointment.is_published = true;
    await appointment.save({ fields: ["is_published"] });

    return res.status(200).json({
      success: true,
      message: "Appointment published successfully",
      data: appointment,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({
      success: false,
      message: "Failed to Publish appointment.",
      error: err.message,
    });
  }
};

// 🗑️ Controller: deleteAppointment
// Deletes an appointment record from `NriAppointment` only if it is ACTIVE and not published.
// Prevents deletion of already published or inactive (expired) appointments to maintain booking data integrity.
const deleteAppointment = async (req, res) => {
  try {
    const { appointment_id } = req.params;

    if (!appointment_id) {
      return res.status(400).json({ message: "appointment id is required" });
    }

    const appointment = await NriAppointment.findByPk(appointment_id);

    if (!appointment) {
      return res
        .status(404)
        .json({ message: "no appointment found for this id" });
    }

    if (appointment.is_published || appointment.status === "INACTIVE") {
      return res.status(400).json({
        message: "appointment already published / expired for this id",
      });
    }

    await appointment.destroy();

    return res.status(200).json({
      success: true,
      message: "Appointment deleted successfully",
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({
      message: "Failed to delete appointment.",
      error: err.message,
    });
  }
};

// 📆 Controller: getPublishedAppointmentsByMonth
// Fetches all published and active appointments within a given month from `NriAppointment`.
// Includes their related `NriAppointmentSlots` — used to show users available slots in a selected month’s calendar view.
const getPublishedAppointmentsByMonth = async (req, res) => {
  try {
    let { year, month } = req.query;

    if (!year || !month) {
      return res.status(400).json({
        success: false,
        data: null,
        message: "Year and month are required.",
      });
    }

    // Ensure month is two digits
    month = month.toString().padStart(2, "0");

    // Start of the current month
    const startDate = `${year}-${month}-01`;

    // Calculate start of next month
    let nextMonthInt = parseInt(month, 10) + 1;
    let nextYear = parseInt(year, 10);
    if (nextMonthInt > 12) {
      nextMonthInt = 1;
      nextYear += 1;
    }
    const nextMonthStr = nextMonthInt.toString().padStart(2, "0");
    const endDate = `${nextYear}-${nextMonthStr}-01`;

    const appointments = await NriAppointment.findAll({
      where: {
        appointment_date: {
          [Op.gte]: startDate,
          [Op.lt]: endDate,
        },
        is_published: true,
        status: "ACTIVE", // kept as-is per your logic
      },
      include: [
        {
          model: NriAppointmentSlots,
          as: "slots",
          attributes: [
            "slot_id",
            "ref_date",
            "start_time",
            "end_time",
            "status",
            "price_in_paise",
            "currency",
          ],
        },
      ],
      order: [
        ["appointment_date", "ASC"],
        [{ model: NriAppointmentSlots, as: "slots" }, "start_time", "ASC"],
      ],
    });

    return res.status(200).json({
      success: true,
      count: appointments.length,
      data: appointments.map((a) => a.toJSON()),
      message: `published appointments for ${year}-${month}`,
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({
      success: false,
      data: null,
      message: "Failed to fetch appointments for the month.",
      error: err.message,
    });
  }
};

// 🎯 Controller: getSlotsByAppointmentId
// Retrieves all slots for a specific appointment from `NriAppointmentSlots`.
// Optionally filters slots by status (AVAILABLE, HOLD, BOOKED, etc.).
// Useful for showing time slots under a selected appointment date.
const getSlotsByAppointmentId = async (req, res) => {
  try {
    const { appointment_id } = req.params;
    const { status } = req.query; // ✅ take status from query params

    // Check if the appointment exists
    const appointment = await NriAppointment.findByPk(appointment_id);

    if (!appointment) {
      return res.status(404).json({ message: "Appointment not found." });
    }

    // Build where condition
    const whereCondition = { appointment_id };
    if (status) {
      whereCondition.status = status; // ✅ add status if provided
    }

    const slots = await NriAppointmentSlots.findAll({
      where: whereCondition,
      order: [["start_time", "ASC"]],
    });

    res.status(200).json({
      success: true,
      data: slots,
      message: "Slots for selected appointment",
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({
      message: "Failed to fetch slots.",
      error: err.message,
    });
  }
};

// 🔍 Controller: getSlotById
// Fetches detailed information for a specific slot by its ID from `NriAppointmentSlots`.
// Returns slot details like timings, status, and consultation info — used for detailed slot inspection or booking view.
const getSlotById = async (req, res) => {
  try {
    const { slotId } = req.params;
    const slotInfo = await NriAppointmentSlots.findByPk(slotId);

    if (!slotInfo) {
      return res.status(404).json({
        message: "solt details not found",
      });
    }

    return res.status(200).json({
      message: "Detailed Slot information",
      data: slotInfo,
      succes: true,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({
      message: "Failed to fetch slots.",
      error: err.message,
    });
  }
};

// 🔍 Controller: getAdminSlotById
// Fetches detailed admin-level slot information including booking & payment data
const getAdminSlotById = async (req, res) => {
  try {
    const { slotId } = req.params;

    if (!slotId) {
      return res.status(400).json({
        success: false,
        message: "Slot ID is required",
      });
    }

    const slotInfo = await NriAppointmentSlots.findOne({
      where: { slot_id: slotId },
      include: [
        {
          model: NriSlotBooking,
          as: "bookings",
          required: false, // slot may not be booked
          include: [
            {
              model: Payment,
              as: "payment",
              required: false,
            },
          ],
        },
      ],
    });

    if (!slotInfo) {
      return res.status(404).json({
        success: false,
        message: "Slot details not found",
      });
    }

    // Convert Sequelize instance → plain JSON
    const slot = slotInfo.toJSON();

    return res.status(200).json({
      success: true,
      message: "Detailed Slot information (Admin)",
      data: {
        // -------- Slot --------
        slot_id: slot.slot_id,
        appointment_id: slot.appointment_id,
        ref_date: slot.ref_date,
        start_time: slot.start_time,
        end_time: slot.end_time,
        status: slot.status,
        hold_until: slot.hold_until,
        consultation: slot.consultation,
        price_in_paise: slot.price_in_paise,
        currency: slot.currency,
        createdAt: slot.createdAt,
        updatedAt: slot.updatedAt,

        // -------- Booking (if exists) --------
        booking: slot.bookings?.length
          ? {
              booking_id: slot.bookings[0].booking_id,
              booking_code: slot.bookings[0].booking_code,
              booking_status: slot.bookings[0].booking_status,
              payment_status: slot.bookings[0].payment_status,

              // Customer
              customer: {
                name: slot.bookings[0].name,
                email: slot.bookings[0].email,
                mobile: slot.bookings[0].mobile,
                country: slot.bookings[0].country,
                gender: slot.bookings[0].gender,
                dob: slot.bookings[0].dob,
                timezone: slot.bookings[0].selected_timezone,
              },

              // Appointment-specific
              user_notes: slot.bookings[0].user_notes,
              meeting_link: slot.bookings[0].meeting_link,

              // Payment (if exists)
              payment: slot.bookings[0].payment
                ? {
                    amount_in_paise: slot.bookings[0].payment.amount_in_paise,
                    currency: slot.bookings[0].payment.currency,
                    status: slot.bookings[0].payment.status,
                    razorpay_payment_id:
                      slot.bookings[0].payment.razorpay_payment_id,
                  }
                : null,
            }
          : null,
      },
    });
  } catch (err) {
    console.error("Admin slot fetch error:", err);
    return res.status(500).json({
      success: false,
      message: "Failed to fetch slot details",
      error: err.message,
    });
  }
};

// 🕒 Controller: appointmentBooking
// Handles initial slot booking — verifies appointment and slot availability, then places a temporary hold (15 min) on the slot in `NriAppointmentSlots`.
// Creates a new booking record in `NriSlotBooking` with customer details and amount info.
// Prevents double booking by marking the slot status as HOLD until payment confirmation.
const appointmentBooking = async (req, res) => {
  try {
    const {
      appointment_id,
      slot_id,
      selected_timezone,
      name,
      email,
      mobile,
      country,
      gender,
      dob,
      place_of_birth,
      time_of_birth,
      user_notes,
    } = req.body;

    // ---- Required field validations ----
    if (
      !appointment_id ||
      !slot_id ||
      !selected_timezone ||
      !name ||
      !email ||
      !mobile ||
      !country ||
      !gender ||
      !dob ||
      !place_of_birth ||
      !time_of_birth
    ) {
      return res.status(400).json({ message: "Missing required fields." });
    }

    // ---- Check appointment exists ----
    const appointment = await NriAppointment.findByPk(appointment_id);
    if (!appointment) {
      return res.status(404).json({ message: "Appointment not found." });
    }

    // ---- Check slot exists and belongs to the appointment ----
    const appointment_slot = await NriAppointmentSlots.findOne({
      where: { slot_id, appointment_id },
    });

    if (!appointment_slot) {
      return res.status(404).json({ message: "Selected slot not found." });
    }

    // ---- Check if slot is already booked ----
    if (
      appointment_slot.status === "BOOKED" ||
      appointment_slot.status === "HOLD"
    ) {
      return res
        .status(409)
        .json({ message: "Slot already booked or on hold." });
    }

    // ---- Update slot to HOLD (15 min hold) ----
    const holdUntil = new Date(Date.now() + 15 * 60 * 1000); // 15 minutes
    await appointment_slot.update({
      status: "HOLD",
      hold_until: holdUntil,
    });

    // ---- Save booking in separate table ----
    const slotBooking = await NriSlotBooking.create({
      appointment_id,
      slot_id,
      selected_timezone,
      name,
      email,
      mobile,
      country,
      gender,
      dob,
      place_of_birth,
      time_of_birth,
      user_notes: user_notes || null,
      amount_in_paise: appointment_slot.price_in_paise,
      booking_code: generateBookingCode(),
    });

    return res.status(201).json({
      success: true,
      message: "Slot booked successfully.",
      data: {
        slot: appointment_slot,
        booking: slotBooking,
      },
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({
      success: false,
      message: "Failed to book slot.",
      error: err.message,
    });
  }
};

// ✅ Controller: confirmBookingController
// Confirms a held booking after successful payment.
// Updates slot status in `NriAppointmentSlots` to BOOKED, booking status in `NriSlotBooking` to CONFIRMED,
// and creates a new payment entry in `Payment`. Also triggers a confirmation email to the customer.
// Uses database transactions to ensure all related updates occur atomically.
const confirmBookingController = async (req, res) => {
  const t = await sequelize.transaction();

  try {
    const {
      bookingId,
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature,
    } = req.body;

    if (!bookingId) {
      return res
        .status(400)
        .json({ success: false, message: "Booking ID is required" });
    }

    // Find booking
    const booking = await NriSlotBooking.findByPk(bookingId, {
      transaction: t,
    });
    if (!booking)
      return res
        .status(404)
        .json({ success: false, message: "Booking not found" });

    // Update slot as BOOKED
    const slot = await NriAppointmentSlots.findByPk(booking.slot_id, {
      transaction: t,
    });
    if (!slot)
      return res
        .status(404)
        .json({ success: false, message: "Slot not found" });

    await slot.update({ status: "BOOKED" }, { transaction: t });

    const startDateTime = new Date(
      `${slot.ref_date}T${slot.start_time}:00+05:30`
    );
    const endDateTime = new Date(`${slot.ref_date}T${slot.end_time}:00+05:30`);

    const meeting_link = await createGoogleMeetEvent({
      summary: `Consultation with ${booking.name}`,
      description: `Appointment scheduled via Sree Srusti on ${slot.ref_date} at ${slot.start_time}`,
      startTime: startDateTime.toISOString(), // ✅ ISO string
      endTime: endDateTime.toISOString(), // ✅ ISO string
      attendees: [booking.email, process.env.ADMIN_EMAIL],
    });

    // Update booking
    await booking.update(
      {
        payment_status: "SUCCESS",
        booking_status: "CONFIRMED",
        payment_reference: razorpay_payment_id,
        meeting_link: meeting_link, // dynamic function which generates and returns a meeting link
      },
      { transaction: t }
    );

    // Create payment record
    await Payment.create(
      {
        booking_id: booking.booking_id,
        razorpay_order_id,
        razorpay_payment_id,
        razorpay_signature,
        amount_in_paise: booking.amount_in_paise,
        currency: "INR",
        status: "paid",
        payload: req.body,
      },
      { transaction: t }
    );

    // Send booking confirmation email
    await sendBookingConfirmationEmail({
      name: booking.name || "Customer", // Assuming booking table stores customer name
      email: booking.email,
      date: slot.ref_date, // from slot table
      time: `${slot.start_time} - ${slot.end_time}`, // adjust field names as per your schema
      amount: (booking.amount_in_paise / 100).toFixed(2), // convert paise to INR
      phone: booking.mobile || "N/A", // Assuming booking has phone
      bookingId: booking.booking_code,
      transactionId: razorpay_payment_id, // use actual payment ID
      meeting_link: meeting_link || "N/A",
    });

    await t.commit();
    return res.json({
      success: true,
      message: "Booking confirmed successfully",
    });
  } catch (err) {
    await t.rollback();
    console.error("Confirm booking error:", err);
    return res.status(500).json({
      success: false,
      message: "Something went wrong",
      error: err.message,
    });
  }
};

// ✅ Controller: markConsultationCompleted
// Marks a booked slot’s consultation as COMPLETED in `NriAppointmentSlots`.
// Used by admin after the consultation session is finished.
// Ensures the slot exists and avoids duplicate updates by handling already-completed consultations safely.
// Does not affect slot booking or payment status.
const markConsultationCompleted = async (req, res) => {
  try {
    const { slotId } = req.params;
    console.log(slotId, "slotId");
    const slot = await NriAppointmentSlots.findByPk(slotId);

    if (!slot) {
      return res.status(404).json({
        success: false,
        message: "Slot not found",
      });
    }

    // Already completed → idempotent response
    if (slot.consultation === "COMPLETED") {
      return res.status(200).json({
        success: true,
        message: "Consultation already marked as completed",
        data: slot,
      });
    }

    // Update consultation status
    await slot.update({
      consultation: "COMPLETED",
    });

    return res.status(200).json({
      success: true,
      message: "Consultation marked as completed successfully",
      data: slot,
    });
  } catch (error) {
    console.error("Mark consultation completed error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to mark consultation as completed",
      error: error.message,
    });
  }
};

const markExpiredAppointments = async (req, res) => {
  try {
    const today = new Date();
    const dateOnly = today.toISOString().split("T")[0]; // YYYY-MM-DD

    const [updatedCount] = await NriAppointment.update(
      { status: "INACTIVE" },
      {
        where: {
          status: "ACTIVE",
          appointment_date: { [Op.lt]: dateOnly },
        },
      }
    );

    return res.status(200).json({
      success: true,
      message: `${updatedCount} appointments marked as INACTIVE`,
    });
  } catch (error) {
    console.error("Error updating statuses", error);
    return res.status(500).json({
      success: false,
      message: "Failed to update appointment statuses",
    });
  }
};

module.exports = {
  createNriAppointmentController,
  getAllNriAppointments,
  getNriAppointmentById,
  editNriAppointmentSlots,
  getSlotsByAppointmentId,
  getPublishedAppointmentsByMonth,
  getSlotById,
  getAdminSlotById,
  publishAppointment,
  deleteAppointment,
  appointmentBooking,
  confirmBookingController,
  markConsultationCompleted,
  markExpiredAppointments,
};

// const getAppointmentsByMonth = async (req, res) => {
//   try {
//     let { year, month } = req.query;
//     if (!year || !month) {
//       return res.status(400).json({ message: "Year and month are required." });
//     }
//     // Ensure month is two digits
//     month = month.toString().padStart(2, "0");

//     // Start of the current month
//     const startDate = `${year}-${month}-01`;

//     // Calculate start of next month
//     let nextMonthInt = parseInt(month, 10) + 1;
//     let nextYear = parseInt(year, 10);
//     if (nextMonthInt > 12) {
//       nextMonthInt = 1;
//       nextYear += 1;
//     }
//     const nextMonthStr = nextMonthInt.toString().padStart(2, "0");
//     const endDate = `${nextYear}-${nextMonthStr}-01`;

//     const appointments = await NriAppointment.findAll({
//       where: {
//         appointment_date: {
//           [Op.gte]: startDate,
//           [Op.lt]: endDate,
//         },
//       },
//       attributes: [
//         "appointment_id",
//         "appointment_date",
//         "duration",
//         "total_appointments",
//       ],
//       order: [["appointment_date", "ASC"]],
//     });

//     res.status(200).json(appointments);
//   } catch (err) {
//     console.error(err);
//     res.status(500).json({
//       message: "Failed to fetch appointments for the month.",
//       error: err.message,
//     });
//   }
// };
