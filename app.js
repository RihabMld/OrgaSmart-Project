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
});

// تشغيل السيرفر
const PORT = process.env.APP_PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});