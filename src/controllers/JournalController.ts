import { Request, Response, NextFunction } from 'express';
import { JournalService } from '../services/JournalService';

export class JournalController {
  constructor(private journalService: JournalService) {}

  public logMeal = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const meal = await this.journalService.logMeal(req.body);
      res.status(201).json(meal);
    } catch (error) {
      next(error);
    }
  };

  public getDailySummary = async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const summary = await this.journalService.getDailySummary(req.params.userId);
      res.status(200).json(summary);
    } catch (error) {
      next(error);
    }
  };

  public getHistory = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const history = await this.journalService.getHistory(req.params.userId);
      res.status(200).json(history);
    } catch (error) {
      next(error);
    }
  };
}
