import { InMemoryUserRepository } from '../../src/repositories/InMemoryUserRepository';
import { InMemoryWeightRepository } from '../../src/repositories/InMemoryWeightRepository';
import { InMemoryJournalRepository } from '../../src/repositories/InMemoryJournalRepository';
import { UserProfile } from '../../src/models/UserProfile';
import { WeightEntry } from '../../src/models/WeightEntry';
import { MealEntry } from '../../src/models/MealEntry';

// ─── Factories ─────────────────────────────────────────────────────────────
const makeUser = (id = 'user-1'): UserProfile => ({
  id,
  age: 30,
  weight: 70,
  height: 175,
  gender: 'male',
  activityLevel: 'moderate',
  goal: 'maintain',
  createdAt: new Date(),
  updatedAt: new Date(),
});

const makeWeight = (id = 'w-1', userId = 'user-1'): WeightEntry => ({
  id,
  userId,
  weight: 70,
  date: new Date(),
});

const makeMeal = (id = 'm-1', userId = 'user-1', daysAgo = 0): MealEntry => {
  const ts = new Date();
  ts.setDate(ts.getDate() - daysAgo);
  return { id, userId, name: 'Rice', calories: 300, protein: 10, carbs: 60, fat: 5, timestamp: ts };
};

// ─── InMemoryUserRepository ─────────────────────────────────────────────────
describe('InMemoryUserRepository', () => {
  let repo: InMemoryUserRepository;
  beforeEach(() => { repo = new InMemoryUserRepository(); });

  it('should create and retrieve a user', async () => {
    const user = makeUser();
    const created = await repo.create(user);
    expect(created).toEqual(user);
    expect(await repo.findById('user-1')).toEqual(user);
  });

  it('should return null for a non-existent id', async () => {
    expect(await repo.findById('unknown')).toBeNull();
  });

  it('should update an existing user', async () => {
    await repo.create(makeUser());
    const updated = { ...makeUser(), weight: 80 };
    await repo.update(updated);
    const found = await repo.findById('user-1');
    expect(found?.weight).toBe(80);
  });

  it('should delete a user', async () => {
    await repo.create(makeUser());
    await repo.delete('user-1');
    expect(await repo.findById('user-1')).toBeNull();
  });

  it('should handle deleting a non-existent user without throwing', async () => {
    await expect(repo.delete('ghost')).resolves.toBeUndefined();
  });
});

// ─── InMemoryWeightRepository ───────────────────────────────────────────────
describe('InMemoryWeightRepository', () => {
  let repo: InMemoryWeightRepository;
  beforeEach(() => { repo = new InMemoryWeightRepository(); });

  it('should save an entry and return it', async () => {
    const entry = await repo.save(makeWeight());
    expect(entry.id).toBe('w-1');
  });

  it('should retrieve entries filtered by userId', async () => {
    await repo.save(makeWeight('w-1', 'user-1'));
    await repo.save(makeWeight('w-2', 'user-2'));
    const entries = await repo.findByUserId('user-1');
    expect(entries).toHaveLength(1);
    expect(entries[0].userId).toBe('user-1');
  });

  it('should return an empty array when no entries exist', async () => {
    expect(await repo.findByUserId('user-1')).toHaveLength(0);
  });

  it('should accumulate entries for the same user', async () => {
    await repo.save(makeWeight('w-1', 'user-1'));
    await repo.save(makeWeight('w-2', 'user-1'));
    expect(await repo.findByUserId('user-1')).toHaveLength(2);
  });
});

// ─── InMemoryJournalRepository ──────────────────────────────────────────────
describe('InMemoryJournalRepository', () => {
  let repo: InMemoryJournalRepository;
  beforeEach(() => { repo = new InMemoryJournalRepository(); });

  it('should save a meal and return it', async () => {
    const meal = await repo.save(makeMeal());
    expect(meal.id).toBe('m-1');
  });

  it('should find meals by userId', async () => {
    await repo.save(makeMeal('m-1', 'user-1'));
    await repo.save(makeMeal('m-2', 'user-2'));
    expect(await repo.findByUserId('user-1')).toHaveLength(1);
  });

  it('should return an empty array for unknown user', async () => {
    expect(await repo.findByUserId('unknown')).toHaveLength(0);
  });

  it('should find meals logged today', async () => {
    await repo.save(makeMeal('m-1', 'user-1', 0));
    await repo.save(makeMeal('m-2', 'user-1', 1));
    const today = await repo.findByUserIdAndDate('user-1', new Date());
    expect(today).toHaveLength(1);
    expect(today[0].id).toBe('m-1');
  });

  it('should return no meals when none logged today', async () => {
    await repo.save(makeMeal('m-1', 'user-1', 1));
    expect(await repo.findByUserIdAndDate('user-1', new Date())).toHaveLength(0);
  });
});
