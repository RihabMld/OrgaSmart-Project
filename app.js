const express = require("express");
const dotenv = require("dotenv");
const cors = require("cors"); //
const db = require("./config/db");
const cron = require("node-cron");
const meetingController = require("./controllers/managerController/meetingController");

dotenv.config();

const app = express();

// --- البرمجيات الوسيطة (Middleware) ---
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// هذا السطر هو مفتاح الربط مع الـ Frontend
app.use(cors()); //

// اختبار الاتصال بقاعدة البيانات (تم تنظيف الرموز لتجنب الأخطاء)
db.getConnection()
  .then((connection) => {
    console.log("Database connected successfully to: " + process.env.DB_NAME); //
    connection.release();
  })
  .catch((err) => {
    console.error("Database connection failed!");
    console.error("Reason: " + err.message);
  });

// --- ربط مسارات الـ Login (شغلكِ) ---
const authRoutes = require("./routes/authRoutes");
app.use("/api/users", authRoutes); //

const managerMeetingRoutes = require("./routes/managerRoutes/meetingRoutes");
const employeeMeetingRoutes = require("./routes/employeeRoutes/meetingRoutes");
// استخدام المسارات
app.use("/api/manager/meetings", managerMeetingRoutes);
app.use("/api/employee/meetings", employeeMeetingRoutes);
// تشغيل الفحص كل دقيقة
cron.schedule("* * * * *", () => {
  meetingController.updateMeetingStatus();
});
// مسار تجريبي
app.get("/", (req, res) => {
  res.send("OrgaSmart API is running...");
});

app.get("/test", (req, res) => {
  res.json({
    message: "Backend is working and connection is successful",
  });
});

// تشغيل السيرفر
const PORT = process.env.APP_PORT || 3000;
app.listen(PORT, () => {
  console.log("Server running on http://localhost:" + PORT); //
});
