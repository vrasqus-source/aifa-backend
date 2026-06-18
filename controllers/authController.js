
import jwt from 'jsonwebtoken';
import User from '../models/User.js';
import bcrypt from 'bcryptjs';
import { OAuth2Client } from 'google-auth-library';
import nodemailer from 'nodemailer';
import PlatformConfig from '../models/PlatformConfig.js';

const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

async function getConfig(key) {
  try {
    const c = await PlatformConfig.findOne({ key }).lean();
    return (c && c.value) ? c.value : process.env[key] || "";
  } catch { return process.env[key] || ""; }
}

// Helper to create JWT
const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: '7d' });
};

// --- REGISTER ---
export const register = async (req, res) => {
  const { name, email, phone, password } = req.body;
  try {
    const userExists = await User.findOne({ email });
    if (userExists) return res.status(400).json({ message: 'User already exists' });

    const user = await User.create({ name, email, phone, password });
    if (user) {
      res.status(201).json({
        _id: user._id,
        name: user.name,
        role: user.role,
        token: generateToken(user._id),
      });
    }
  } catch (error) {
    res.status(500).json({ message: error.message || 'Server error' });
  }
};

// --- LOGIN (EMAIL/PASSWORD) ---
export const login = async (req, res) => {
  const { email, password } = req.body;
  try {
    const user = await User.findOne({ email });
    if (user && (await bcrypt.compare(password, user.password))) {
      res.json({
        _id: user._id,
        name: user.name,
        role: user.role,
        token: generateToken(user._id),
      });
    } else {
      res.status(401).json({ message: 'Invalid email or password' });
    }
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

// --- GOOGLE LOGIN ---


export const googleLogin = async (req, res) => {
  const { token } = req.body; // This is the access_token from React

  try {
    // 1. Fetch user info from Google's UserInfo API using the access_token
    const googleRes = await fetch(`https://www.googleapis.com/oauth2/v3/userinfo?access_token=${token}`);
    const payload = await googleRes.json();

    if (!payload.email) {
      return res.status(401).json({ message: "Invalid Google Token" });
    }

    const { email, name, picture } = payload;

    // 2. Find or Create User in MongoDB
    let user = await User.findOne({ email });

    if (!user) {
      user = await User.create({
        name,
        email,
        profilePicture: picture,
        isGoogleUser: true,
        // Create a random password since it's required in some schemas
        password: await bcrypt.hash(Math.random().toString(36), 10) 
      });
    }

    // 3. Generate YOUR AIFA JWT
    const appToken = jwt.sign(
      { id: user._id, email: user.email },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );

    res.status(200).json({
      token: appToken,
      _id: user._id,
      name: user.name,
      role: user.role,
      message: "Login Successful"
    });

  } catch (error) {
    console.error("Google Auth Error:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};
// --- FORGOT PASSWORD ---
export const forgotPassword = async (req, res) => {
  const { email } = req.body;
  try {
    const user = await User.findOne({ email });
    if (!user) return res.status(404).json({ message: 'User not found' });

    const resetToken = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: '1h' });
    const resetLink = `${process.env.FRONTEND_URL || 'http://localhost:5174'}/reset-password?token=${resetToken}`;

    const emailUser = await getConfig("EMAIL_USER");
    const emailPass = await getConfig("EMAIL_PASS");
    const fromName  = await getConfig("EMAIL_FROM_NAME") || "AIFA Film Academy";

    const emailConfigured = emailUser && emailPass &&
      !emailUser.includes('your_gmail') && !emailPass.includes('your_gmail');

    if (emailConfigured) {
      const transporter = nodemailer.createTransport({
        service: process.env.EMAIL_SERVICE || 'gmail',
        auth: { user: emailUser, pass: emailPass },
      });
      await transporter.sendMail({
        from: `"${fromName}" <${emailUser}>`,
        to: email,
        subject: 'Reset your AIFA password',
        html: `
          <div style="font-family:sans-serif;max-width:480px;margin:0 auto">
            <h2 style="color:#C7E36B">Reset Your Password</h2>
            <p>Hi ${user.name}, click the link below to reset your password. It expires in 1 hour.</p>
            <a href="${resetLink}" style="display:inline-block;padding:12px 24px;background:#C7E36B;color:#000;border-radius:6px;font-weight:bold;text-decoration:none">Reset Password</a>
            <p style="color:#888;font-size:12px;margin-top:24px">If you didn't request this, ignore this email.</p>
          </div>
        `,
      });
    } else {
      console.log(`[DEV] Password reset link for ${email}: ${resetLink}`);
    }

    res.json({ message: 'Password reset link sent to your email', resetLink: process.env.NODE_ENV !== 'production' ? resetLink : undefined });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

// --- RESET PASSWORD ---
export const resetPassword = async (req, res) => {
  const { token, password } = req.body;
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.id);
    if (!user) return res.status(404).json({ message: 'User not found' });
    user.password = password;
    await user.save();
    res.json({ message: 'Password reset successful' });
  } catch {
    res.status(400).json({ message: 'Invalid or expired reset token' });
  }
};
