import { JournalService } from '../../src/services/JournalService';
import { InMemoryJournalRepository } from '../../src/repositories/InMemoryJournalRepository';
import { NutritionService } from '../../src/services/NutritionService';
import { CalorieCalculatorService } from '../../src/services/CalorieCalculatorService';
import { MifflinStJeorStrategy } from '../../src/services/strategies/MifflinStJeorStrategy';
import { InMemoryUserRepository } from '../../src/repositories/InMemoryUserRepository';
import { UserProfile } from '../../src/models/UserProfile';

const makeUser = (): UserProfile => ({
  id: 'user-1',
  age: 25,
  weight: 70,
  height: 175,
  gender: 'male',
  activityLevel: 'moderate',
  goal: 'maintain',
  createdAt: new Date(),
  updatedAt: new Date(),
});

const mealData = {
  userId: 'user-1',
  name: 'Chicken salad',
  calories: 400,
  protein: 35,
  carbs: 20,
  fat: 15,
};

describe('JournalService', () => {
  let service: JournalService;
  let userRepo: InMemoryUserRepository;

  beforeEach(async () => {
    userRepo = new InMemoryUserRepository();
    await userRepo.create(makeUser());

    const strategy = new MifflinStJeorStrategy();
    const calculator = new CalorieCalculatorService(strategy);
    const nutritionService = new NutritionService(userRepo, calculator);
    service = new JournalService(new InMemoryJournalRepository(), nutritionService);
  });

  describe('logMeal', () => {
    it('should create a meal entry with a generated id', async () => {
      const meal = await service.logMeal(mealData);
      expect(meal.id).toBeDefined();
      expect(meal.id).toHaveLength(36);
    });

    it('should set the timestamp to now', async () => {
      const before = new Date();
      const meal = await service.logMeal(mealData);
      expect(meal.timestamp.getTime()).toBeGreaterThanOrEqual(before.getTime());
    });

    it('should persist all nutritional values', async () => {
      const meal = await service.logMeal(mealData);
      expect(meal.calories).toBe(400);
      expect(meal.protein).toBe(35);
      expect(meal.carbs).toBe(20);
      expect(meal.fat).toBe(15);
    });
  });

  describe('getHistory', () => {
    it('should return all meals logged for a user', async () => {
      await service.logMeal(mealData);
      await service.logMeal({ ...mealData, name: 'Protein shake', calories: 200 });
      const history = await service.getHistory('user-1');
      expect(history).toHaveLength(2);
    });

    it('should return an empty array when no meals logged', async () => {
      expect(await service.getHistory('user-1')).toHaveLength(0);
    });
  });

  describe('getDailySummary', () => {
    it('should return the daily summary with consumed totals', async () => {
      await service.logMeal(mealData);
      const summary = await service.getDailySummary('user-1');
      expect(summary.userId).toBe('user-1');
      expect(summary.consumed.calories).toBe(400);
      expect(summary.consumed.protein).toBe(35);
      expect(summary.consumed.carbs).toBe(20);
      expect(summary.consumed.fat).toBe(15);
    });

    it('should include target calories from the nutrition plan', async () => {
      const summary = await service.getDailySummary('user-1');
      expect(summary.target.calories).toBeGreaterThan(0);
      expect(summary.target.macros).toBeDefined();
    });

    it('should calculate remaining correctly', async () => {
      await service.logMeal(mealData);
      const summary = await service.getDailySummary('user-1');
      expect(summary.remaining.calories).toBe(summary.target.calories - 400);
      expect(summary.remaining.protein).toBe(summary.target.macros.protein - 35);
    });

    it('should include the current date', async () => {
      const summary = await service.getDailySummary('user-1');
      const today = new Date().toISOString().split('T')[0];
      expect(summary.date).toBe(today);
    });
  });
});
