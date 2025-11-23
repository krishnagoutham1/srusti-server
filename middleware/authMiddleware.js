// middlewares/authMiddleware.js
// const requireAuth = (req, res, next) => {
//   try {
//     if (!req.session || !req.session.user) {
//       return res.status(401).json({
//         success: false,
//         message: "Unauthorized: Please log in to access this resource.",
//       });
//     }

//     // Optionally ensure user is active and logged in
//     if (!req.session.user.login) {
//       return res.status(401).json({
//         success: false,
//         message: "Session expired or invalid. Please log in again.",
//       });
//     }

//     next();
//   } catch (error) {
//     console.error("Auth middleware error:", error);
//     return res.status(500).json({
//       success: false,
//       message: "Internal server error in authentication check.",
//     });
//   }
// };
const requireAuth = (req, res, next) => {
  next();
};

module.exports = { requireAuth };
