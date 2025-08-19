/**
 * server.js
 *
 * Node.js / Express backend for SouqBridge (B2B marketplace)
 * - privacyCheckbox mandatory for both buyers and sellers
 * - rememberMe optional (cookie set only if requested)
 * - role name unified: "seller" (not "supplier")
 *
 * Use: node server.js
 *
 * Important:
 * - Create a .env with JWT_SECRET (recommended) and NODE_ENV=production for secure cookies in prod.
 * - Make sure MySQL is configured as in dbConfig below or via env variables.
 *
 * This file intentionally contains many comments and helper functions to be
 * easy to maintain and to exceed 500 lines as requested.
 */

const express = require("express");
const app = express();
const mysql = require("mysql2/promise");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");
const helmet = require("helmet");
const cors = require("cors");
const cookieParser = require("cookie-parser");
const multer = require("multer");
const path = require("path");
const rateLimit = require("express-rate-limit");
const { body, validationResult } = require("express-validator"); // lightweight validation helpers
const fs = require("fs");
require("dotenv").config();

// ------------------------ Configuration ------------------------
const isProd = process.env.NODE_ENV === "production";
const PORT = process.env.PORT ? parseInt(process.env.PORT, 10) : 3011;
const JWT_SECRET = process.env.JWT_SECRET || "super_secure_jwt_key";
const saltRounds = parseInt(process.env.SALT_ROUNDS || "10", 10);

// DB config: change to environment vars if you like
const dbConfig = {
  host: process.env.DB_HOST || "localhost",
  user: process.env.DB_USER || "root",
  password: process.env.DB_PASS || "",
  database: process.env.DB_NAME || "b2b_marketplace",
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
};

// ------------------------ Utility helpers ------------------------
/**
 * Create a MySQL connection pool for better performance.
 * Use pool.getConnection() and connection.release() in routes.
 */
const pool = mysql.createPool(dbConfig);

/**
 * Wrap async route handlers to catch errors and forward to express error handler
 */
const asyncHandler = (fn) => (req, res, next) => {
  Promise.resolve(fn(req, res, next)).catch(next);
};

/**
 * Minimal input sanitizer for strings (trim)
 */
function sanitizeString(str) {
  if (typeof str !== "string") return str;
  return str.trim();
}

/**
 * Password policy check (example)
 * - min 6 chars
 * - at least one lower, one upper, one digit
 */
function isStrongPassword(pw) {
  if (!pw || typeof pw !== "string") return false;
  const minLen = 6;
  const upper = /[A-Z]/;
  const lower = /[a-z]/;
  const digit = /\d/;
  return (
    pw.length >= minLen && upper.test(pw) && lower.test(pw) && digit.test(pw)
  );
}

/**
 * Create JWT token
 */
function createToken(payload, rememberMe = false) {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: rememberMe ? "7d" : "1h" });
}

/**
 * Get token from cookie or Authorization header
 */
function getTokenFromRequest(req) {
  let token = null;
  if (req.cookies && req.cookies.token) token = req.cookies.token;
  else if (req.headers && req.headers.authorization)
    token = req.headers.authorization.replace("Bearer ", "");
  return token;
}

/**
 * Standard JSON error helper
 */
function jsonError(res, status, message) {
  return res.status(status).json({ error: message });
}

// ------------------------ Multer setup ------------------------
const uploadsDir = path.join(__dirname, "uploads");
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadsDir);
  },
  filename: (req, file, cb) => {
    const name = `${Date.now()}-${Math.round(
      Math.random() * 1e9
    )}${path.extname(file.originalname)}`;
    cb(null, name);
  },
});
const upload = multer({
  storage,
  fileFilter: (req, file, cb) => {
    const filetypes = /jpeg|jpg|png|pdf|mp4|avi|mov/;
    const extname = filetypes.test(
      path.extname(file.originalname).toLowerCase()
    );
    const mimetype = filetypes.test(file.mimetype);
    if (extname && mimetype) cb(null, true);
    else
      cb(
        new Error("Only .pdf, .jpg, .png, .mp4, .avi, .mov files are allowed")
      );
  },
  limits: { fileSize: 50 * 1024 * 1024 },
});

// Ensure uploads directory exists (best-effort; not blocking)
try {
  if (!fs.existsSync(uploadsDir)) fs.mkdirSync(uploadsDir, { recursive: true });
} catch (err) {
  console.warn("Could not create uploads directory:", err.message);
}

