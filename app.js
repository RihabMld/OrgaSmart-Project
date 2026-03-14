const express = require("express");
const dotenv = require("dotenv");
const cors = require("cors");
const db = require("./config/db"); 

dotenv.config();
const app = express();

// Middleware
app.use(express.json()); 
app.use(express.urlencoded({ extended: true })); 
app.use(cors()); 

// التحقق من اتصال قاعدة البيانات (استخدام async/await أفضل)
const checkConnection = async () => {
    try {
        const connection = await db.getConnection();
        console.log('Database connected successfully...');
        connection.release(); 
    } catch (err) {
        console.error("Database connection failed!", err.message);
    }
};
checkConnection();

// --- استيراد المسارات ---
// ملاحظة: إذا توقف السيرفر، تأكدي أن كل ملف من هذه الملفات ينتهي بـ module.exports = router;

// مسارات الموظف (Employee)
const employeeProjectRoutes = require('./routes/employeeRoutes/projectRoutes');
const employeeTaskRoutes = require('./routes/employeeRoutes/taskRoutes');
const employeeSuggestionRoutes = require('./routes/employeeRoutes/suggestionRoutes');

// مسارات المدير (Manager)
const managerProjectRoutes = require('./routes/managerRoutes/projectRoutes');
const managerTaskRoutes = require('./routes/managerRoutes/taskRoutes');
const managerSuggestionRoutes = require('./routes/managerRoutes/suggestionRoutes');

// --- تفعيل المسارات (Middleware) ---

// روابط الموظف (Employee)
app.use('/api/employee/projects', employeeProjectRoutes);
app.use('/api/employee/tasks', employeeTaskRoutes);
app.use('/api/employee/suggestions', employeeSuggestionRoutes);

// روابط المدير (Manager)
app.use('/api/manager/projects', managerProjectRoutes);
app.use('/api/manager/tasks', managerTaskRoutes);
app.use('/api/manager/suggestions', managerSuggestionRoutes);

// المسار الأساسي
app.get("/", (req, res) => {
  res.send("OrgaSmart API is running (Modular Mode)...");
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
  console.log(`Server running on http://localhost:${PORT}`);
});
  console.log("Server running on http://localhost:" + PORT); //
});
