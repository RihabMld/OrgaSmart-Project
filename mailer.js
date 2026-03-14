const nodemailer = require("nodemailer");
require("dotenv").config();

const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_HOST,
  port: process.env.EMAIL_PORT,
  secure: false,
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

/**
 * @param {string} userEmail
 * @param {string} userName
 */
// mssaoud update: White Background + Updated Text Placement
const sendWelcomeEmail = async (userEmail, userName, password) => {
  const htmlContent = `
  <div style="background-color:#ffffff; padding:20px 10px; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;">
    <div style="max-width:550px; margin:0 auto; background-color:#ffffff; border: 1px solid #f0f0f0; border-radius:12px; overflow:hidden;">
      
      <div style="padding:40px 20px 20px 20px; text-align:center;">
        <img src="https://i.ibb.co/Tqkv02xJ/photo-2026-03-12-14-56-38.jpg" 
             alt="OrgaSmart Logo" 
             style="width:180px; max-width:100%; height:auto;">
      </div>

      <div style="padding:20px; text-align:center; color:#1a1a1a;">
        <h1 style="margin:0; font-size:26px; font-weight:700;">Welcome to OrgaSmart! 🚀</h1>
        <p style="margin-top:10px; font-size:15px; color:#666;">
            We’re absolutely thrilled to have you join OrgaSmart.
        </p>
      </div>

      <div style="padding:30px 40px; color:#333; line-height:1.7;">
        <p style="font-size:16px; margin-bottom:20px;">Hello <strong>${userName}</strong> 👋</p>
        
        <p style="font-size:15px; color:#555;">
          Our mission is to help you stay organized and productive, and we're here to support you every step of the way as you explore what we've built for you.
        </p>

        <div style="background-color:#f9f9fb; border-left: 4px solid #4F46E5; border-radius:4px; padding:20px; margin:30px 0; font-style: italic;">
          <p style="margin:0; color:#555; font-size:14px;">
            "Organization is the foundation of greatness. Let’s build something great together."
          </p>
        </div>

        <p style="font-size:15px; color:#555;">
          Your account is ready. Use the temporary credentials below to access your workspace:
        </p>

        <div style="background-color:#f4f7ff; border-radius:10px; padding:30px; text-align:center; margin-top:35px; margin-bottom:10px;">
          <span style="display:block; font-size:12px; color:#888; letter-spacing:1px; margin-bottom:10px; font-weight:600; text-transform:uppercase;">Temporary Password</span>
          <span style="font-size:24px; font-weight:bold; color:#4F46E5; font-family: 'Segoe UI', sans-serif;">
            ${password}
          </span>
        </div>

        <p style="margin-bottom:35px; font-size:13px; color:#d93025; text-align:center; font-weight: 500;">
          ⚠️ Please change your password after your first login for security reasons.
        </p>


        <p style="margin-top:40px; font-size:14px; color:#555; text-align:left;">
          If you ever have questions, feedback, or just want to say hi, simply hit <b>reply</b> to this email. We read every single message.
        </p>

        <p style="margin-top:20px; font-size:14px; color:#333;">
          Best regards,<br>
          <strong>The OrgaSmart Team</strong>
        </p>
      </div>

      <div style="padding:30px 20px; text-align:center; font-size:11px; color:#aaa; border-top:1px solid #f9f9f9;">
        © ${new Date().getFullYear()} OrgaSmart<br>
        Smart Meeting Management Platform
      </div>
    </div>
  </div>
  `;

  const mailOptions = {
    from: `"${process.env.FROM_NAME}" <${process.env.FROM_EMAIL}>`,
    to: userEmail,
    subject: `Welcome to OrgaSmart, ${userName}! ✨`,
    html: htmlContent,
    text: `Hello ${userName}, welcome to OrgaSmart! Password: ${password}`,
  };

  try {
    const info = await transporter.sendMail(mailOptions);
    console.log(
      `[Email Service] ✅ Success: Welcome email sent to ${userEmail}`,
    );
    return { success: true };
  } catch (error) {
    console.error(`[Email Service] ❌ Error:`, error.message);
    return { success: false, error: error.message };
  }
};

/**
 * @param {string} userEmail
 * @param {string} otpCode
 */
//messaoud update here
const sendPasswordResetEmail = async (userEmail, otpCode) => {
  const htmlContent = `
    <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; max-width: 500px; margin: auto; border: 1px solid #eee; padding: 30px; border-radius: 15px; text-align: center;">
      <h2 style="color: #2c3e50;">Password Reset Request</h2>
      <p style="color: #7f8c8d; font-size: 16px;">Use the verification code below to reset your password. This code is valid for <strong>1 hour</strong>.</p>
      
      <div style="margin: 30px 0;">
        <div style="background-color: #f4f7f6; display: inline-block; padding: 15px 30px; border-radius: 10px; border: 1px solid #e0e0e0;">
          <span style="font-size: 32px; font-weight: bold; letter-spacing: 8px; color: #3498db;">${otpCode}</span>
        </div>
      </div>

      <p style="color: #e74c3c; font-size: 0.85em;">If you didn't request this, please ignore this email or contact support if you have concerns.</p>
      
      <hr style="border: 0; border-top: 1px solid #f0f0f0; margin: 30px 0;">
      <p style="font-size: 0.8em; color: #bdc3c7;">
        © ${new Date().getFullYear()} OrgaSmart Security Team
      </p>
    </div>
  `;

  const mailOptions = {
    from: `"${process.env.FROM_NAME}" <${process.env.FROM_EMAIL}>`,
    to: userEmail,
    subject: `Your Password Reset Code: ${otpCode}`,
    html: htmlContent,
    text: `Your password reset code is: ${otpCode}. It expires in 1 hour.`,
  };

  try {
    const info = await transporter.sendMail(mailOptions);
    console.log(`[Auth Service] 🔑 OTP sent to: ${userEmail}`);
    return { success: true };
  } catch (error) {
    console.error(
      `[Auth Service] ❌ Failed to send OTP to ${userEmail}:`,
      error.message,
    );
    return { success: false, error: error.message };
  }
};

