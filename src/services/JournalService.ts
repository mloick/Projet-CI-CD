import { IJournalRepository } from '../repositories/interfaces/IJournalRepository';
import { MealEntry } from '../models/MealEntry';
import { v4 as uuidv4 } from 'uuid';
import { NutritionService } from './NutritionService';

export class JournalService {
  constructor(
    private journalRepository: IJournalRepository,
    private nutritionService: NutritionService
  ) {}

  public async logMeal(data: Omit<MealEntry, 'id' | 'timestamp'>): Promise<MealEntry> {
    const meal: MealEntry = {
      ...data,
      id: uuidv4(),
      timestamp: new Date(),
    };
    return this.journalRepository.save(meal);
  }

  public async getHistory(userId: string): Promise<MealEntry[]> {
    return this.journalRepository.findByUserId(userId);
  }

  public async getDailySummary(userId: string): Promise<{
    userId: string;
    date: string;
    consumed: { calories: number; protein: number; carbs: number; fat: number };
    target: { calories: number; macros: { protein: number; carbs: number; fat: number } };
    remaining: { calories: number; protein: number; carbs: number; fat: number };
  }> {
    const plan = await this.nutritionService.generatePlan(userId);
    const meals = await this.journalRepository.findByUserIdAndDate(userId, new Date());

    const totals = meals.reduce(
      (acc, meal) => ({
        calories: acc.calories + meal.calories,
        protein: acc.protein + meal.protein,
        carbs: acc.carbs + meal.carbs,
        fat: acc.fat + meal.fat,
      }),
      { calories: 0, protein: 0, carbs: 0, fat: 0 }
    );

    return {
      userId,
      date: new Date().toISOString().split('T')[0],
      consumed: totals,
      target: {
        calories: plan.targetCalories,
        macros: plan.macros,
      },
      remaining: {
        calories: plan.targetCalories - totals.calories,
        protein: plan.macros.protein - totals.protein,
        carbs: plan.macros.carbs - totals.carbs,
        fat: plan.macros.fat - totals.fat,
      },
    };
  }
}
