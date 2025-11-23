const router = require("express").Router();
const {
  createUser,
  getAllUsers,
  updateUser,
  changeUserStatus,
  sendOtp,
  verifyUser,
  resendVerificationLink,
  changePassword,
} = require("../controllers/userController");
const { requireAuth } = require("../middleware/authMiddleware");

router.post("/", requireAuth, createUser);
router.get("/", requireAuth, getAllUsers);
router.put("/:id", requireAuth, updateUser);
router.post("/send-otp", requireAuth, sendOtp);
router.post("/change-password", requireAuth, changePassword);
router.patch("/:id/status", requireAuth, changeUserStatus);

router.get("/verify", verifyUser);
router.post("/resend-verification", resendVerificationLink);

module.exports = router;
