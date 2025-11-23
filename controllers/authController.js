const bcrypt = require("bcryptjs");
const { Users } = require("../models");

// 🔐 Controller: login
// Authenticates a user by validating credentials from the `Users` table.
// Checks if the account is verified and active, compares hashed passwords, and regenerates a secure session.
// Stores essential user info in the session and updates the `last_login_at` timestamp on successful login.
const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // 🧠 Basic validation
    if (!email || !password) {
      return res
        .status(400)
        .json({ message: "Email and password are required" });
    }

    // 🔍 Find user
    const user = await Users.findOne({ where: { email } });
    if (!user) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    // 🔐 Check if verified
    if (!user.verified) {
      return res
        .status(403)
        .json({ message: "Please verify your email before logging in" });
    }

    // 🚫 Check if ACTIVE
    if (user.status !== "ACTIVE") {
      return res
        .status(403)
        .json({ message: "Your account is inactive. Please contact support." });
    }

    // 🔑 Compare password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    // 🕒 Update last login timestamp
    user.last_login_at = new Date();
    await user.save({ fields: ["last_login_at"] });

    // 🧱 Regenerate session for security
    req.session.regenerate((err) => {
      if (err) {
        console.error("Session regeneration error:", err);
        return res.status(500).json({ message: "Session error" });
      }

      // ✅ Create session object
      req.session.user = {
        id: user.user_id,
        name: user.name,
        email: user.email,
        role: user.role,
        login: true,
      };

      req.session.save((err) => {
        if (err) {
          console.error("Session save error:", err);
          return res.status(500).json({ message: "Session save failed" });
        }

        return res.status(200).json({
          success: true,
          message: "Login successful",
          user: req.session.user,
        });
      });
    });
  } catch (err) {
    console.error("Login error:", err);
    res.status(500).json({ message: "Server error" });
  }
};

// 👀 Controller: getLoginStatus
// Checks if a user is currently logged in by validating the session state.
// Returns the session user object if active, or a false flag if no valid session exists.
// Helps maintain persistent login state on the client side.
const getLoginStatus = async (req, res) => {
  try {
    if (req.session && req.session.user && req.session.user.login) {
      return res.status(200).json({
        loggedIn: true,
        user: req.session.user,
      });
    } else {
      return res.status(200).json({
        loggedIn: false,
      });
    }
  } catch (err) {
    console.error("Check login status error:", err);
    res.status(500).json({ message: "Server error" });
  }
};

// 🚪 Controller: logout
// Safely logs out the user by destroying the active session and clearing the session cookie from the browser.
// Ensures secure cleanup to prevent unauthorized reuse of session data after logout.
const logout = async (req, res) => {
  try {
    if (!req.session) {
      return res.status(200).json({
        success: true,
        message: "Already logged out",
      });
    }

    req.session.destroy((err) => {
      if (err) {
        console.error("Session destroy error:", err);
        return res.status(500).json({ message: "Logout failed" });
      }

      // ✅ clear cookie for browser cleanup
      res.clearCookie("session", {
        path: "/",
        httpOnly: true,
        secure: false, // true in production (HTTPS)
        sameSite: "lax",
      });

      return res.status(200).json({
        success: true,
        message: "Logged out successfully",
      });
    });
  } catch (err) {
    console.error("❌ Logout error:", err);
    res.status(500).json({ message: "Server error" });
  }
};

module.exports = {
  login,
  getLoginStatus,
  logout,
};
