import { IUserRepository } from './interfaces/IUserRepository';
import { UserProfile, Gender, ActivityLevel, Goal } from '../models/UserProfile';
import { DatabaseConnection } from '../config/database';

export class SQLiteUserRepository implements IUserRepository {
  private db = DatabaseConnection.getInstance();

  async create(profile: UserProfile): Promise<UserProfile> {
    const stmt = this.db.prepare(`
      INSERT INTO users (id, age, weight, height, gender, activity_level, goal, created_at, updated_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);

    stmt.run(
      profile.id,
      profile.age,
      profile.weight,
      profile.height,
      profile.gender,
      profile.activityLevel,
      profile.goal,
      profile.createdAt.toISOString(),
      profile.updatedAt.toISOString()
    );

    return profile;
  }

  async findById(id: string): Promise<UserProfile | null> {
    const stmt = this.db.prepare('SELECT * FROM users WHERE id = ?');
    const row = stmt.get(id) as
      | {
          id: string;
          age: number;
          weight: number;
          height: number;
          gender: string;
          activity_level: string;
          goal: string;
          created_at: string;
          updated_at: string;
        }
      | undefined;

    if (!row) return null;

    return {
      id: row.id,
      age: row.age,
      weight: row.weight,
      height: row.height,
      gender: row.gender as Gender,
      activityLevel: row.activity_level as ActivityLevel,
      goal: row.goal as Goal,
      createdAt: new Date(row.created_at),
      updatedAt: new Date(row.updated_at),
    };
  }

  async update(profile: UserProfile): Promise<UserProfile> {
    const stmt = this.db.prepare(`
      UPDATE users 
      SET age = ?, weight = ?, height = ?, gender = ?, activity_level = ?, goal = ?, updated_at = ?
      WHERE id = ?
    `);

    stmt.run(
      profile.age,
      profile.weight,
      profile.height,
      profile.gender,
      profile.activityLevel,
      profile.goal,
      profile.updatedAt.toISOString(),
      profile.id
    );

    return profile;
  }

  async delete(id: string): Promise<void> {
    const stmt = this.db.prepare('DELETE FROM users WHERE id = ?');
    stmt.run(id);
  }
}
