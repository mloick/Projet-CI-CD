import { MealEntry } from '../../models/MealEntry';

export interface IJournalRepository {
  save(entry: MealEntry): Promise<MealEntry>;
  findByUserId(userId: string): Promise<MealEntry[]>;
  findByUserIdAndDate(userId: string, date: Date): Promise<MealEntry[]>;
}
