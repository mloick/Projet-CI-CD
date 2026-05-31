import { WeightService } from '../../src/services/WeightService';
import { InMemoryWeightRepository } from '../../src/repositories/InMemoryWeightRepository';

describe('WeightService', () => {
  let service: WeightService;

  beforeEach(() => {
    service = new WeightService(new InMemoryWeightRepository());
  });

  describe('addEntry', () => {
    it('should create an entry with a generated id', async () => {
      const entry = await service.addEntry('user-1', 70.5);
      expect(entry.id).toBeDefined();
      expect(entry.id).toHaveLength(36);
    });

    it('should store the correct userId and weight', async () => {
      const entry = await service.addEntry('user-1', 72.3);
      expect(entry.userId).toBe('user-1');
      expect(entry.weight).toBe(72.3);
    });

    it('should set date to the current date', async () => {
      const before = new Date();
      const entry = await service.addEntry('user-1', 70);
      const after = new Date();
      expect(entry.date.getTime()).toBeGreaterThanOrEqual(before.getTime());
      expect(entry.date.getTime()).toBeLessThanOrEqual(after.getTime());
    });
  });

  describe('getHistory', () => {
    it('should return all entries for a user', async () => {
      await service.addEntry('user-1', 70);
      await service.addEntry('user-1', 71);
      await service.addEntry('user-2', 60);
      const history = await service.getHistory('user-1');
      expect(history).toHaveLength(2);
      expect(history.every((e) => e.userId === 'user-1')).toBe(true);
    });

    it('should return an empty array for a user with no entries', async () => {
      const history = await service.getHistory('user-1');
      expect(history).toHaveLength(0);
    });
  });
});
