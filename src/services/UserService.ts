import { IUserRepository } from '../repositories/interfaces/IUserRepository';
import { UserProfile } from '../models/UserProfile';
import { v4 as uuidv4 } from 'uuid';
import { NotFoundError } from '../middlewares/errorHandler';

export class UserService {
  constructor(private userRepository: IUserRepository) {}

  public async createProfile(data: Omit<UserProfile, 'id' | 'createdAt' | 'updatedAt'>): Promise<UserProfile> {
    const profile: UserProfile = {
      ...data,
      id: uuidv4(),
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    return this.userRepository.create(profile);
  }

  public async getProfile(id: string): Promise<UserProfile> {
    const profile = await this.userRepository.findById(id);
    if (!profile) throw new NotFoundError('User profile not found');
    return profile;
  }

  public async updateProfile(id: string, data: Partial<UserProfile>): Promise<UserProfile> {
    const existing = await this.getProfile(id);
    const updated: UserProfile = {
      ...existing,
      ...data,
      id, // ensure ID doesn't change
      updatedAt: new Date(),
    };
    return this.userRepository.update(updated);
  }
}
