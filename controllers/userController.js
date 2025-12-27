const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

const { Otp, Users } = require("../models");
const {
  sendUserCreationEmail,
  sendOtpEmail,
  sendAccountApprovedEmail,
} = require("../utils.js/sendEmail");
const {
  generateOTP,
  generateRandomAlphaNumericString,
} = require("../utils.js/utils");

// 👤 Controller: createUser
// Handles new user registration — validates input, checks for duplicate emails, hashes the password,
// and creates a new record in the `Users` table. Generates a one-time verification token and sends
// a verification email to the user for account approval.
const createUser = async (req, res) => {
  try {
    const { name, email, mobile, password, createdBy } = req.body;

    // Basic validation
    if (!name || !email || !mobile || !password) {
      return res.status(400).json({ message: "All fields are required" });
    }

    // Check if email already exists
    const existingUser = await Users.findOne({
      where: {
        email,
      },
    });

    if (existingUser) {
      return res.status(409).json({ message: "Email already registered" });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create user
    const user = await Users.create({
      name,
      email,
      mobile,
      password: hashedPassword,
      createdBy: createdBy || null,
    });

    const token = jwt.sign(
      { user_id: user.user_id, email: user.email },
      process.env.JWT_USER_CREATION_SECRET,
      { expiresIn: "1h" }
    );

    const verifyUrl = `${process.env.CLIENT_URL}/verify-user?token=${token}`;

    sendUserCreationEmail({ name, email, mobile, verifyUrl });

    return res.status(201).json({
      message: "User created successfully. Awaiting admin approval.",
      success: true,
    });
  } catch (err) {
    console.error("❌ Error creating user:", err);
    return res.status(500).json({ message: "Internal server error" });
  }
};

// ✅ Controller: verifyUser
// Verifies a user's email using a JWT token sent in the verification link.
// Decodes the token, validates the user from the `Users` table, and marks them as verified.
// Sends an account approval email upon successful verification and prevents re-verification attempts.
const verifyUser = async (req, res) => {
  try {
    const { token } = req.query;

    if (!token) {
      return res.status(400).json({ message: "Verification token missing" });
    }

    // 🔐 Verify token
    const decoded = jwt.verify(token, process.env.JWT_USER_CREATION_SECRET);

    // 🧍 Find the user
    const user = await Users.findOne({ where: { user_id: decoded.user_id } });
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // ⚠️ Already verified
    if (user.verified) {
      return res.status(400).json({ message: "User already verified" });
    }

    // ✅ Mark as verified (approved by admin)
    user.verified = true;
    await user.save();

    // ✉️ Send account approval email
    await sendAccountApprovedEmail({
      name: user.name,
      email: user.email,
    });

    console.log(`✅ User ${user.email} approved and email sent`);

    return res.json({
      message: "User approved successfully and notified via email",
      success: true,
    });
  } catch (err) {
    console.error("❌ Verification error:", err);

    if (err.name === "TokenExpiredError") {
      return res
        .status(400)
        .json({ message: "Verification link expired", expired: true });
    }

    if (err.name === "JsonWebTokenError") {
      return res.status(400).json({ message: "Invalid verification link" });
    }

    return res.status(500).json({ message: "Server error" });
  }
};

// 🔁 Controller: resendVerificationLink
// Re-generates and sends a new email verification link for unverified users in the `Users` table.
// Creates a fresh JWT token with a 1-hour expiry and sends it via email to allow re-verification.
const resendVerificationLink = async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) return res.status(400).json({ message: "Email is required" });

    const user = await Users.findOne({ where: { email } });
    if (!user) return res.status(404).json({ message: "User not found" });

    if (user.verified)
      return res.status(400).json({ message: "User already verified" });

    // Generate new token
    const token = jwt.sign(
      { user_id: user.user_id, email: user.email },
      process.env.JWT_USER_CREATION_SECRET,
      { expiresIn: "1h" }
    );

    // Generate verification link
    const verifyUrl = `${process.env.CLIENT_URL}/verify-user?token=${token}`;

    // Send email again
    await sendUserCreationEmail({
      name: user.name,
      email: user.email,
      mobile: user.mobile,
      verifyUrl,
    });

    res.json({
      message: "✅ New verification link sent successfully",
      success: true,
    });
  } catch (err) {
    console.error("❌ Resend verification error:", err);
    res.status(500).json({ message: "Server error" });
  }
};

