// Shared in-memory store so userRoutes and nutritionRoutes see the same users
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

let userId: string;

beforeAll(async () => {
  const res = await request(app).post('/api/users').send(validUser);
  userId = res.body.id;
});

describe('GET /api/nutrition/plan/:userId', () => {
  it('should return a complete nutrition plan for a known user', async () => {
    const res = await request(app).get(`/api/nutrition/plan/${userId}`);
    expect(res.status).toBe(200);
    expect(res.body.userId).toBe(userId);
    expect(res.body.targetCalories).toBeGreaterThan(0);
    expect(res.body.macros).toBeDefined();
    expect(res.body.macros.protein).toBeGreaterThan(0);
  });

  it('should return 404 for an unknown user', async () => {
    const res = await request(app).get('/api/nutrition/plan/unknown-user');
    expect(res.status).toBe(404);
  });
});

describe('GET /api/nutrition/bmr/:userId', () => {
  it('should return the BMR for a known user', async () => {
    const res = await request(app).get(`/api/nutrition/bmr/${userId}`);
    expect(res.status).toBe(200);
    expect(typeof res.body.bmr).toBe('number');
    expect(res.body.bmr).toBeGreaterThan(0);
  });

  it('should return 404 for an unknown user', async () => {
    const res = await request(app).get('/api/nutrition/bmr/unknown-user');
    expect(res.status).toBe(404);
  });
});
