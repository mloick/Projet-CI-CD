import { NutritionPlan, Macros } from '../models/NutritionPlan';
import { Goal } from '../models/UserProfile';
import { CalorieValidator } from './CalorieValidator';

export class NutritionPlanFactory {
  public static create(
    userId: string,
    goal: Goal,
    bmr: number,
    tdee: number
  ): NutritionPlan {
    let targetCalories: number;
    let proteinPct: number;
    let carbsPct: number;
    let fatPct: number;

    switch (goal) {
      case 'cut':
        targetCalories = tdee * 0.8; // -20%
        proteinPct = 0.35;
        carbsPct = 0.40;
        fatPct = 0.25;
        break;
      case 'bulk':
        targetCalories = tdee * 1.1; // +10%
        proteinPct = 0.30;
        carbsPct = 0.50;
        fatPct = 0.20;
        break;
      case 'maintain':
      default:
        targetCalories = tdee;
        proteinPct = 0.30;
        carbsPct = 0.45;
        fatPct = 0.25;
        break;
    }

    CalorieValidator.validate(targetCalories, tdee);

    const macros: Macros = {
      protein: Math.round((targetCalories * proteinPct) / 4),
      carbs: Math.round((targetCalories * carbsPct) / 4),
      fat: Math.round((targetCalories * fatPct) / 9),
    };

    return {
      userId,
      bmr: Math.round(bmr),
      tdee: Math.round(tdee),
      targetCalories: Math.round(targetCalories),
      macros,
      goal,
    };
  }
}