// 🧾 Controller: updateUser
// Updates editable user details (like name and mobile) in the `Users` table by user_id.
// Prevents modification of sensitive fields like email and password, ensuring controlled profile updates.
const updateUser = async (req, res) => {
  try {
    const { id } = req.params; // user_id from URL
    const { name, mobile } = req.body;

    // Find user
    const user = await Users.findByPk(id);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Only allow updating specific fields (lock email & password)
    user.name = name || user.name;
    user.mobile = mobile || user.mobile;

    await user.save();

    return res.status(200).json({
      message: "User updated successfully",
      success: true,
      data: {
        user_id: user.user_id,
        name: user.name,
        email: user.email, // stays same
        mobile: user.mobile,
        createdBy: user.createdBy,
        updatedAt: user.updatedAt,
      },
    });
  } catch (err) {
    console.error("❌ Error updating user:", err);
    return res.status(500).json({ message: "Internal server error" });
  }
};

// 👥 Controller: getAllUsers
// Retrieves all users from the `Users` table with key details (name, email, status, verification, etc.).
// Primarily used by admins to view registered users, ordered by creation date (newest first).
const getAllUsers = async (req, res) => {
  try {
    const users = await Users.findAll({
      attributes: [
        "user_id",
        "name",
        "email",
        "mobile",
        "verified",
        "createdBy",
        "createdAt",
        "updatedAt",
        "status",
      ],
      order: [["createdAt", "DESC"]],
    });

    return res.status(200).json({
      message: "Users fetched successfully",
      success: true,
      data: users,
    });
  } catch (err) {
    console.error("❌ Error fetching users:", err);
    return res.status(500).json({ message: "Internal server error" });
  }
};

// 🔐 Controller: sendOtp
// Generates and sends a 6-digit OTP for sensitive actions (like password/status changes).
// Creates a new OTP record in the `Otp` table and emails it to either the user or admin based on context.
// Each OTP is valid for 10 minutes and associated with a unique reference key for secure verification.
const sendOtp = async (req, res) => {
  try {
    const { email, sendTo, reference } = req.body; // reference = "change password" | "change status"

    if (!email || !reference || !sendTo) {
      return res.status(400).json({
        success: false,
        message:
          "Email and reference are required (e.g. change password/status).",
      });
    }

    const toEmail = sendTo === "User" ? email : process.env.ADMIN_EMAIL;

    // 1️⃣ Find user
    const user = await Users.findOne({ where: { email } });
    if (!user) {
      return res
        .status(404)
        .json({ success: false, message: "User not found" });
    }

    // 2️⃣ Generate OTP (6-digit) and expiry (10 min)
    const otp = generateOTP(); // e.g. "482193"
    const otpExpiry = new Date(Date.now() + 10 * 60 * 1000);
    const unique_key = generateRandomAlphaNumericString();

    // 3️⃣ Save OTP to DB
    await Otp.create({
      unique_key,
      otp,
      otpExpiry,
      reference,
    });

    // 4️⃣ Send OTP email to admin
    await sendOtpEmail({
      name: user.name,
      subject: reference, // "change password" or "change status"
      userEmail: user.email,
      toEmail: toEmail,
      otp,
    });

    console.log(`✅ OTP (${otp}) sent for ${reference} of user ${user.email}`);

    // 5️⃣ Response to client
    return res.status(200).json({
      success: true,
      message: `OTP sent to admin for ${reference} verification`,
      unique_key,
    });
  } catch (error) {
    console.error("❌ Send OTP error:", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error while sending OTP",
    });
  }
};

