import { IUserRepository } from './interfaces/IUserRepository';
import { UserProfile } from '../models/UserProfile';

export class InMemoryUserRepository implements IUserRepository {
  private users: Map<string, UserProfile> = new Map();

  async create(profile: UserProfile): Promise<UserProfile> {
    this.users.set(profile.id, profile);
    return profile;
  }

  async findById(id: string): Promise<UserProfile | null> {
    return this.users.get(id) || null;
  }

  async update(profile: UserProfile): Promise<UserProfile> {
    this.users.set(profile.id, profile);
    return profile;
  }

  async delete(id: string): Promise<void> {
    this.users.delete(id);
  }
}