const sendMeetingInvitation = async (
  userEmail,
  title,
  date,
  time,
  location,
  resume,
  managerName,
) => {
  const isVirtual =
    location && typeof location === "string" && location.startsWith("http");

  const mailOptions = {
    from: `"${process.env.FROM_NAME}" <${process.env.FROM_EMAIL}>`,
    to: userEmail,
    subject: `📩 Invitation: ${title}`,
    html: `
      <div style="font-family: Arial, sans-serif; border: 1px solid #eee; padding: 20px; border-radius: 10px; direction: ltr;">
        <h2 style="color: #2c3e50; text-align: center;">📅 New Meeting Invitation</h2>
        <p>Hello, you have been invited to a meeting by <b>👤 ${managerName}</b>.</p>
        <hr style="border: 0; border-top: 1px solid #eee;">
        <p><b>📌 Title:</b> ${title}</p>
        <p><b>📅 Date:</b> ${date}</p>
        <p><b>⏰ Time:</b> ${time}</p>
        <p><b>${isVirtual ? "🌐 Meeting Link" : "🏢 Room"}:</b> 
          ${isVirtual ? `<a href="${location}">${location}</a>` : location}
        </p>
        <p><b>📝 Agenda:</b> ${resume || "No agenda provided."}</p>
        <hr style="border: 0; border-top: 1px solid #eee;">
        <p style="text-align: center; color: #7f8c8d;">Please make sure to attend on time! 👋</p>
      </div>
    `,
  };

  try {
    const info = await transporter.sendMail(mailOptions);
    console.log(`✅ Meeting email sent to ${userEmail}: ${info.messageId}`);
    return info;
  } catch (error) {
    console.error(
      `❌ Error sending meeting email to ${userEmail}:`,
      error.message,
    );
    throw error;
  }
};
const sendMeetingUpdate = async (
  userEmail,
  title,
  date,
  time,
  location,
  resume,
) => {
  const isVirtual =
    location && typeof location === "string" && location.startsWith("http");

  const mailOptions = {
    from: `"${process.env.FROM_NAME}" <${process.env.FROM_EMAIL}>`,
    to: userEmail,
    subject: `🔄 Updated: ${title}`,
    html: `
            <div style="font-family: Arial, sans-serif; border: 1px solid #eee; padding: 20px; border-radius: 10px; max-width: 600px;">
                <h2 style="color: #e67e22; text-align: center;">📝 Meeting Details Updated</h2>
                <p>The details for the meeting "<b>${title}</b>" have changed.</p>
                <hr style="border: 0; border-top: 1px solid #eee;">
                <p><b>🗓️ New Date:</b> ${date}</p>
                <p><b>⏰ New Time:</b> ${time}</p>
                <p><b>${isVirtual ? "🌐 New Link" : "🏢 New Room"}:</b> ${isVirtual ? `<a href="${location}">${location}</a>` : location}</p>
                <p><b>📝 Agenda:</b> ${resume}</p>
                <hr style="border: 0; border-top: 1px solid #eee;">
                <p style="text-align: center; color: #7f8c8d;">Please update your schedule. ✅</p>
            </div>
        `,
  };
  return await transporter.sendMail(mailOptions);
};

const sendMeetingCancel = async (userEmail, title, date, time) => {
  const mailOptions = {
    from: `"${process.env.FROM_NAME}" <${process.env.FROM_EMAIL}>`,
    to: userEmail,
    subject: `❌ Cancelled: ${title}`,
    html: `
            <div style="font-family: Arial, sans-serif; border: 1px solid #eee; padding: 20px; border-radius: 10px; max-width: 600px;">
                <h2 style="color: #c0392b; text-align: center;">🚫 Meeting Cancelled</h2>
                <p>The meeting "<b>${title}</b>" scheduled for 🗓️ ${date} at ⏰ ${time} has been <b>cancelled</b>.</p>
                <hr style="border: 0; border-top: 1px solid #eee;">
                <p style="text-align: center; color: #7f8c8d;">We apologize for the inconvenience. 🙏</p>
            </div>
        `,
  };
  return await transporter.sendMail(mailOptions);
};
// تحديث التصدير ليشمل الدالة الجديدة
module.exports = {
  sendWelcomeEmail,
  sendPasswordResetEmail,
  sendMeetingInvitation,
  sendMeetingUpdate,
  sendMeetingCancel,
};
