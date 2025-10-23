import crypto from "crypto";
import bcrypt from "bcryptjs";
import nodemailer from "nodemailer";
import User from "../models/User.js";

const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_SMTP_HOST,
  port: parseInt(process.env.EMAIL_SMTP_PORT),
  secure: parseInt(process.env.EMAIL_SMTP_PORT) === 465,
  auth: {
    user: process.env.EMAIL_SMTP_USER,
    pass: process.env.EMAIL_SMTP_PASS,
  },
});

// ✅ Step 1: Forgot Password
export const requestPasswordReset = async (req, res) => {
  const { email } = req.body;

  try {
    if (!email) return res.status(400).json({ error: "Email required" });

    const user = await User.findOne({ email: email.trim().toLowerCase() });
    if (!user) return res.status(404).json({ error: "User not found" });

    // Generate reset token
    const rawToken = crypto.randomBytes(20).toString("hex");
    const hashedToken = crypto.createHash("sha256").update(rawToken).digest("hex");

    user.resetPasswordToken = hashedToken;
    user.resetPasswordExpires = Date.now() + 15 * 60 * 1000;
    await user.save();

    const resetLink = `${process.env.CLIENT_URL}/reset-password/${rawToken}`;

    const mailOptions = {
      from: process.env.EMAIL_FROM,
      to: user.email,
      subject: "Password Reset Request",
      text: `Reset your password here: ${resetLink}\nThis link expires in 15 minutes.`,
      html: `
        <div style="font-family:sans-serif;padding:16px">
          <h2 style="color:#e11d48;">Reset Your Password</h2>
          <p>Hello ${user.name || "User"},</p>
          <p>Click below to reset your password:</p>
          <a href="${resetLink}" 
             style="background:#e11d48;color:white;padding:10px 20px;
                    border-radius:6px;text-decoration:none;">Reset Password</a>
          <p>This link expires in 15 minutes.</p>
        </div>
      `,
    };

    await transporter.sendMail(mailOptions);
    res.json({ message: "Password reset link sent to your email" });
  } catch (err) {
    console.error("❌ Error sending reset email:", err.message);
    res.status(500).json({ error: "Server error sending reset email" });
  }
};

// ✅ Step 2: Reset Password
export const resetPassword = async (req, res) => {
  const { token } = req.params;
  const { newPassword } = req.body;

  try {
    const hashedToken = crypto.createHash("sha256").update(token).digest("hex");
    const user = await User.findOne({
      resetPasswordToken: hashedToken,
      resetPasswordExpires: { $gt: Date.now() },
    });

    if (!user) return res.status(400).json({ error: "Invalid or expired reset link" });

    const hashed = await bcrypt.hash(newPassword, 10);
    user.password = hashed;
    user.resetPasswordToken = undefined;
    user.resetPasswordExpires = undefined;
    await user.save();

    res.json({ message: "Password reset successful! You can now log in." });
  } catch (err) {
    console.error("❌ Error resetting password:", err.message);
    res.status(500).json({ error: "Server error resetting password" });
  }
};
