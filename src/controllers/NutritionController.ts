import { Request, Response, NextFunction } from 'express';
import { NutritionService } from '../services/NutritionService';

export class NutritionController {
  constructor(private nutritionService: NutritionService) {}

  public getPlan = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const plan = await this.nutritionService.generatePlan(req.params.userId);
      res.status(200).json(plan);
    } catch (error) {
      next(error);
    }
  };

  public getBmr = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const bmr = await this.nutritionService.getBmr(req.params.userId);
      res.status(200).json({ bmr: Math.round(bmr) });
    } catch (error) {
      next(error);
    }
  };
}
