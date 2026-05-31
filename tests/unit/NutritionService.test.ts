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

describe('NutritionService', () => {
  let service: NutritionService;
  let repo: InMemoryUserRepository;

  beforeEach(() => {
    repo = new InMemoryUserRepository();
    const strategy = new MifflinStJeorStrategy();
    const calculator = new CalorieCalculatorService(strategy);
    service = new NutritionService(repo, calculator);
  });

  describe('getBmr', () => {
    it('should throw NotFoundError when user does not exist', async () => {
      await expect(service.getBmr('unknown')).rejects.toThrow('User not found');
    });

    it('should return a positive BMR for an existing user', async () => {
      await repo.create(makeUser());
      const bmr = await service.getBmr('user-1');
      expect(bmr).toBeGreaterThan(0);
      // Mifflin-St Jeor for male 25yo 70kg 175cm = 1673.75
      expect(bmr).toBeCloseTo(1673.75, 2);
    });
  });

  describe('generatePlan', () => {
    it('should throw NotFoundError when user does not exist', async () => {
      await expect(service.generatePlan('unknown')).rejects.toThrow('User not found');
    });

    it('should return a complete nutrition plan for an existing user', async () => {
      await repo.create(makeUser());
      const plan = await service.generatePlan('user-1');
      expect(plan.userId).toBe('user-1');
      expect(plan.bmr).toBeGreaterThan(0);
      expect(plan.tdee).toBeGreaterThan(plan.bmr);
      expect(plan.targetCalories).toBeGreaterThan(0);
      expect(plan.macros.protein).toBeGreaterThan(0);
      expect(plan.macros.carbs).toBeGreaterThan(0);
      expect(plan.macros.fat).toBeGreaterThan(0);
    });

    it('should set goal according to user profile', async () => {
      await repo.create({ ...makeUser(), goal: 'cut' });
      const plan = await service.generatePlan('user-1');
      expect(plan.goal).toBe('cut');
    });
  });
});
