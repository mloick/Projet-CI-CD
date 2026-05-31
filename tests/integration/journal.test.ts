// Shared in-memory user store so journalRoutes' nutritionService can find users
jest.mock('../../src/config/database', () => ({
  DatabaseConnection: { getInstance: jest.fn() },
}));

const userStore = new Map<string, unknown>();
jest.mock('../../src/repositories/SQLiteUserRepository', () => ({
  SQLiteUserRepository: jest.fn().mockImplementation(() => ({
    create: (p: unknown) => { userStore.set((p as { id: string }).id, p); return Promise.resolve(p); },
    findById: (id: string) => Promise.resolve(userStore.get(id) ?? null),
    update: (p: unknown) => { userStore.set((p as { id: string }).id, p); return Promise.resolve(p); },
    delete: (id: string) => { userStore.delete(id); return Promise.resolve(); },
  })),
}));

import request from 'supertest';
import app from '../../src/app';

const validUser = {
  age: 25, weight: 70, height: 175,
  gender: 'male', activityLevel: 'moderate', goal: 'maintain',
};

const mealPayload = {
  name: 'Chicken & Rice',
  calories: 500,
  protein: 40,
  carbs: 55,
  fat: 10,
};

let userId: string;

beforeAll(async () => {
  const res = await request(app).post('/api/users').send(validUser);
  userId = res.body.id;
});

describe('POST /api/journal', () => {
  it('should log a meal and return 201 with an id', async () => {
    const res = await request(app)
      .post('/api/journal')
      .send({ ...mealPayload, userId });
    expect(res.status).toBe(201);
    expect(res.body.id).toBeDefined();
    expect(res.body.calories).toBe(500);
  });

  it('should return 400 when required fields are missing', async () => {
    const res = await request(app).post('/api/journal').send({ userId, name: 'test' });
    expect(res.status).toBe(400);
  });
});

describe('GET /api/journal/:userId', () => {
  it('should return the full meal history for a user', async () => {
    await request(app).post('/api/journal').send({ ...mealPayload, userId });
    const res = await request(app).get(`/api/journal/${userId}`);
    expect(res.status).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
    expect(res.body.length).toBeGreaterThan(0);
  });
});

describe('GET /api/journal/:userId/today', () => {
  it('should return the daily summary including consumed and remaining', async () => {
    const res = await request(app).get(`/api/journal/${userId}/today`);
    expect(res.status).toBe(200);
    expect(res.body.userId).toBe(userId);
    expect(res.body.consumed).toBeDefined();
    expect(res.body.target).toBeDefined();
    expect(res.body.remaining).toBeDefined();
    expect(typeof res.body.consumed.calories).toBe('number');
  });
});
