import { UserProfile } from '../../models/UserProfile';

export interface IUserRepository {
  create(profile: UserProfile): Promise<UserProfile>;
  findById(id: string): Promise<UserProfile | null>;
  update(profile: UserProfile): Promise<UserProfile>;
  delete(id: string): Promise<void>;
}
