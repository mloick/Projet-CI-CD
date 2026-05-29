import { UserProfile } from '../../models/UserProfile';

export interface IBmrStrategy {
  calculate(profile: UserProfile): number;
}
