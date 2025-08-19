const jwt = require("jsonwebtoken");
require("dotenv").config();

const JWT_SECRET = process.env.JWT_SECRET;
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || "7d";

// إنشاء التوكن
const generateToken = (user) => {
  return jwt.sign(
    { id: user.id, role: user.role_id, is_main: user.is_main },
    JWT_SECRET,
    { expiresIn: JWT_EXPIRES_IN }
  );
};

// التحقق من التوكن
const verifyToken = (token) => {
  return jwt.verify(token, JWT_SECRET);
};

module.exports = {
  generateToken,
  verifyToken,
};
