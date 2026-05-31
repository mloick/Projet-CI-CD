import { Request, Response, NextFunction } from 'express';
import {
  errorHandler,
  CustomError,
  NotFoundError,
  ValidationError,
} from '../../src/middlewares/errorHandler';
import { validateRequest } from '../../src/middlewares/validateRequest';

// ─── Helpers ────────────────────────────────────────────────────────────────
const makeRes = (): Response => {
  const res = {
    status: jest.fn().mockReturnThis(),
    json: jest.fn().mockReturnThis(),
  } as unknown as Response;
  return res;
};

const makeReq = (body: Record<string, unknown> = {}): Request =>
  ({
    originalUrl: '/test',
    method: 'GET',
    ip: '127.0.0.1',
    body,
  }) as unknown as Request;

const noop: NextFunction = jest.fn();

// ─── Custom Error classes ───────────────────────────────────────────────────
describe('CustomError', () => {
  it('should store message and statusCode', () => {
    const err = new CustomError('test error', 422);
    expect(err.message).toBe('test error');
    expect(err.statusCode).toBe(422);
    expect(err).toBeInstanceOf(Error);
  });
});

describe('NotFoundError', () => {
  it('should default to statusCode 404 and a generic message', () => {
    const err = new NotFoundError();
    expect(err.statusCode).toBe(404);
    expect(err.message).toBe('Resource not found');
  });

  it('should accept a custom message', () => {
    const err = new NotFoundError('Item missing');
    expect(err.message).toBe('Item missing');
    expect(err.statusCode).toBe(404);
  });
});

describe('ValidationError', () => {
  it('should have statusCode 400', () => {
    const err = new ValidationError('invalid data');
    expect(err.statusCode).toBe(400);
    expect(err.message).toBe('invalid data');
  });
});

// ─── errorHandler middleware ─────────────────────────────────────────────────
describe('errorHandler middleware', () => {
  it('should return 404 for NotFoundError', () => {
    const res = makeRes();
    errorHandler(new NotFoundError('not found'), makeReq(), res, noop);
    expect(res.status).toHaveBeenCalledWith(404);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({ status: 'error', statusCode: 404 })
    );
  });

  it('should return 400 for ValidationError', () => {
    const res = makeRes();
    errorHandler(new ValidationError('bad input'), makeReq(), res, noop);
    expect(res.status).toHaveBeenCalledWith(400);
  });

  it('should return 500 for a generic Error', () => {
    const res = makeRes();
    errorHandler(new Error('unexpected crash'), makeReq(), res, noop);
    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({ statusCode: 500 })
    );
  });

  it('should return 500 for a custom statusCode=500 error', () => {
    const res = makeRes();
    errorHandler(new CustomError('server boom', 500), makeReq(), res, noop);
    expect(res.status).toHaveBeenCalledWith(500);
  });
});

// ─── validateRequest middleware ──────────────────────────────────────────────
describe('validateRequest middleware', () => {
  it('should call next() when all required fields are present', () => {
    const next = jest.fn();
    validateRequest(['name', 'age'])(makeReq({ name: 'Alice', age: 25 }), makeRes(), next);
    expect(next).toHaveBeenCalledTimes(1);
  });

  it('should throw ValidationError when a required field is missing', () => {
    expect(() =>
      validateRequest(['name', 'age'])(makeReq({ name: 'Alice' }), makeRes(), noop)
    ).toThrow(ValidationError);
  });

  it('should include the missing field name in the error message', () => {
    try {
      validateRequest(['name', 'age'])(makeReq({}), makeRes(), noop);
    } catch (e) {
      expect((e as Error).message).toContain('name');
      expect((e as Error).message).toContain('age');
    }
  });

  it('should pass when no fields are required', () => {
    const next = jest.fn();
    validateRequest([])(makeReq({}), makeRes(), next);
    expect(next).toHaveBeenCalled();
  });
});
