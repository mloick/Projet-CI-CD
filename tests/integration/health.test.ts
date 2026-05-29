import request from 'supertest';
import app from '../../src/app';

// Mock DatabaseConnection to prevent native SQLite binary dependency in tests
jest.mock('../../src/config/database', () => {
  const mockPrepare = jest.fn().mockReturnValue({
    get: jest.fn().mockReturnValue({ '1': 1 }),
  });
  return {
    DatabaseConnection: {
      getInstance: jest.fn().mockReturnValue({
        prepare: mockPrepare,
      }),
    },
  };
});

describe('GET /health', () => {
  it('should return 200 OK with correct health parameters', async () => {
    const response = await request(app).get('/health');

    expect(response.status).toBe(200);
    expect(response.body).toHaveProperty('status', 'OK');
    expect(response.body).toHaveProperty('uptime');
    expect(response.body).toHaveProperty('version');
    expect(response.body).toHaveProperty('database', 'connected');
    expect(response.body).toHaveProperty('timestamp');
  });

  it('should return database: disconnected when database query fails', async () => {
    const { DatabaseConnection } = require('../../src/config/database');
    DatabaseConnection.getInstance.mockReturnValueOnce({
      prepare: jest.fn().mockImplementation(() => {
        throw new Error('Database connection failed');
      }),
    });

    const response = await request(app).get('/health');

    expect(response.status).toBe(200);
    expect(response.body).toHaveProperty('status', 'OK');
    expect(response.body).toHaveProperty('database', 'disconnected');
  });
});
