import User from '../models/userModel';

export const autoSeedAdmin = async () => {
  try {
    const adminExists = await User.findOne({ email: 'admin@trawell.com' }).select('+password');
    if (!adminExists) {
      await User.create({
        name: 'System Administrator',
        email: 'admin@trawell.com',
        role: 'admin',
        password: 'admin123456',
        passwordConfirm: 'admin123456',
        active: true
      });
      console.log('👑 Default Admin Account seeded: admin@trawell.com / admin123456');
    } else {
      let isValidPassword = false;
      if (adminExists.password) {
        isValidPassword = await adminExists.correctPassword('admin123456', adminExists.password);
      }
      if (!isValidPassword || adminExists.role !== 'admin') {
        adminExists.role = 'admin';
        adminExists.password = 'admin123456';
        adminExists.passwordConfirm = 'admin123456';
        await adminExists.save();
        console.log('👑 Default Admin Account re-synchronized: admin@trawell.com / admin123456');
      }
    }
  } catch (err: any) {
    console.error('Failed to seed admin account:', err.message);
  }
};

