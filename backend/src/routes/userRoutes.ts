import { Router } from 'express';
import { signup, login, protect, restrictTo, updateMe, updateMyPassword } from '../controllers/authController';
import { getAllUsers, getUser, updateUser, deleteUser, makeMeAdmin } from '../controllers/userController';

const router = Router();

// Public Routes
router.post('/signup', signup);
router.post('/login', login);

// Protected User Routes (Logged in user)
router.use(protect);
router.patch('/me', updateMe);
router.patch('/updateMyPassword', updateMyPassword);
router.post('/make-me-admin', makeMeAdmin);

// Restricted Admin Routes
router.use(restrictTo('admin'));
router.route('/')
  .get(getAllUsers);

router.route('/:id')
  .get(getUser)
  .patch(updateUser)
  .delete(deleteUser);

export default router;