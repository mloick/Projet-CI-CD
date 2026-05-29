import { IWeightRepository } from './interfaces/IWeightRepository';
import { WeightEntry } from '../models/WeightEntry';

export class InMemoryWeightRepository implements IWeightRepository {
  private entries: WeightEntry[] = [];

  async save(entry: WeightEntry): Promise<WeightEntry> {
    this.entries.push(entry);
    return entry;
  }

  async findByUserId(userId: string): Promise<WeightEntry[]> {
    return this.entries.filter((e) => e.userId === userId);
  }
}
