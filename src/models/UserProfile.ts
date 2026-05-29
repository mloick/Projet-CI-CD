export type Gender = 'male' | 'female';
export type ActivityLevel = 'sedentary' | 'light' | 'moderate' | 'active' | 'very_active';
export type Goal = 'cut' | 'maintain' | 'bulk';

export interface UserProfile {
  id: string;
  age: number;
  weight: number; // en kg
  height: number; // en cm
  gender: Gender;
  activityLevel: ActivityLevel;
  goal: Goal;
  createdAt: Date;
  updatedAt: Date;
}