// ------------------------ Middleware ------------------------
app.use(helmet());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// CORS: adjust origins as needed
const allowedOrigins = [
  "http://localhost:3000",
  "http://127.0.0.1:3000",
  "http://localhost:5500",
  "http://127.0.0.1:5500",
  "http://127.0.0.1:54712",
];
app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin) return callback(null, true); // allow server-to-server or same-origin
      if (allowedOrigins.includes(origin)) return callback(null, true);
      console.warn("Blocked origin by CORS:", origin);
      return callback(new Error("Not allowed by CORS"));
    },
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);

// Rate limiter
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 200,
  message: "Too many requests, try again later.",
});
app.use(limiter);

// Serve uploaded files
app.use("/uploads", express.static(uploadsDir, { index: false }));

// ------------------------ Authorization middleware ------------------------
/**
 * authorizeRoles(allowedRolesArray)
 * - reads token from cookie or Authorization header
 * - verifies token and ensures role is allowed
 */
function authorizeRoles(allowedRoles = []) {
  return asyncHandler(async (req, res, next) => {
    const token = getTokenFromRequest(req);
    if (!token) return jsonError(res, 401, "Access denied: token missing");

    try {
      const decoded = jwt.verify(token, JWT_SECRET);
      if (!decoded || !decoded.role)
        return jsonError(res, 401, "Invalid token payload");
      if (allowedRoles.length > 0 && !allowedRoles.includes(decoded.role))
        return jsonError(res, 403, "Forbidden: insufficient role");
      req.user = decoded;
      return next();
    } catch (err) {
      console.error("Token verification failed:", err.message);
      return jsonError(res, 401, "Invalid or expired token");
    }
  });
}

// ------------------------ Routes ------------------------
/**
 * Health check
 */
app.get(
  "/health",
  asyncHandler(async (req, res) => {
    try {
      const conn = await pool.getConnection();
      await conn.ping();
      conn.release();
      res.json({ ok: true, db: "connected" });
    } catch (err) {
      console.error("Health check DB error:", err.message);
      res.status(500).json({ ok: false, db: "unavailable" });
    }
  })
);

/**
 * Register
 *
 * Requirements:
 * - role must be 'buyer' or 'seller'
 * - privacyCheckbox must be 'on' (mandatory for both roles)
 * - rememberMe optional ('on' or absent)
 * - for buyer: name, gender, birthdate, country required (per your earlier code)
 * - for seller: company_name, business_type, commercial_registration, tax_id, company_address, company_country, vat_number, contact_person, contact_position, contact_phone required
 * - files: commercial_registration_file, tax_file required for seller; license_file optional
 *
 * Security:
 * - password hashed with bcrypt
 * - email uniqueness checked
 */
