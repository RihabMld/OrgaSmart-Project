const nodemailer = require("nodemailer");
require("dotenv").config();

// إعداد الناقل باستخدام بيانات Brevo
const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_HOST,
  port: process.env.EMAIL_PORT,
  secure: false, // استخدم true للمنفذ 465 و false لـ 587
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

// دالة إرسال إيميل الترحيب عند التسجيل
const sendWelcomeEmail = async (userEmail, userName, password) => {
  const mailOptions = {
    from: `"${process.env.FROM_NAME}" <${process.env.FROM_EMAIL}>`,
    to: userEmail,
    subject: "Welcome to OrgaSmart!",
    html: `
      <h1>Welcome, ${userName}!</h1>
      <p>Your account has been created successfully.</p>
      <p><b>Your Temporary Password:</b> ${password}</p>
      <p>Please log in and change your password for security.</p>
    `,
  };

  try {
    const info = await transporter.sendMail(mailOptions);
    console.log(`✅ Welcome email sent to ${userEmail}: ${info.messageId}`);
    return info;
  } catch (error) {
    console.error("❌ Error sending welcome email:", error.message);
    throw error;
  }
};

// دالة إرسال إيميل إعادة تعيين كلمة المرور
const sendPasswordResetEmail = async (userEmail, resetLink) => {
  const mailOptions = {
    from: `"${process.env.FROM_NAME}" <${process.env.FROM_EMAIL}>`,
    to: userEmail,
    subject: "Password Reset Request",
    html: `
      <p>You requested a password reset.</p>
      <p>Click the link below to reset your password:</p>
      <a href="${resetLink}">${resetLink}</a>
      <p>This link will expire in 1 hour.</p>
    `,
  };

  try {
    const info = await transporter.sendMail(mailOptions);
    console.log(`✅ Reset email sent to ${userEmail}`);
    return info;
  } catch (error) {
    console.error("❌ Error sending reset email:", error.message);
    throw error;
  }
};

module.exports = { sendWelcomeEmail, sendPasswordResetEmail };
