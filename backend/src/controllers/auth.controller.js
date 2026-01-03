import { prisma } from '../libs/prisma.js';
import { generateToken } from '../utils/jwt.util.js';

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
      where: { email }
    });

    if (existingUser) {
      console.log('[Auth Controller] User already exists:', email);
      return res.status(409).json({
        success: false,
        message: 'User with this email already exists'
      });
    }

    // Create user (password stored as plain text as requested)
    console.log('[Auth Controller] Creating new user:', email);
    const user = await prisma.user.create({
      data: {
        name,
        email,
        password, // Plain text password as requested
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
      where: { email }
    });

    if (!user) {
      console.log('[Auth Controller] User not found:', email);
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password'
      });
    }

    // Check password (plain text comparison as requested)
    console.log('[Auth Controller] Verifying password');
    if (user.password !== password) {
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


