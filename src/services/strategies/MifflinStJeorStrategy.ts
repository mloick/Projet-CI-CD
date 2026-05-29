import { IBmrStrategy } from './IBmrStrategy';
import { UserProfile } from '../../models/UserProfile';

export class MifflinStJeorStrategy implements IBmrStrategy {
  calculate(profile: UserProfile): number {
    const { weight, height, age, gender } = profile;
    
    if (gender === 'male') {
      return (10 * weight) + (6.25 * height) - (5 * age) + 5;
    } else {
      return (10 * weight) + (6.25 * height) - (5 * age) - 161;
    }
  }
}
