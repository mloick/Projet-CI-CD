import { Router } from 'express';
import { UserController } from '../controllers/UserController';
import { UserService } from '../services/UserService';
import { SQLiteUserRepository } from '../repositories/SQLiteUserRepository';
import { validateRequest } from '../middlewares/validateRequest';

const router = Router();
const userRepository = new SQLiteUserRepository();
const userService = new UserService(userRepository);
const userController = new UserController(userService);

router.post(
  '/',
  validateRequest(['age', 'weight', 'height', 'gender', 'activityLevel', 'goal']),
  userController.create
);
router.get('/:id', userController.getById);
router.put('/:id', userController.update);

export default router;
