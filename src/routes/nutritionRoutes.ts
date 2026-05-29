import { Router } from 'express';
import { NutritionController } from '../controllers/NutritionController';
import { NutritionService } from '../services/NutritionService';
import { SQLiteUserRepository } from '../repositories/SQLiteUserRepository';
import { CalorieCalculatorService } from '../services/CalorieCalculatorService';
import { MifflinStJeorStrategy } from '../services/strategies/MifflinStJeorStrategy';

const router = Router();
const userRepository = new SQLiteUserRepository();
const bmrStrategy = new MifflinStJeorStrategy();
const calorieCalculator = new CalorieCalculatorService(bmrStrategy);
const nutritionService = new NutritionService(userRepository, calorieCalculator);
const nutritionController = new NutritionController(nutritionService);

router.get('/plan/:userId', nutritionController.getPlan);
router.get('/bmr/:userId', nutritionController.getBmr);

export default router;
