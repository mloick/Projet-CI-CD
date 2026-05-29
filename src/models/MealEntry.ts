export interface MealEntry {
  id: string;
  userId: string;
  name: string;
  calories: number;
  protein: number; // en grammes
  carbs: number; // en grammes
  fat: number; // en grammes
  timestamp: Date;
}