app.post(
  "/register",
  upload.fields([
    { name: "commercial_registration_file", maxCount: 1 },
    { name: "tax_file", maxCount: 1 },
    { name: "license_file", maxCount: 1 },
  ]),
  asyncHandler(async (req, res) => {
    const raw = req.body || {};
    const role = sanitizeString(raw.role);
    const name = sanitizeString(raw.name);
    const email = sanitizeString(raw.email);
    const password = raw.password;
    const confirmPassword = raw.confirmPassword;

    // معالجة الجنس بحيث يقبل العربي أو الإنجليزي
    let gender = sanitizeString(raw.gender);
    if (gender === "ذكر") gender = "male";
    else if (gender === "أنثى") gender = "female";
    else if (gender === "اخرى" || gender === "أخرى") gender = "other";

    const birthdate = sanitizeString(raw.birthdate);
    const country = sanitizeString(raw.country);
    let rememberMe = false;
    let privacyCheckbox = false;
    if (role === "buyer") {
      rememberMe = raw.buyer_rememberMe === "on";
      privacyCheckbox = raw.buyer_privacyCheckbox === "on";
    } else if (role === "seller") {
      rememberMe = raw.seller_rememberMe === "on";
      privacyCheckbox = raw.seller_privacyCheckbox === "on";
    }

    // Seller fields
    const company_name = sanitizeString(raw.company_name);
    const business_type = sanitizeString(raw.business_type);
    const commercial_registration = sanitizeString(raw.commercial_registration);
    const tax_id = sanitizeString(raw.tax_id);
    const company_address = sanitizeString(raw.company_address);
    const company_country = sanitizeString(raw.company_country);
    const vat_number = sanitizeString(raw.vat_number);
    const contact_person = sanitizeString(raw.contact_person);
    const contact_position = sanitizeString(raw.contact_position);
    const contact_phone = sanitizeString(raw.contact_phone);

    // File paths
    const commercial_registration_file = req.files?.commercial_registration_file
      ? req.files.commercial_registration_file[0].path
      : null;
    const tax_file = req.files?.tax_file ? req.files.tax_file[0].path : null;
    const license_file = req.files?.license_file
      ? req.files.license_file[0].path
      : null;

    // التحقق من المدخلات
    if (!role) return jsonError(res, 400, "يرجى اختيار نوع الحساب");
    if (!["buyer", "seller"].includes(role))
      return jsonError(res, 400, "نوع الحساب غير صالح");
    if (!privacyCheckbox)
      return jsonError(res, 400, "يرجى الموافقة على سياسة الخصوصية");
    if (!email || !password || !confirmPassword)
      return jsonError(res, 400, "يرجى إدخال البريد الإلكتروني وكلمة المرور");
    if (password !== confirmPassword)
      return jsonError(res, 400, "كلمات السر غير متطابقة");

    if (role === "buyer") {
      if (!name || !gender || !birthdate || !country)
        return jsonError(res, 400, "يرجى إدخال جميع الحقول المطلوبة للمشتري");
    } else if (role === "seller") {
      const requiredFields = {
        company_name,
        business_type,
        commercial_registration,
        tax_id,
        company_address,
        company_country,
        vat_number,
        contact_person,
        contact_position,
        contact_phone,
      };
      for (const [k, v] of Object.entries(requiredFields)) {
        if (!v) return jsonError(res, 400, `يرجى إدخال ${k}`);
      }
      if (!commercial_registration_file || !tax_file)
        return jsonError(
          res,
          400,
          "يرجى رفع صورة السجل التجاري وصورة البطاقة الضريبية"
        );
    }

    const connection = await pool.getConnection();
    try {
      // التأكد أن الإيميل غير مستخدم
      const [exists] = await connection.execute(
        "SELECT id FROM users WHERE email = ?",
        [email]
      );
      if (exists.length > 0)
        return jsonError(res, 409, "البريد الإلكتروني مستخدم بالفعل");

      const password_hash = await bcrypt.hash(password, saltRounds);

      let linked_id;
      if (role === "buyer") {
        const [buyerResult] = await connection.execute(
          `INSERT INTO buyers (
            full_name, email, phone_number, password_hash, gender, birthdate, country,
            city, address_line1, address_line2, postal_code,
            purchase_count, total_spent, wishlist, cart_items, preferred_payment_method, card_last4,
            last_login, online_status, interests, preferred_categories, newsletter_subscribed,
            two_factor_enabled, account_status, created_at, updated_at, privacyCheckbox
          ) VALUES (?, ?, NULL, ?, ?, ?, ?, NULL, NULL, NULL, NULL, 0, 0, NULL, NULL, NULL, NULL,
                    NULL, 'offline', NULL, NULL, 1, 0, 'pending', NOW(), NOW(), ?)`,
          [
            name,
            email,
            password_hash,
            gender,
            birthdate,
            country,
            privacyCheckbox ? 1 : 0,
          ]
        );
        linked_id = buyerResult.insertId;
      } else {
        const [sellerResult] = await connection.execute(
          `INSERT INTO sellers (
            company_name, owner_name, email, phone_number, password_hash, business_type,
            commercial_registration_number, vat_number, tax_id, license_number,
            country, city, address_line1, address_line2, postal_code,
            total_sales, orders_fulfilled, products_count, top_selling_categories,
            ratings_average, reviews_count, preferred_payout_method, bank_account_last4,
            paypal_email, stripe_id, two_factor_enabled, account_status, last_login, online_status,
            created_at, updated_at, privacyCheckbox, commercial_registration_file, tax_file, license_file
          ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NULL, ?, NULL, NULL, 0, 0, 0, NULL, 0, 0, NULL, NULL, NULL, NULL, 0, 'pending', NULL, 'offline', NOW(), NOW(), ?, ?, ?, ?)`,
          [
            company_name,
            contact_person,
            email,
            contact_phone,
            password_hash,
            business_type,
            commercial_registration,
            vat_number,
            tax_id,
            null, // license_number set to null (no input field)
            company_country,
            company_address,
            privacyCheckbox ? 1 : 0,
            commercial_registration_file,
            tax_file,
            license_file,
          ]
        );
        linked_id = sellerResult.insertId;
      }

      // إدخال المستخدم في جدول users
      const [userResult] = await connection.execute(
        `INSERT INTO users (name, email, password_hash, role, linked_account_id, created_at, updated_at)
         VALUES (?, ?, ?, ?, ?, NOW(), NOW())`,
        [
          role === "buyer" ? name : company_name,
          email,
          password_hash,
          role,
          linked_id,
        ]
      );
      const user_id = userResult.insertId;

      const token = createToken({ id: user_id, role }, rememberMe);
      res.cookie("token", token, {
        httpOnly: true,
        secure: isProd,
        sameSite: "lax",
        maxAge: rememberMe ? 7 * 24 * 60 * 60 * 1000 : undefined,
        path: "/",
      });

      return res.json({
        success: true,
        user_id,
        linked_id,
        token,
        firstName:
          (role === "buyer" ? name : company_name)?.split(" ")[0] || null,
        rememberMe,
      });
    } finally {
      connection.release();
    }
  })
);

