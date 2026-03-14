const express = require("express");
const dotenv = require("dotenv");
const cors = require("cors");
const db = require("./config/db"); // استدعاء ملف اتصال قاعدة البيانات

// تحميل المتغيرات البيئية من ملف .env
dotenv.config();

const app = express();

// البرمجيات الوسيطة (Middleware)
app.use(express.json()); // لتحليل بيانات JSON القادمة في الطلبات
app.use(express.urlencoded({ extended: true })); // لتحليل البيانات القادمة من الـ Forms
app.use(cors()); // للسماح بالاتصال من واجهات برمجية مختلفة (Frontend)

// اختبار الاتصال بقاعدة البيانات فور تشغيل التطبيق
db.getConnection()
  .then((connection) => {
    console.log(
      `🚀 Database connected successfully to: ${process.env.DB_NAME}`,
    );
    connection.release(); // تحرير الاتصال ليبقى متاحاً للعمليات الأخرى
  })
  .catch((err) => {
    console.error("❌ Database connection failed!");
    console.error("Reason:", err.message);
  });

// ربط المسارات (Routes)
const authRoutes = require("./routes/authRoutes");
app.use("/api/users", authRoutes); // جميع مسارات Auth ستبدأ بـ /api/users

// مسار تجريبي للتأكد من عمل السيرفر
app.get("/", (req, res) => {
  res.send("🚀 OrgaSmart API is running...");
});

// تحديد المنفذ وتشغيل السيرفر
const PORT = process.env.APP_PORT || 3000;
app.listen(PORT, () => {
  console.log(`✅ Server running on http://localhost:${PORT}`);
});
