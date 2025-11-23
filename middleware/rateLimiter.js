const rateLimit = require("express-rate-limit");

const resendLimiter = rateLimit({
  windowMs: 10 * 60 * 1000, // 10 minutes
  max: 3, // 3 resends max per 10 min
  message: "Too many resend requests. Please try again later.",
});

router.post("/resend-verification", resendLimiter, resendVerificationLink);
