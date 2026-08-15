import { Request, Response } from 'express';
import User from '../models/userModel';

// 👥 GET ALL USERS (Admin)
export const getAllUsers = async (req: Request, res: Response): Promise<void> => {
  try {
    const users = await User.find().select('-password');
    res.status(200).json({
      status: 'success',
      results: users.length,
      data: { users }
    });
  } catch (err: any) {
    res.status(500).json({ status: 'error', message: err.message });
  }
};

// 👤 GET ONE USER
export const getUser = async (req: Request, res: Response): Promise<void> => {
  try {
    const user = await User.findById(req.params.id).select('-password');
    if (!user) {
      res.status(404).json({ status: 'fail', message: 'No user found with that ID.' });
      return;
    }
    res.status(200).json({ status: 'success', data: { user } });
  } catch (err: any) {
    res.status(400).json({ status: 'fail', message: err.message });
  }
};

// ✏️ UPDATE USER (Admin can update role, name, email)
export const updateUser = async (req: Request, res: Response): Promise<void> => {
  try {
    const updatedUser = await User.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true
    }).select('-password');

    if (!updatedUser) {
      res.status(404).json({ status: 'fail', message: 'No user found with that ID.' });
      return;
    }

    res.status(200).json({ status: 'success', data: { user: updatedUser } });
  } catch (err: any) {
    res.status(400).json({ status: 'fail', message: err.message });
  }
};

// 🗑️ DELETE USER (Admin)
export const deleteUser = async (req: Request, res: Response): Promise<void> => {
  try {
    const user = await User.findByIdAndDelete(req.params.id);
    if (!user) {
      res.status(404).json({ status: 'fail', message: 'No user found with that ID.' });
      return;
    }
    res.status(204).json({ status: 'success', data: null });
  } catch (err: any) {
    res.status(400).json({ status: 'fail', message: err.message });
  }
};
