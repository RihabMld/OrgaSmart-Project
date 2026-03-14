require("dotenv").config();
const sendWelcomeEmail = require("./mailer");

async function test() {
  try {
    await sendWelcomeEmail("miloudireehab@gmail.com", "Rihab", "Rihab678");
    console.log("✅ Test email sent successfully");
  } catch (error) {
    console.error("❌ Test failed:", error);
  }
}

test();
