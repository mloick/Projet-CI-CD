import { UserProfile, ActivityLevel } from '../models/UserProfile';
import { IBmrStrategy } from './strategies/IBmrStrategy';

export class CalorieCalculatorService {
  private readonly activityMultipliers: Record<ActivityLevel, number> = {
    sedentary: 1.2,
    light: 1.375,
    moderate: 1.55,
    active: 1.725,
    very_active: 1.9,
  };

  constructor(private bmrStrategy: IBmrStrategy) {}

  public calculateBmr(profile: UserProfile): number {
    return this.bmrStrategy.calculate(profile);
  }

  public calculateTdee(profile: UserProfile): number {
    const bmr = this.calculateBmr(profile);
    const multiplier = this.activityMultipliers[profile.activityLevel];
    return bmr * multiplier;
  }
}