// ------------------------ Login ------------------------
// (No changes needed; copied for completeness)
app.post(
  "/login",
  [
    body("email").isEmail().withMessage("Invalid email"),
    body("password").isLength({ min: 1 }).withMessage("Password required"),
  ],
  asyncHandler(async (req, res) => {
    // validation
    const errors = validationResult(req);
    if (!errors.isEmpty()) return jsonError(res, 400, errors.array()[0].msg);

    const email = sanitizeString(req.body.email);
    const password = req.body.password;
    const rememberMe =
      req.body.rememberMe === true ||
      req.body.rememberMe === "on" ||
      req.body.rememberMe === "true";

    const connection = await pool.getConnection();
    try {
      const [users] = await connection.execute(
        "SELECT * FROM users WHERE email = ?",
        [email]
      );
      if (!users.length) return jsonError(res, 404, "المستخدم غير موجود");

      const user = users[0];
      const match = await bcrypt.compare(password, user.password_hash);
      if (!match) return jsonError(res, 401, "كلمة المرور غير صحيحة");

      // Update users.updated_at
      await connection.execute(
        "UPDATE users SET updated_at = NOW() WHERE id = ?",
        [user.id]
      );

      // Update linked table status
      if (user.role === "buyer") {
        await connection.execute(
          "UPDATE buyers SET last_login = NOW(), online_status = 'online' WHERE id = ?",
          [user.linked_account_id]
        );
      } else if (user.role === "seller") {
        await connection.execute(
          "UPDATE sellers SET last_login = NOW(), online_status = 'online' WHERE id = ?",
          [user.linked_account_id]
        );
      } else {
        // unknown role -> allow login but don't update linked table
      }

      // Create token
      const token = createToken({ id: user.id, role: user.role }, rememberMe);

      // Set cookie always, but persistent only if rememberMe
      res.cookie("token", token, {
        httpOnly: true,
        secure: isProd,
        sameSite: "lax",
        maxAge: rememberMe ? 7 * 24 * 60 * 60 * 1000 : undefined,
        path: "/",
      });

      // Return limited user info
      const firstName = user.name ? user.name.split(" ")[0] : null;
      res.json({
        success: true,
        firstName,
        token,
        rememberMe,
        role: user.role,
      });
    } finally {
      connection.release();
    }
  })
);

// ------------------------ Logout ------------------------
/**
 * POST /logout
 * - clears the token cookie (if present) and returns success
 */
app.post(
  "/logout",
  asyncHandler(async (req, res) => {
    // Clear cookie (if present)
    res.clearCookie("token", {
      httpOnly: true,
      sameSite: "lax",
      secure: isProd,
      path: "/",
    });
    // Optional: if token present, decode and set online_status = 'offline'
    const token = getTokenFromRequest(req);
    if (token) {
      try {
        const decoded = jwt.verify(token, JWT_SECRET);
        if (decoded && decoded.id) {
          const connection = await pool.getConnection();
          try {
            const [users] = await connection.execute(
              "SELECT * FROM users WHERE id = ?",
              [decoded.id]
            );
            if (users.length) {
              const user = users[0];
              if (user.role === "buyer") {
                await connection.execute(
                  "UPDATE buyers SET online_status = 'offline' WHERE id = ?",
                  [user.linked_account_id]
                );
              } else if (user.role === "seller") {
                await connection.execute(
                  "UPDATE sellers SET online_status = 'offline' WHERE id = ?",
                  [user.linked_account_id]
                );
              }
            }
          } finally {
            connection.release();
          }
        }
      } catch (err) {
        // ignore token errors on logout
      }
    }
    res.json({ success: true });
  })
);

// ------------------------ Save token (set cookie) ------------------------
/**
 * POST /save-token
 * - body: { token }
 * - verifies token and sets cookie for remember-me behaviour
 */
app.post(
  "/save-token",
  asyncHandler(async (req, res) => {
    const token = req.body?.token;
    if (!token) return jsonError(res, 400, "Token is required");

    try {
      jwt.verify(token, JWT_SECRET);
      res.cookie("token", token, {
        httpOnly: true,
        secure: isProd,
        sameSite: "lax",
        maxAge: 7 * 24 * 60 * 60 * 1000,
        path: "/",
      });
      res.json({ success: true });
    } catch (err) {
      console.error("Save-token verify failed:", err.message);
      jsonError(res, 401, "Invalid or expired token");
    }
  })
);

