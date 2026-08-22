import { Request, Response, NextFunction } from 'express';
import jwt, { Secret, SignOptions } from 'jsonwebtoken';
import User from '../models/userModel';

// Helper function to generate a JWT token using the user's unique database ID
const signToken = (id: string): string => {
  const secret: Secret = process.env.JWT_SECRET as string;
  
  const options: SignOptions = {
    expiresIn: process.env.JWT_EXPIRES_IN as any // 'any' bypasses the strict string/number format check
  };

  return jwt.sign({ id }, secret, options);
};

// 🔐 SIGN UP: Register a brand new user
export const signup = async (req: Request, res: Response): Promise<void> => {
  try {
    const role = req.body.role || 'user';
    const newUser = await User.create({
      name: req.body.name,
      email: req.body.email,
      password: req.body.password,
      passwordConfirm: req.body.passwordConfirm,
      role: role,
      agencyStatus: role === 'agency' ? 'pending' : undefined,
      licenseNumber: req.body.licenseNumber,
      phone: req.body.phone,
      address: req.body.address,
      website: req.body.website,
      govIdDoc: req.body.govIdDoc,
      licenseDoc: req.body.licenseDoc
    });

    const token = signToken(`${newUser._id}`);

    // Remove the password field from the output response for extra safety
    (newUser.password as any) = undefined;

    res.status(201).json({
      status: 'success',
      token,
      data: {
        user: newUser
      }
    });
  } catch (err: any) {
    res.status(400).json({
      status: 'fail',
      message: err.message
    });
  }
};

// 🔓 LOGIN: Authenticate an existing user
export const login = async (req: Request, res: Response): Promise<void> => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      res.status(400).json({
        status: 'fail',
        message: 'Please provide email and password!'
      });
      return;
    }

    // Explicitly select password since it's hidden by default in our model
    const user = await User.findOne({ email }).select('+password');

    if (!user || !(await user.correctPassword(password, user.password))) {
      res.status(401).json({
        status: 'fail',
        message: 'Incorrect email or password'
      });
      return;
    }

    // Check agency approval status if role is agency
    if (user.role === 'agency') {
      const status = user.agencyStatus || 'pending';
      if (status === 'pending') {
        res.status(403).json({
          status: 'fail',
          message: 'Your agency account is pending administrator approval. You cannot log in until an administrator approves your profile.'
        });
        return;
      }
      if (status === 'rejected') {
        res.status(403).json({
          status: 'fail',
          message: 'Your agency registration application was declined by the administrator. Login access is disabled.'
        });
        return;
      }
    }

    const token = signToken(`${user._id}`);

    (user.password as any) = undefined;

    res.status(200).json({
      status: 'success',
      token,
      data: {
        user
      }
    });
  } catch (err: any) {
    res.status(400).json({
      status: 'fail',
      message: err.message
    });
  }
};

// 🛡️ PROTECT: Middleware to ensure a user is logged in before accessing a route
export const protect = async (req: any, res: Response, next: NextFunction): Promise<void> => {
  try {
    let token;

    // 1. Get the token from the request headers
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
      token = req.headers.authorization.split(' ')[1];
    }

    // 2. Check if the token actually exists
    if (!token) {
      res.status(401).json({
        status: 'fail',
        message: 'You are not logged in! Please log in to get access.'
      });
      return;
    }

    // 3. Verify the token
    const decoded = jwt.verify(token, process.env.JWT_SECRET as string) as { id: string };

    // 4. Check if the user still exists in the database
    const currentUser = await User.findById(decoded.id);
    if (!currentUser) {
      res.status(401).json({
        status: 'fail',
        message: 'The user belonging to this token no longer exists.'
      });
      return;
    }

    // 5. Grant access to the protected route by attaching the user to the request object
    req.user = currentUser;
    next();
  } catch (err: any) {
    // 🔍 This console.log will print the exact internal error to your VS Code terminal!
    console.error("🔒 Auth Protection Error:", err.message);

    res.status(401).json({
      status: 'fail',
      message: `Authentication failed: ${err.message}`
    });
  }
};

// 👤 UPDATE ME: Update logged-in user's name and email
export const updateMe = async (req: any, res: Response): Promise<void> => {
  try {
    // Filter out disallowed fields
    const filteredBody: any = {};
    if (req.body.name) filteredBody.name = req.body.name;
    if (req.body.email) filteredBody.email = req.body.email;

    const updatedUser = await User.findByIdAndUpdate(req.user.id, filteredBody, {
      new: true,
      runValidators: true
    });

    res.status(200).json({
      status: 'success',
      data: { user: updatedUser }
    });
  } catch (err: any) {
    res.status(400).json({ status: 'fail', message: err.message });
  }
};

// 🔑 UPDATE MY PASSWORD: Change password for currently logged in user
export const updateMyPassword = async (req: any, res: Response): Promise<void> => {
  try {
    const user = await User.findById(req.user.id).select('+password');

    if (!user) {
      res.status(404).json({ status: 'fail', message: 'User not found.' });
      return;
    }

    if (!(await user.correctPassword(req.body.passwordCurrent, user.password))) {
      res.status(401).json({ status: 'fail', message: 'Your current password is wrong.' });
      return;
    }

    user.password = req.body.password;
    user.passwordConfirm = req.body.passwordConfirm;
    await user.save();

    // Issue a new token
    const secret: import('jsonwebtoken').Secret = process.env.JWT_SECRET as string;
    const token = jwt.sign({ id: user._id }, secret, {
      expiresIn: process.env.JWT_EXPIRES_IN as any
    });

    res.status(200).json({
      status: 'success',
      token
    });
  } catch (err: any) {
    res.status(400).json({ status: 'fail', message: err.message });
  }
};

// ⛔ RESTRICT TO: Middleware to authorize specific user roles
export const restrictTo = (...roles: string[]) => {
  return (req: any, res: Response, next: NextFunction): void => {
    if (!roles.includes(req.user.role)) {
      res.status(403).json({
        status: 'fail',
        message: 'You do not have permission to perform this action.'
      });
      return;
    }
    next();
  };
};