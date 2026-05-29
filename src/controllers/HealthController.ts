import { Request, Response } from 'express';
import { DatabaseConnection } from '../config/database';

export class HealthController {
  public check = (req: Request, res: Response): void => {
    let dbStatus = 'connected';
    try {
      DatabaseConnection.getInstance().prepare('SELECT 1').get();
    } catch (err) {
      dbStatus = 'disconnected';
    }

    res.status(200).json({
      status: 'OK',
      uptime: process.uptime(),
      version: process.env.APP_VERSION || '1.0.0',
      database: dbStatus,
      timestamp: new Date().toISOString(),
    });
  };
}
