const crypto = require("crypto");

function generateOTP() {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

function generateRandomAlphaNumericString() {
  const letters = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ";
  const alphanum =
    "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";

  let result = letters.charAt(Math.floor(Math.random() * letters.length)); // First character: letter only

  for (let i = 1; i < 10; i++) {
    result += alphanum.charAt(Math.floor(Math.random() * alphanum.length));
  }

  return result;
}

const generateBookingCode = () => {
  return "SRU-" + crypto.randomBytes(3).toString("hex").toUpperCase(); // e.g. SRU-A1C9F3
};

module.exports = {
  generateOTP,
  generateRandomAlphaNumericString,
  generateBookingCode,
};
