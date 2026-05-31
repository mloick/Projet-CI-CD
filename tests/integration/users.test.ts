// Mock SQLiteUserRepository with a shared in-memory store before any imports
jest.mock('../../src/config/database', () => ({
  DatabaseConnection: { getInstance: jest.fn() },
}));

jest.mock('../../src/repositories/SQLiteUserRepository', () => {
  const store = new Map<string, unknown>();
  return {
    SQLiteUserRepository: jest.fn().mockImplementation(() => ({
      create: (p: unknown) => {
        store.set((p as { id: string }).id, p);
        return Promise.resolve(p);
      },
      findById: (id: string) => Promise.resolve(store.get(id) ?? null),
      update: (p: unknown) => {
        store.set((p as { id: string }).id, p);
        return Promise.resolve(p);
      },
      delete: (id: string) => {
        store.delete(id);
        return Promise.resolve();
      },
    })),
  };
});

import request from 'supertest';
import app from '../../src/app';

const validUser = {
  age: 25,
  weight: 70,
  height: 175,
  gender: 'male',
  activityLevel: 'moderate',
  goal: 'maintain',
};

describe('POST /api/users', () => {
  it('should create a user and return 201 with an id', async () => {
    const res = await request(app).post('/api/users').send(validUser);
    expect(res.status).toBe(201);
    expect(res.body.id).toBeDefined();
    expect(res.body.age).toBe(25);
    expect(res.body.gender).toBe('male');
  });

  it('should return 400 when required fields are missing', async () => {
    const res = await request(app).post('/api/users').send({ age: 25 });
    expect(res.status).toBe(400);
    expect(res.body.status).toBe('error');
  });
});

describe('GET /api/users/:id', () => {
  it('should return the user for a known id', async () => {
    const created = await request(app).post('/api/users').send(validUser);
    const res = await request(app).get(`/api/users/${created.body.id}`);
    expect(res.status).toBe(200);
    expect(res.body.id).toBe(created.body.id);
  });

  it('should return 404 for an unknown id', async () => {
    const res = await request(app).get('/api/users/non-existent-id');
    expect(res.status).toBe(404);
  });
});

describe('PUT /api/users/:id', () => {
  it('should update the user and return the new values', async () => {
    const created = await request(app).post('/api/users').send(validUser);
    const res = await request(app)
      .put(`/api/users/${created.body.id}`)
      .send({ weight: 75, goal: 'cut' });
    expect(res.status).toBe(200);
    expect(res.body.weight).toBe(75);
    expect(res.body.goal).toBe('cut');
    expect(res.body.id).toBe(created.body.id);
  });

  it('should return 404 when updating a non-existent user', async () => {
    const res = await request(app).put('/api/users/ghost-id').send({ weight: 80 });
    expect(res.status).toBe(404);
  });
});
