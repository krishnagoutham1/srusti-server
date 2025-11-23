const Razorpay = require("razorpay");
const crypto = require("crypto");

const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET,
});

// 💰 Controller: createOrder
// Creates a new payment order using the Razorpay API for the given amount and optional notes (e.g., bookingId, slotId).
// Converts the amount from rupees to paise and returns the Razorpay order object for frontend checkout initiation.
// No database operations are performed at this stage.
const createOrder = async (req, res) => {
  try {
    const { amount, notes } = req.body;
    if (!amount) return res.status(400).json({ error: "Amount is required" });

    const options = {
      amount: amount * 100, // rupees → paise
      currency: "INR",
      receipt: `receipt_order_${Date.now()}`,
      notes: notes || {}, // pass bookingId, slotId, appointmentId
    };

    const order = await razorpay.orders.create(options);
    res.json(order);
  } catch (err) {
    console.error("Create order error:", err);
    res.status(500).json({ error: "Something went wrong" });
  }
};

// 🔒 Controller: verifyPayment
// Validates the payment signature received from Razorpay to ensure payment authenticity.
// Uses HMAC SHA256 hashing to compare the generated signature with the Razorpay-provided one.
// This only verifies payment integrity — no database updates or status changes are made here.
const verifyPayment = (req, res) => {
  try {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature } =
      req.body;

    if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
      return res
        .status(400)
        .json({ success: false, message: "Invalid payment details" });
    }

    const hmac = crypto.createHmac("sha256", process.env.RAZORPAY_KEY_SECRET);
    hmac.update(razorpay_order_id + "|" + razorpay_payment_id);
    const generated_signature = hmac.digest("hex");

    if (generated_signature === razorpay_signature) {
      return res.json({
        success: true,
        message: "Payment verified successfully",
      });
    } else {
      return res
        .status(400)
        .json({ success: false, message: "Payment verification failed" });
    }
  } catch (err) {
    console.error("Verify payment error:", err);
    res.status(500).json({ success: false, error: err.message });
  }
};

module.exports = { createOrder, verifyPayment };
