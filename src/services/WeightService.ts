import { IWeightRepository } from '../repositories/interfaces/IWeightRepository';
import { WeightEntry } from '../models/WeightEntry';
import { v4 as uuidv4 } from 'uuid';

export class WeightService {
  constructor(private weightRepository: IWeightRepository) {}

  public async addEntry(userId: string, weight: number): Promise<WeightEntry> {
    const entry: WeightEntry = {
      id: uuidv4(),
      userId,
      weight,
      date: new Date(),
    };
    return this.weightRepository.save(entry);
  }

  public async getHistory(userId: string): Promise<WeightEntry[]> {
    return this.weightRepository.findByUserId(userId);
  }
}
