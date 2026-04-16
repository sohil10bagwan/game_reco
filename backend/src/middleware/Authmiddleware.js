import jwt from 'jsonwebtoken';
import User from '../models/User.js';

const protect = async (req, res, next) => {
  let token;

  // Check if token exists in header
  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    token = req.headers.authorization.split(' ')[1];
  }

  // If no token provided
  if (!token) {
    return res.status(401).json({ 
      success: false, 
      message: 'Not authorized, no token provided',
      errorCode: 'NO_TOKEN'
    });
  }

  try {
    // Verify token format
    if (!token || typeof token !== 'string') {
      return res.status(401).json({ 
        success: false, 
        message: 'Invalid token format',
        errorCode: 'INVALID_TOKEN_FORMAT'
      });
    }

    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    // Check if decoded token has valid structure
    if (!decoded || !decoded.id) {
      return res.status(401).json({ 
        success: false, 
        message: 'Invalid token payload',
        errorCode: 'INVALID_TOKEN_PAYLOAD'
      });
    }

    // Find user and exclude password
    const user = await User.findById(decoded.id).select('-password');
    
    if (!user) {
      return res.status(401).json({ 
        success: false, 
        message: 'User not found',
        errorCode: 'USER_NOT_FOUND'
      });
    }

    // Check if user account is active
    if (user.status === 'inactive') {
      return res.status(401).json({ 
        success: false, 
        message: 'Account is inactive',
        errorCode: 'ACCOUNT_INACTIVE'
      });
    }

    // Attach user to request object
    req.user = user;
    
    next();
  } catch (error) {
    // Handle specific JWT errors
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({ 
        success: false, 
        message: 'Token has expired',
        errorCode: 'TOKEN_EXPIRED'
      });
    }
    
    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({ 
        success: false, 
        message: 'Invalid token',
        errorCode: 'INVALID_TOKEN'
      });
    }
    
    // Handle other errors
    return res.status(401).json({ 
      success: false, 
      message: 'Not authorized, token invalid',
      errorCode: 'AUTH_FAILED'
    });
  }
};

const adminOnly = (req, res, next) => {
  // Check if user is authenticated
  if (!req.user) {
    return res.status(401).json({ 
      success: false, 
      message: 'Authentication required',
      errorCode: 'AUTH_REQUIRED'
    });
  }

  // Check if user has admin role
  if (req.user.role !== 'admin') {
    return res.status(403).json({ 
      success: false, 
      message: 'Admin access required',
      errorCode: 'INSUFFICIENT_PERMISSIONS'
    });
  }

  next();
};

// Optional authentication middleware
const optionalAuth = async (req, res, next) => {
  try {
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
      const token = req.headers.authorization.split(' ')[1];
      
      if (token) {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const user = await User.findById(decoded.id).select('-password');
        if (user) {
          req.user = user;
        }
      }
    }
  } catch (error) {
    // Silently fail for optional auth
  }
  next();
};

export { protect, adminOnly, optionalAuth };