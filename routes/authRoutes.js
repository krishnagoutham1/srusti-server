const {
  logout,
  getLoginStatus,
  login,
} = require("../controllers/authController");

const router = require("express").Router();

router.post("/login", login);
router.post("/logout", logout);
router.get("/logout", logout);
router.get("/loginStatus", getLoginStatus);

module.exports = router;
