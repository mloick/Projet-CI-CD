import { Router } from 'express';
import { JournalController } from '../controllers/JournalController';
import { JournalService } from '../services/JournalService';
import { InMemoryJournalRepository } from '../repositories/InMemoryJournalRepository';
import { NutritionService } from '../services/NutritionService';
import { SQLiteUserRepository } from '../repositories/SQLiteUserRepository';
import { CalorieCalculatorService } from '../services/CalorieCalculatorService';
import { MifflinStJeorStrategy } from '../services/strategies/MifflinStJeorStrategy';
import { validateRequest } from '../middlewares/validateRequest';

const router = Router();
const journalRepository = new InMemoryJournalRepository();
const userRepository = new SQLiteUserRepository();
const bmrStrategy = new MifflinStJeorStrategy();
const calorieCalculator = new CalorieCalculatorService(bmrStrategy);
const nutritionService = new NutritionService(userRepository, calorieCalculator);
const journalService = new JournalService(journalRepository, nutritionService);
const journalController = new JournalController(journalService);

router.post('/', validateRequest(['userId', 'name', 'calories', 'protein', 'carbs', 'fat']), journalController.logMeal);
router.get('/:userId/today', journalController.getDailySummary);
router.get('/:userId', journalController.getHistory);

export default router;