// 🔄 Controller: changeUserStatus
// Allows an admin to activate or deactivate a user’s account in the `Users` table.
// Verifies a secure OTP from the `Otp` table before updating the user's status to prevent unauthorized changes.
// Marks the OTP as used once validation is complete.
const changeUserStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status, otp, unique_key } = req.body;

    // Validate status input
    if (!["ACTIVE", "INACTIVE"].includes(status)) {
      return res
        .status(400)
        .json({ success: false, message: "Invalid status value" });
    }

    // Validate OTP input
    if (!otp || !unique_key) {
      return res
        .status(400)
        .json({ success: false, message: "OTP and unique key are required" });
    }

    // Find the OTP record
    const otpRecord = await Otp.findOne({ where: { unique_key } });

    if (!otpRecord) {
      return res
        .status(404)
        .json({ success: false, message: "Invalid OTP request" });
    }

    // Check if OTP already used
    if (otpRecord.used) {
      return res
        .status(400)
        .json({ success: false, message: "OTP already used" });
    }

    // Check if OTP expired
    if (new Date() > otpRecord.otpExpiry) {
      return res
        .status(400)
        .json({ success: false, message: "OTP has expired" });
    }

    // Check if OTP matches
    if (otpRecord.otp !== otp) {
      return res.status(400).json({ success: false, message: "Invalid OTP" });
    }

    // Find the user
    const user = await Users.findByPk(id);
    if (!user) {
      return res
        .status(404)
        .json({ success: false, message: "User not found" });
    }

    // Update user status
    user.status = status;
    await user.save();

    // Mark OTP as used
    otpRecord.used = true;
    await otpRecord.save();

    return res.status(200).json({
      success: true,
      message: `User status updated to ${status}`,
      data: {
        user_id: user.user_id,
        name: user.name,
        email: user.email,
        mobile: user.mobile,
        status: user.status,
      },
    });
  } catch (err) {
    console.error("❌ Error changing user status:", err);
    return res
      .status(500)
      .json({ success: false, message: "Internal server error" });
  }
};

// 🔐 Controller: changePassword
// Enables a user to securely reset their password by validating an OTP from the `Otp` table.
// Once verified, it hashes the new password, updates it in the `Users` table, and marks the OTP as used.
// Ensures OTP expiry, reuse prevention, and strong password security.
const changePassword = async (req, res) => {
  try {
    const { email, password, otp, unique_key } = req.body;

    if (!email || !password || !otp || !unique_key) {
      return res
        .status(400)
        .json({ success: false, message: "Missing required fields" });
    }

    // 1️⃣ Find OTP entry
    const otpRecord = await Otp.findOne({ where: { unique_key } });

    if (!otpRecord) {
      return res
        .status(400)
        .json({ success: false, message: "Invalid or expired OTP session" });
    }

    // 2️⃣ Validate OTP
    if (otpRecord.used) {
      return res
        .status(400)
        .json({ success: false, message: "This OTP has already been used" });
    }

    if (otpRecord.otp !== otp) {
      return res.status(400).json({ success: false, message: "Invalid OTP" });
    }

    if (new Date() > otpRecord.otpExpiry) {
      return res
        .status(400)
        .json({ success: false, message: "OTP has expired" });
    }

    // 3️⃣ Find user
    const user = await Users.findOne({ where: { email } });
    if (!user) {
      return res
        .status(404)
        .json({ success: false, message: "User not found" });
    }

    // 4️⃣ Hash new password
    const hashedPassword = await bcrypt.hash(password, 10);

    // 5️⃣ Update password
    user.password = hashedPassword;
    await user.save();

    // 6️⃣ Mark OTP as used
    otpRecord.used = true;
    await otpRecord.save();

    // 7️⃣ Send success response
    return res.status(200).json({
      success: true,
      message: "Password changed successfully",
    });
  } catch (error) {
    console.error("❌ Error changing password:", error);
    return res
      .status(500)
      .json({ success: false, message: "Internal server error" });
  }
};

module.exports = {
  createUser,
  verifyUser,
  resendVerificationLink,
  updateUser,
  getAllUsers,
  sendOtp,
  changeUserStatus,
  changePassword,
};
