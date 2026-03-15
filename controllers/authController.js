const db = require("../config/db");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const { sendWelcomeEmail, sendPasswordResetEmail } = require("../mailer");
const crypto = require("crypto");
// Register

// create password
const generateRandomPassword = (length = 8) => {
  const charset = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ"; // أضفت أرقاماً لزيادة القوة
  let password = "";
  while (password.length < length) {
    const byte = crypto.randomBytes(1)[0];
    if (byte < charset.length) {
      password += charset[byte];
    }
  }
  return password;
}; //

// Register
exports.register = async (req, res) => {
  const { name, email, role } = req.body;

  if (!name || !email || !role) {
    return res
      .status(400)
      .json({ success: false, message: "Name, email, and role are required" });
  }

  let connection;
  try {
    const rawPassword = generateRandomPassword(8); //
    const hashedPassword = await bcrypt.hash(rawPassword, 10); //
    connection = await db.getConnection();
    await connection.beginTransaction();
    const [userResult] = await connection.query(
      "INSERT INTO `User` (name, email, password, role) VALUES (?, ?, ?, ?)",
      [name, email, hashedPassword, role],
    ); //
    const userId = userResult.insertId;
    let roleSql = "";
    if (role === "Manager")
      roleSql = "INSERT INTO `Manager` (userId) VALUES (?)";
    else if (role === "Employee")
      roleSql = "INSERT INTO `Employee` (userId) VALUES (?)";
    else if (role === "Director")
      roleSql = "INSERT INTO `Director` (userId) VALUES (?)";
    else {
      await connection.rollback();
      connection.release();
      return res.status(400).json({ success: false, message: "Invalid role" });
    }
    await connection.query(roleSql, [userId]);

    await connection.commit();
    connection.release();
    res.status(201).json({
      success: true,
      message: "User registered successfully and password sent to email.",
    });

    sendWelcomeEmail(email, name, rawPassword)
      .then(() => console.log(`[Auth] ✅ Password sent to: ${email}`))
      .catch((err) => console.error("[Auth] ❌ Email error:", err.message));
  } catch (err) {
    console.error("❌ Register error:", err);
    if (connection) {
      await connection.rollback();
      connection.release();
    }

    if (err.code === "ER_DUP_ENTRY") {
      return res
        .status(400)
        .json({ success: false, message: "Email already exists" });
    }
    res.status(500).json({ success: false, message: "Server error" });
  }
};

// Login
exports.login = async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password)
    return res
      .status(400)
      .json({ success: false, message: "Email and password required" });
  try {
    const [rows] = await db.query("SELECT * FROM `User` WHERE email = ?", [
      email,
    ]);
    if (rows.length === 0)
      return res
        .status(401)
        .json({ success: false, message: "User not found" });
    const user = rows[0];
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch)
      return res
        .status(401)
        .json({ success: false, message: "Incorrect password" });

    const token = jwt.sign(
      { id: user.id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: "24h" },
    );
    res.json({
      success: true,
      token,
      user: { id: user.id, name: user.name, role: user.role },
    });
  } catch (err) {
    console.error("❌ Login error:", err);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

// Profile (protected)
exports.getProfile = (req, res) => {
  res.json({
    success: true,
    message: "Accessed protected profile",
    user: req.user,
  });
};

// Forgot password
exports.forgotPassword = async (req, res) => {
  const { email } = req.body;
  if (!email)
    return res.status(400).json({ success: false, message: "Email required" });

  try {
    const [users] = await db.query("SELECT id FROM `User` WHERE email = ?", [
      email,
    ]);
    if (users.length === 0)
      return res
        .status(200)
        .json({ success: true, message: "If email exists, reset link sent" });

    const resetCode = Math.floor(100000 + Math.random() * 900000).toString(); //messaoud update here
    const token = crypto.createHash("sha256").update(resetCode).digest("hex");
    const expiresAt = new Date(Date.now() + 3600000);
    const userId = users[0].id;

    await db.query("DELETE FROM PasswordReset WHERE userId = ?", [userId]);
    await db.query(
      "INSERT INTO PasswordReset (userId, token, expiresAt) VALUES (?, ?, ?)",
      [userId, token, expiresAt],
    );

    await sendPasswordResetEmail(email, resetCode);

    res.json({ success: true, message: "Password reset link sent" });
  } catch (err) {
    console.error("❌ Forgot password error:", err);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

// Reset password
exports.resetPassword = async (req, res) => {
  const { newPassword, resetCode } = req.body; //messaoud update here
  if (!resetCode || !newPassword)
    return res.status(400).json({ success: false, message: "Data missing" });
  if (newPassword.length < 8) {
    return res.status(400).json({
      success: false,
      message: "New password must be at least 8 characters long",
    });
  }
  const token = crypto.createHash("sha256").update(resetCode).digest("hex");
  try {
    const [rows] = await db.query(
      "SELECT * FROM PasswordReset WHERE token = ? AND expiresAt > NOW()",
      [token],
    );
    if (rows.length === 0)
      return res
        .status(400)
        .json({ success: false, message: "Invalid or expired token" });

    const hashedPassword = await bcrypt.hash(newPassword, 10);
    await db.query("UPDATE `User` SET password = ? WHERE id = ?", [
      hashedPassword,
      rows[0].userId,
    ]);
    await db.query("DELETE FROM PasswordReset WHERE token = ?", [token]);

    res.json({ success: true, message: "Password changed successfully" });
  } catch (err) {
    console.error("❌ Reset password error:", err);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

// Change password (logged-in user)
exports.changePassword = async (req, res) => {
  const userId = req.user.id;
  const { oldPassword, newPassword } = req.body;
  if (!oldPassword || !newPassword)
    return res
      .status(400)
      .json({ success: false, message: "Old and new passwords required" });
  if (newPassword.length < 8) {
    return res.status(400).json({
      success: false,
      message: "New password must be at least 8 characters long",
    });
  }

  try {
    const [rows] = await db.query("SELECT password FROM `User` WHERE id = ?", [
      userId,
    ]);
    if (rows.length === 0)
      return res
        .status(404)
        .json({ success: false, message: "User not found" });

    const isMatch = await bcrypt.compare(oldPassword, rows[0].password);
    if (!isMatch)
      return res
        .status(401)
        .json({ success: false, message: "Old password incorrect" });

    const hashedNew = await bcrypt.hash(newPassword, 10);
    await db.query("UPDATE `User` SET password = ? WHERE id = ?", [
      hashedNew,
      userId,
    ]);

    res.json({ success: true, message: "Password changed successfully" });
  } catch (err) {
    console.error("❌ Change password error:", err);
    res.status(500).json({ success: false, message: "Server error" });
  }
};
