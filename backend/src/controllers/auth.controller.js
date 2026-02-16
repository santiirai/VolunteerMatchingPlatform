import { prisma } from '../libs/prisma.js';
import { generateToken } from '../utils/jwt.util.js';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

/**
 * User Signup Controller
 */
export const signup = async (req, res) => {
  try {
    console.log('[Auth Controller] Signup request received');
    const { name, email, password, role, skills, location } = req.body;

    // Validation
    if (!name || !email || !password) {
      console.log('[Auth Controller] Missing required fields');
      return res.status(400).json({
        success: false,
        message: 'Name, email, and password are required'
      });
    }

    // Check if user already exists
    console.log('[Auth Controller] Checking if user exists:', email);
    const existingUser = await prisma.user.findUnique({
      where: { email: email.trim() }
    });

    if (existingUser) {
      console.log('[Auth Controller] User already exists:', email);
      return res.status(409).json({
        success: false,
        message: 'User with this email already exists'
      });
    }

    // Hash password
    console.log('[Auth Controller] Hashing password for new user:', email);
    const hashed = await bcrypt.hash(password, 10);

    console.log('[Auth Controller] Creating new user:', email);
    const user = await prisma.user.create({
      data: {
        name,
        email: email.trim(),
        password: hashed,
        role: role || 'VOLUNTEER',
        skills,
        location
      }
    });

    console.log('[Auth Controller] User created successfully:', user.id);

    // Generate token
    const token = generateToken({ id: user.id, email: user.email });

    // Return user data (excluding password)
    const userResponse = {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      createdAt: user.createdAt
    };

    console.log('[Auth Controller] Signup successful for:', email);
    res.status(201).json({
      success: true,
      message: 'User created successfully',
      data: {
        user: userResponse,
        token
      }
    });
  } catch (error) {
    console.error('[Auth Controller] Signup error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message
    });
  }
};

/**
 * User Login Controller
 */
export const login = async (req, res) => {
  try {
    console.log('[Auth Controller] Login request received');
    const { email, password } = req.body;

    // Validation
    if (!email || !password) {
      console.log('[Auth Controller] Missing email or password');
      return res.status(400).json({
        success: false,
        message: 'Email and password are required'
      });
    }

    // Find user
    console.log('[Auth Controller] Searching for user:', email);
    const user = await prisma.user.findUnique({
      where: { email: email.trim() }
    });

    if (!user) {
      console.log('[Auth Controller] User not found:', email);
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password'
      });
    }

    // Verify password with bcrypt, and migrate legacy plaintext if needed
    console.log('[Auth Controller] Verifying password');
    let valid = false;
    try {
      valid = await bcrypt.compare(password, user.password);
    } catch (e) {
      valid = false;
    }
    if (!valid) {
      if (user.password === password) {
        console.log('[Auth Controller] Legacy plaintext password detected, migrating to hashed');
        const newHash = await bcrypt.hash(password, 10);
        await prisma.user.update({
          where: { id: user.id },
          data: { password: newHash }
        });
        valid = true;
      }
    }
    if (!valid) {
      console.log('[Auth Controller] Invalid password for user:', email);
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password'
      });
    }

    // Generate token
    const token = generateToken({ id: user.id, email: user.email });

    // Return user data (excluding password)
    const userResponse = {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      createdAt: user.createdAt
    };

    console.log('[Auth Controller] Login successful for:', email);
    res.status(200).json({
      success: true,
      message: 'Login successful',
      data: {
        user: userResponse,
        token
      }
    });
  } catch (error) {
    console.error('[Auth Controller] Login error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message
    });
  }
};

/**
 * Get current user (protected route)
 */
export const getCurrentUser = async (req, res) => {
  try {
    console.log('[Auth Controller] Get current user request');
    const userId = req.user.id;

    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        skills: true,
        location: true,
        createdAt: true,
        updatedAt: true
      }
    });

    if (!user) {
      console.log('[Auth Controller] User not found:', userId);
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    console.log('[Auth Controller] Current user retrieved:', user.email);
    res.status(200).json({
      success: true,
      data: { user }
    });
  } catch (error) {
    console.error('[Auth Controller] Get current user error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message
    });
  }
};

/**
 * Forgot Password - issue a reset token
 */
export const forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) {
      return res.status(400).json({ success: false, message: 'Email is required' });
    }
    const user = await prisma.user.findUnique({ where: { email: email.trim() } });
    if (!user) {
      return res.status(200).json({ success: true, message: 'If the email exists, a reset has been issued' });
    }
    const token = jwt.sign({ id: user.id, email: user.email, purpose: 'password_reset' }, process.env.JWT_SECRET || 'your-secret-key-change-in-production', { expiresIn: '30m' });
    res.status(200).json({
      success: true,
      message: 'Password reset token generated',
      data: { resetToken: token, expiresInMinutes: 30 }
    });
  } catch (error) {
    console.error('[Auth Controller] Forgot password error:', error);
    res.status(500).json({ success: false, message: 'Internal server error', error: error.message });
  }
};

/**
 * Reset Password - use token to set new password
 */
export const resetPassword = async (req, res) => {
  try {
    const { token, password } = req.body;
    if (!token || !password) {
      return res.status(400).json({ success: false, message: 'Token and new password are required' });
    }
    let decoded;
    try {
      decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key-change-in-production');
    } catch (e) {
      return res.status(400).json({ success: false, message: 'Invalid or expired token' });
    }
    if (decoded.purpose !== 'password_reset') {
      return res.status(400).json({ success: false, message: 'Invalid token purpose' });
    }
    const hashed = await bcrypt.hash(password, 10);
    await prisma.user.update({
      where: { id: decoded.id },
      data: { password: hashed }
    });
    res.status(200).json({ success: true, message: 'Password reset successful' });
  } catch (error) {
    console.error('[Auth Controller] Reset password error:', error);
    res.status(500).json({ success: false, message: 'Internal server error', error: error.message });
  }
};

/**
 * Change Password - authenticated users
 */
export const changePassword = async (req, res) => {
  try {
    const userId = req.user.id;
    const { currentPassword, newPassword } = req.body;
    if (!currentPassword || !newPassword) {
      return res.status(400).json({ success: false, message: 'Current and new passwords are required' });
    }

    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    let valid = false;
    try {
      valid = await bcrypt.compare(currentPassword, user.password);
    } catch (e) {
      valid = false;
    }
    if (!valid && user.password === currentPassword) {
      valid = true;
    }
    if (!valid) {
      return res.status(401).json({ success: false, message: 'Current password is incorrect' });
    }

    const hashed = await bcrypt.hash(newPassword, 10);
    await prisma.user.update({
      where: { id: userId },
      data: { password: hashed }
    });

    res.status(200).json({ success: true, message: 'Password changed successfully' });
  } catch (error) {
    console.error('[Auth Controller] Change password error:', error);
    res.status(500).json({ success: false, message: 'Internal server error', error: error.message });
  }
};

