const jwt = require("jsonwebtoken");
require("dotenv").config();

const JWT_SECRET = process.env.JWT_SECRET;

const authenticateJWT = (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (authHeader?.startsWith("Bearer ")) {
    const token = authHeader.split(" ")[1];

    try {
      const user = jwt.verify(token, JWT_SECRET);
      req.user = user; // يضاف إلى req لاستخدامه لاحقًا
      next();
    } catch (err) {
      return res.status(403).json({ message: "Invalid or expired token" });
    }
  } else {
    return res.status(401).json({ message: "Authentication token required" });
  }
};

module.exports = authenticateJWT;
