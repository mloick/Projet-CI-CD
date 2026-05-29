import { IUserRepository } from '../repositories/interfaces/IUserRepository';
import { CalorieCalculatorService } from './CalorieCalculatorService';
import { NutritionPlanFactory } from './NutritionPlanFactory';
import { NutritionPlan } from '../models/NutritionPlan';
import { NotFoundError } from '../middlewares/errorHandler';

export class NutritionService {
  constructor(
    private userRepository: IUserRepository,
    private calorieCalculator: CalorieCalculatorService
  ) {}

  public async getBmr(userId: string): Promise<number> {
    const user = await this.userRepository.findById(userId);
    if (!user) throw new NotFoundError('User not found');

    return this.calorieCalculator.calculateBmr(user);
  }

  public async generatePlan(userId: string): Promise<NutritionPlan> {
    const user = await this.userRepository.findById(userId);
    if (!user) throw new NotFoundError('User not found');

    const bmr = this.calorieCalculator.calculateBmr(user);
    const tdee = this.calorieCalculator.calculateTdee(user);

    return NutritionPlanFactory.create(userId, user.goal, bmr, tdee);
  }
}
