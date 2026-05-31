import { NutritionPlanFactory } from '../../src/services/NutritionPlanFactory';

describe('NutritionPlanFactory', () => {
  const userId = 'user-1';
  const bmr = 1700;
  const tdee = 2000;

  describe('cut goal', () => {
    it('should set target calories to 80% of TDEE', () => {
      const plan = NutritionPlanFactory.create(userId, 'cut', bmr, tdee);
      expect(plan.targetCalories).toBe(Math.round(tdee * 0.8));
    });

    it('should use high-protein macros (35% protein)', () => {
      const plan = NutritionPlanFactory.create(userId, 'cut', bmr, tdee);
      const targetCal = tdee * 0.8;
      expect(plan.macros.protein).toBe(Math.round((targetCal * 0.35) / 4));
    });

    it('should set goal to cut', () => {
      const plan = NutritionPlanFactory.create(userId, 'cut', bmr, tdee);
      expect(plan.goal).toBe('cut');
    });
  });

  describe('bulk goal', () => {
    it('should set target calories to 110% of TDEE', () => {
      const plan = NutritionPlanFactory.create(userId, 'bulk', bmr, tdee);
      expect(plan.targetCalories).toBe(Math.round(tdee * 1.1));
    });

    it('should use higher-carb macros (50% carbs)', () => {
      const plan = NutritionPlanFactory.create(userId, 'bulk', bmr, tdee);
      const targetCal = tdee * 1.1;
      expect(plan.macros.carbs).toBe(Math.round((targetCal * 0.5) / 4));
    });

    it('should set goal to bulk', () => {
      const plan = NutritionPlanFactory.create(userId, 'bulk', bmr, tdee);
      expect(plan.goal).toBe('bulk');
    });
  });

  describe('maintain goal', () => {
    it('should set target calories equal to TDEE', () => {
      const plan = NutritionPlanFactory.create(userId, 'maintain', bmr, tdee);
      expect(plan.targetCalories).toBe(Math.round(tdee));
    });

    it('should set goal to maintain', () => {
      const plan = NutritionPlanFactory.create(userId, 'maintain', bmr, tdee);
      expect(plan.goal).toBe('maintain');
    });
  });

  describe('common fields', () => {
    it('should include userId, bmr, tdee, and macros', () => {
      const plan = NutritionPlanFactory.create(userId, 'maintain', bmr, tdee);
      expect(plan.userId).toBe(userId);
      expect(plan.bmr).toBe(Math.round(bmr));
      expect(plan.tdee).toBe(Math.round(tdee));
      expect(plan.macros).toBeDefined();
      expect(plan.macros.protein).toBeGreaterThan(0);
      expect(plan.macros.carbs).toBeGreaterThan(0);
      expect(plan.macros.fat).toBeGreaterThan(0);
    });
  });
});
