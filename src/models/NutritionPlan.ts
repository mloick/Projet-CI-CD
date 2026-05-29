export interface Macros {
  protein: number; // grammes
  carbs: number; // grammes
  fat: number; // grammes
}

export interface NutritionPlan {
  userId: string;
  bmr: number;
  tdee: number;
  targetCalories: number;
  macros: Macros;
  goal: 'cut' | 'maintain' | 'bulk';
}
