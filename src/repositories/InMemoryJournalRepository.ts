import { IJournalRepository } from './interfaces/IJournalRepository';
import { MealEntry } from '../models/MealEntry';

export class InMemoryJournalRepository implements IJournalRepository {
  private meals: MealEntry[] = [];

  async save(entry: MealEntry): Promise<MealEntry> {
    this.meals.push(entry);
    return entry;
  }

  async findByUserId(userId: string): Promise<MealEntry[]> {
    return this.meals.filter((m) => m.userId === userId);
  }

  async findByUserIdAndDate(userId: string, date: Date): Promise<MealEntry[]> {
    const targetDate = date.toISOString().split('T')[0];
    return this.meals.filter(
      (m) => m.userId === userId && m.timestamp.toISOString().split('T')[0] === targetDate
    );
  }
}
