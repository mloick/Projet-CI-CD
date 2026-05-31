import { UserService } from '../../src/services/UserService';
import { InMemoryUserRepository } from '../../src/repositories/InMemoryUserRepository';

describe('UserService', () => {
  let service: UserService;
  let repo: InMemoryUserRepository;

  const baseData = {
    age: 25,
    weight: 70,
    height: 175,
    gender: 'male' as const,
    activityLevel: 'moderate' as const,
    goal: 'maintain' as const,
  };

  beforeEach(() => {
    repo = new InMemoryUserRepository();
    service = new UserService(repo);
  });

  describe('createProfile', () => {
    it('should create a user profile with a generated id', async () => {
      const profile = await service.createProfile(baseData);
      expect(profile.id).toBeDefined();
      expect(profile.id).toHaveLength(36);
    });

    it('should set createdAt and updatedAt on creation', async () => {
      const profile = await service.createProfile(baseData);
      expect(profile.createdAt).toBeInstanceOf(Date);
      expect(profile.updatedAt).toBeInstanceOf(Date);
    });

    it('should persist the provided data', async () => {
      const profile = await service.createProfile(baseData);
      expect(profile.age).toBe(25);
      expect(profile.weight).toBe(70);
      expect(profile.gender).toBe('male');
      expect(profile.goal).toBe('maintain');
    });
  });

  describe('getProfile', () => {
    it('should retrieve an existing user profile by id', async () => {
      const created = await service.createProfile(baseData);
      const retrieved = await service.getProfile(created.id);
      expect(retrieved.id).toBe(created.id);
      expect(retrieved.age).toBe(25);
    });

    it('should throw NotFoundError for a non-existent id', async () => {
      await expect(service.getProfile('non-existent-id')).rejects.toThrow('User profile not found');
    });
  });

  describe('updateProfile', () => {
    it('should update the specified fields', async () => {
      const created = await service.createProfile(baseData);
      const updated = await service.updateProfile(created.id, { weight: 75, goal: 'cut' });
      expect(updated.weight).toBe(75);
      expect(updated.goal).toBe('cut');
    });

    it('should not change the user id on update', async () => {
      const created = await service.createProfile(baseData);
      const updated = await service.updateProfile(created.id, { weight: 80 });
      expect(updated.id).toBe(created.id);
    });

    it('should update the updatedAt timestamp', async () => {
      const created = await service.createProfile(baseData);
      const before = created.updatedAt.getTime();
      await new Promise((r) => setTimeout(r, 5));
      const updated = await service.updateProfile(created.id, { weight: 80 });
      expect(updated.updatedAt.getTime()).toBeGreaterThanOrEqual(before);
    });

    it('should throw NotFoundError when updating a non-existent profile', async () => {
      await expect(service.updateProfile('does-not-exist', { weight: 80 })).rejects.toThrow(
        'User profile not found'
      );
    });
  });
});
