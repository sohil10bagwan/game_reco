import jwt from 'jsonwebtoken';
import User from '../models/User.js';
import { userValidationRules, validate } from '../middleware/validationMiddleware.js';

// Generate JWT Token
const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: '1d' });
};

// @desc   Register new user
// @route  POST /api/auth/register
// @access Public
const register = async (req, res, next) => {
  try {
    // Apply validation middleware
    await Promise.all(userValidationRules.register.map(rule => rule.run(req)));
    const validationError = validate(req, res, () => {});
    if (validationError && validationError.statusCode === 400) {
      return validationError;
    }

    const { name, email, password, role } = req.body;

    // Check if user already exists
    const normalizedEmail = email.toLowerCase().trim();
    const userExists = await User.findOne({ email: normalizedEmail });
    if (userExists) {
      return res.status(409).json({ 
        success: false, 
        message: 'Email already registered',
        errorCode: 'EMAIL_EXISTS'
      });
    }

    // Validate role properly
    const validRoles = ['user', 'admin'];
    const normalizedRole = role && validRoles.includes(role.toLowerCase()) ? role.toLowerCase() : 'user';
    
    // Create user
    const user = await User.create({ 
      name: name.trim(), 
      email: normalizedEmail, 
      password, 
      role: normalizedRole 
    });

    // Auto-login after successful registration by returning JWT
    res.status(201).json({
      success: true,
      message: 'Account created and logged in successfully',
      data: {
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        token: generateToken(user._id),
      },
    });
  } catch (error) {
    // Handle mongoose validation errors
    if (error.name === 'ValidationError') {
      const errors = Object.values(error.errors).map(err => ({
        field: err.path,
        message: err.message
      }));
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors
      });
    }
    
    // Handle duplicate key errors
    if (error.code === 11000) {
      const field = Object.keys(error.keyPattern)[0];
      return res.status(409).json({
        success: false,
        message: `${field} already exists`,
        errorCode: 'DUPLICATE_KEY'
      });
    }
    
    next(error);
  }
};

// @desc   Login user
// @route  POST /api/auth/login
// @access Public
const login = async (req, res, next) => {
  try {
    // Apply validation middleware
    await Promise.all(userValidationRules.login.map(rule => rule.run(req)));
    const validationError = validate(req, res, () => {});
    if (validationError && validationError.statusCode === 400) {
      return validationError;
    }

    const { email, password } = req.body;

    // Find user and include password for comparison
    const user = await User.findOne({ email: email.toLowerCase().trim() }).select('+password');
    
    // Check if user exists and password is correct
    if (!user || !(await user.matchPassword(password))) {
      return res.status(401).json({ 
        success: false, 
        message: 'Invalid email or password',
        errorCode: 'INVALID_CREDENTIALS'
      });
    }

    res.json({
      success: true,
      message: 'Login successful',
      data: {
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        token: generateToken(user._id),
      },
    });
  } catch (error) {
    next(error);
  }
};

// @desc   Get logged in user profile
// @route  GET /api/auth/profile
// @access Private
const getProfile = async (req, res, next) => {
  try {
    // User is already attached by auth middleware
    const user = await User.findById(req.user._id);
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found',
        errorCode: 'USER_NOT_FOUND'
      });
    }

    res.json({
      success: true,
      data: {
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        createdAt: user.createdAt,
      },
    });
  } catch (error) {
    next(error);
  }
};

export { register, login, getProfile };