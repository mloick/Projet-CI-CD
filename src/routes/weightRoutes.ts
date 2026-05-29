import { Router } from 'express';
import { WeightController } from '../controllers/WeightController';
import { WeightService } from '../services/WeightService';
import { InMemoryWeightRepository } from '../repositories/InMemoryWeightRepository';
import { validateRequest } from '../middlewares/validateRequest';

const router = Router();
const weightRepository = new InMemoryWeightRepository();
const weightService = new WeightService(weightRepository);
const weightController = new WeightController(weightService);

router.post('/', validateRequest(['userId', 'weight']), weightController.addEntry);
router.get('/:userId', weightController.getHistory);

export default router;
