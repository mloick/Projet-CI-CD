import { Request, Response, NextFunction } from 'express';
import { WeightService } from '../services/WeightService';

export class WeightController {
  constructor(private weightService: WeightService) {}

  public addEntry = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const entry = await this.weightService.addEntry(req.body.userId, req.body.weight);
      res.status(201).json(entry);
    } catch (error) {
      next(error);
    }
  };

  public getHistory = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const history = await this.weightService.getHistory(req.params.userId);
      res.status(200).json(history);
    } catch (error) {
      next(error);
    }
  };
}
