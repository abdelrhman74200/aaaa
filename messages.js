const express = require("express");
const router = express.Router();
const mysql = require("mysql2/promise");
const multer = require("multer");
const path = require("path");
const { authorizeRoles } = require("../middlewares/auth"); // هنطلعه من الكود الأساسي

// إعدادات رفع الملفات
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    if (file.mimetype.startsWith("image/")) {
      cb(null, path.join(__dirname, "..", "uploads", "images"));
    } else if (file.mimetype.startsWith("video/")) {
      cb(null, path.join(__dirname, "..", "uploads", "videos"));
    } else {
      cb(new Error("نوع الملف غير مسموح"));
    }
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    cb(null, Date.now() + "-" + Math.round(Math.random() * 1e9) + ext);
  },
});

const upload = multer({
  storage,
  limits: { fileSize: 20 * 1024 * 1024 }, // 20MB
  fileFilter: (req, file, cb) => {
    const allowed = [
      "image/jpeg",
      "image/png",
      "image/gif",
      "video/mp4",
      "video/mpeg",
    ];
    if (allowed.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error("نوع الملف غير مسموح"));
    }
  },
});

const dbConfig = {
  host: "localhost",
  user: "root",
  password: "",
  database: "b2b_marketplace",
};

// إرسال رسالة
router.post(
  "/",
  authorizeRoles([1, 2, 3, 4]),
  upload.fields([
    { name: "image", maxCount: 1 },
    { name: "video", maxCount: 1 },
  ]),
  async (req, res) => {
    const { receiver_id, subject, body } = req.body;
    if (!receiver_id || !body) {
      return res.status(400).json({ error: "البيانات غير مكتملة" });
    }

    const cleanBody = body.replace(/<script.*?>.*?<\/script>/gi, ""); // منع الأكواد الخبيثة
    const image_url = req.files?.image
      ? `/uploads/images/${req.files.image[0].filename}`
      : null;
    const video_url = req.files?.video
      ? `/uploads/videos/${req.files.video[0].filename}`
      : null;

    try {
      const connection = await mysql.createConnection(dbConfig);
      await connection.execute(
        `INSERT INTO messages (sender_id, receiver_id, subject, body, image_url, video_url)
         VALUES (?, ?, ?, ?, ?, ?)`,
        [
          req.user.id,
          receiver_id,
          subject || null,
          cleanBody,
          image_url,
          video_url,
        ]
      );
      await connection.end();
      res.json({ success: true });
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: "خطأ في إرسال الرسالة" });
    }
  }
);

// عرض الرسائل المستلمة
router.get("/inbox", authorizeRoles([1, 2, 3, 4]), async (req, res) => {
  try {
    const connection = await mysql.createConnection(dbConfig);
    const [rows] = await connection.execute(
      "SELECT * FROM messages WHERE receiver_id = ? ORDER BY created_at DESC",
      [req.user.id]
    );
    await connection.end();
    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "خطأ في عرض الرسائل" });
  }
});

// عرض الرسائل المرسلة
router.get("/sent", authorizeRoles([1, 2, 3, 4]), async (req, res) => {
  try {
    const connection = await mysql.createConnection(dbConfig);
    const [rows] = await connection.execute(
      "SELECT * FROM messages WHERE sender_id = ? ORDER BY created_at DESC",
      [req.user.id]
    );
    await connection.end();
    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "خطأ في عرض الرسائل" });
  }
});

module.exports = router;
