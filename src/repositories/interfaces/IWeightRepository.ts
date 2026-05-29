import { WeightEntry } from '../../models/WeightEntry';

export interface IWeightRepository {
  save(entry: WeightEntry): Promise<WeightEntry>;
  findByUserId(userId: string): Promise<WeightEntry[]>;
}
