import { IBmrStrategy } from './IBmrStrategy';
import { UserProfile } from '../../models/UserProfile';

export class HarrisBenedictStrategy implements IBmrStrategy {
  calculate(profile: UserProfile): number {
    const { weight, height, age, gender } = profile;
    
    if (gender === 'male') {
      return 88.362 + (13.397 * weight) + (4.799 * height) - (5.677 * age);
    } else {
      return 447.593 + (9.247 * weight) + (3.098 * height) - (4.330 * age);
    }
  }
}
