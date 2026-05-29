import { Logger } from '../config/logger';

export class CalorieValidator {
  private static logger = Logger.getInstance();
  private static readonly MIN_CALORIES = 1200;
  private static readonly MAX_SURPLUS = 500;

  public static validate(targetCalories: number, tdee: number): void {
    if (targetCalories < this.MIN_CALORIES) {
      throw new Error(`Validation Error: Target calories (${targetCalories}) cannot be below ${this.MIN_CALORIES} kcal/day.`);
    }

    const surplus = targetCalories - tdee;
    if (surplus > this.MAX_SURPLUS) {
      this.logger.warn(`Security Alert: High calorie surplus detected (${surplus} kcal). Recommendation: decrease target.`);
    }
  }
}