// ------------------------ Verify token ------------------------
/**
 * GET /verify-token
 * - checks cookie or Authorization header for token validity
 * - returns { valid: true, firstName } or { valid: false }
 */
app.get(
  "/verify-token",
  asyncHandler(async (req, res) => {
    const token = getTokenFromRequest(req);
    if (!token) return res.json({ valid: false });

    try {
      const decoded = jwt.verify(token, JWT_SECRET);
      const connection = await pool.getConnection();
      try {
        const [userRows] = await connection.execute(
          "SELECT name FROM users WHERE id = ?",
          [decoded.id]
        );
        if (!userRows.length) return res.json({ valid: false });
        const name = userRows[0].name || "Account";
        const firstName = name.split(" ")[0];
        res.json({ valid: true, firstName });
      } finally {
        connection.release();
      }
    } catch (err) {
      console.error("Verify token failed:", err.message);
      res.json({ valid: false });
    }
  })
);

// ------------------------ Profile endpoints ------------------------
/**
 * GET /me
 * - returns profile for authenticated user
 */
app.get(
  "/me",
  authorizeRoles([]), // any authenticated user
  asyncHandler(async (req, res) => {
    const uid = req.user.id;
    const connection = await pool.getConnection();
    try {
      const [users] = await connection.execute(
        "SELECT id, name, email, role, linked_account_id, created_at FROM users WHERE id = ?",
        [uid]
      );
      if (!users.length) return jsonError(res, 404, "User not found");

      const user = users[0];
      let profile = { ...user };
      // fetch detailed from linked table
      if (user.role === "buyer") {
        const [buyers] = await connection.execute(
          "SELECT id, full_name, email, gender, birthdate, country, created_at, privacyCheckbox FROM buyers WHERE id = ?",
          [user.linked_account_id]
        );
        if (buyers.length) profile.details = buyers[0];
      } else if (user.role === "seller") {
        const [sellers] = await connection.execute(
          "SELECT id, company_name, owner_name, email, phone_number, business_type, created_at, privacyCheckbox FROM sellers WHERE id = ?",
          [user.linked_account_id]
        );
        if (sellers.length) profile.details = sellers[0];
      }
      res.json({ success: true, profile });
    } finally {
      connection.release();
    }
  })
);

// ------------------------ Admin-like endpoints (for debugging) ------------------------
/**
 * GET /users
 * - list users (limited)
 * - this is not protected by role here but in production restrict to admin only
 */
app.get(
  "/users",
  authorizeRoles([]), // any logged-in user can call; modify to restrict
  asyncHandler(async (req, res) => {
    const connection = await pool.getConnection();
    try {
      const [rows] = await connection.execute(
        "SELECT id, name, email, role, linked_account_id, created_at FROM users ORDER BY created_at DESC LIMIT 200"
      );
      res.json({ success: true, users: rows });
    } finally {
      connection.release();
    }
  })
);

// ------------------------ Product Upload Route ------------------------

// ------------------------ Utility: change online status on server exit ------------------------
async function setAllOffline() {
  try {
    const conn = await pool.getConnection();
    try {
      await conn.execute(
        "UPDATE buyers SET online_status = 'offline' WHERE online_status <> 'offline'"
      );
      await conn.execute(
        "UPDATE sellers SET online_status = 'offline' WHERE online_status <> 'offline'"
      );
    } finally {
      conn.release();
    }
  } catch (err) {
    console.warn("Could not set all offline on shutdown:", err.message);
  }
}
process.on("SIGINT", async () => {
  console.log("SIGINT received: setting users offline and shutting down...");
  await setAllOffline();
  process.exit(0);
});
process.on("SIGTERM", async () => {
  console.log("SIGTERM received: setting users offline and shutting down...");
  await setAllOffline();
  process.exit(0);
});

// ------------------------ Error handling middleware ------------------------
app.use((err, req, res, next) => {
  console.error("Unhandled error:", err.message || err);
  if (res.headersSent) return next(err);
  if (err instanceof multer.MulterError) {
    // multer errors
    return res.status(400).json({ error: err.message });
  }
  res.status(500).json({ error: "خطأ في الخادم" });
});

// ------------------------ Start server ------------------------
app.listen(PORT, "0.0.0.0", () => {
  console.log(
    `✅ Server running at http://localhost:${PORT} (NODE_ENV=${
      process.env.NODE_ENV || "development"
    })`
  );
});
