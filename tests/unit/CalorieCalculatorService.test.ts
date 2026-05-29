import { CalorieCalculatorService } from '../../src/services/CalorieCalculatorService';
import { MifflinStJeorStrategy } from '../../src/services/strategies/MifflinStJeorStrategy';
import { HarrisBenedictStrategy } from '../../src/services/strategies/HarrisBenedictStrategy';
import { UserProfile } from '../../src/models/UserProfile';

describe('CalorieCalculatorService & Strategies', () => {
  const maleProfile: UserProfile = {
    id: 'user-1',
    age: 25,
    weight: 70, // kg
    height: 175, // cm
    gender: 'male',
    activityLevel: 'moderate',
    goal: 'maintain',
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  const femaleProfile: UserProfile = {
    id: 'user-2',
    age: 30,
    weight: 60, // kg
    height: 165, // cm
    gender: 'female',
    activityLevel: 'sedentary',
    goal: 'maintain',
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  describe('MifflinStJeorStrategy', () => {
    const strategy = new MifflinStJeorStrategy();

    it('should calculate BMR for male profile correctly', () => {
      // (10 * 70) + (6.25 * 175) - (5 * 25) + 5 = 700 + 1093.75 - 125 + 5 = 1673.75
      const bmr = strategy.calculate(maleProfile);
      expect(bmr).toBe(1673.75);
    });

    it('should calculate BMR for female profile correctly', () => {
      // (10 * 60) + (6.25 * 165) - (5 * 30) - 161 = 600 + 1031.25 - 150 - 161 = 1320.25
      const bmr = strategy.calculate(femaleProfile);
      expect(bmr).toBe(1320.25);
    });
  });

  describe('HarrisBenedictStrategy', () => {
    const strategy = new HarrisBenedictStrategy();

    it('should calculate BMR for male profile correctly', () => {
      // 88.362 + (13.397 * 70) + (4.799 * 175) - (5.677 * 25)
      // = 88.362 + 937.79 + 839.825 - 141.925 = 1724.052
      const bmr = strategy.calculate(maleProfile);
      expect(bmr).toBeCloseTo(1724.052, 3);
    });

    it('should calculate BMR for female profile correctly', () => {
      // 447.593 + (9.247 * 60) + (3.098 * 165) - (4.330 * 30)
      // = 447.593 + 554.82 + 511.17 - 129.9 = 1383.683
      const bmr = strategy.calculate(femaleProfile);
      expect(bmr).toBeCloseTo(1383.683, 3);
    });
  });

  describe('CalorieCalculatorService', () => {
    it('should calculate BMR using the injected strategy', () => {
      const mockStrategy = {
        calculate: jest.fn().mockReturnValue(1500),
      };
      const service = new CalorieCalculatorService(mockStrategy);
      const bmr = service.calculateBmr(maleProfile);
      expect(bmr).toBe(1500);
      expect(mockStrategy.calculate).toHaveBeenCalledWith(maleProfile);
    });

    it('should calculate TDEE correctly according to activity level', () => {
      const strategy = new MifflinStJeorStrategy();
      const service = new CalorieCalculatorService(strategy);

      // Male, Moderate: 1673.75 * 1.55 = 2594.3125
      const tdeeMale = service.calculateTdee(maleProfile);
      expect(tdeeMale).toBeCloseTo(2594.3125, 4);

      // Female, Sedentary: 1320.25 * 1.2 = 1584.3
      const tdeeFemale = service.calculateTdee(femaleProfile);
      expect(tdeeFemale).toBeCloseTo(1584.3, 4);
    });
  });
});
