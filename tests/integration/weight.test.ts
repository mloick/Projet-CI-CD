// weightRoutes uses InMemoryWeightRepository directly — no SQLite mock needed
jest.mock('../../src/config/database', () => ({
  DatabaseConnection: { getInstance: jest.fn() },
}));

jest.mock('../../src/repositories/SQLiteUserRepository', () => ({
  SQLiteUserRepository: jest.fn().mockImplementation(() => ({})),
}));

import request from 'supertest';
import app from '../../src/app';

describe('POST /api/weight', () => {
  it('should add a weight entry and return 201', async () => {
    const res = await request(app).post('/api/weight').send({ userId: 'user-1', weight: 70.5 });
    expect(res.status).toBe(201);
    expect(res.body.id).toBeDefined();
    expect(res.body.userId).toBe('user-1');
    expect(res.body.weight).toBe(70.5);
  });

  it('should return 400 when required fields are missing', async () => {
    const res = await request(app).post('/api/weight').send({ userId: 'user-1' });
    expect(res.status).toBe(400);
  });
});

describe('GET /api/weight/:userId', () => {
  it('should return weight history for a user', async () => {
    await request(app).post('/api/weight').send({ userId: 'user-hist', weight: 70 });
    await request(app).post('/api/weight').send({ userId: 'user-hist', weight: 71 });
    const res = await request(app).get('/api/weight/user-hist');
    expect(res.status).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
    expect(res.body.length).toBeGreaterThanOrEqual(2);
  });

  it('should return an empty array for a user with no entries', async () => {
    const res = await request(app).get('/api/weight/nobody');
    expect(res.status).toBe(200);
    expect(res.body).toEqual([]);
  });
});
