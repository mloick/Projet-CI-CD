import Database, { Database as SqliteDatabase } from 'better-sqlite3';
import path from 'path';
import fs from 'fs';
import { Logger } from './logger';

export class DatabaseConnection {
  private static instance: SqliteDatabase;
  private static logger = Logger.getInstance();

  private constructor() {}

  public static getInstance(): SqliteDatabase {
    if (!DatabaseConnection.instance) {
      const dbPath = process.env.DATABASE_PATH || './data/calorie-tracker.db';
      const dbDir = path.dirname(dbPath);

      if (!fs.existsSync(dbDir)) {
        fs.mkdirSync(dbDir, { recursive: true });
      }

      DatabaseConnection.instance = new Database(dbPath);
      DatabaseConnection.logger.info(`Connected to SQLite database at ${dbPath}`);
      
      DatabaseConnection.initializeSchema();
    }
    return DatabaseConnection.instance;
  }

  private static initializeSchema(): void {
    const db = DatabaseConnection.instance;
    
    db.exec(`
      CREATE TABLE IF NOT EXISTS users (
        id TEXT PRIMARY KEY,
        age INTEGER NOT NULL,
        weight REAL NOT NULL,
        height REAL NOT NULL,
        gender TEXT NOT NULL,
        activity_level TEXT NOT NULL,
        goal TEXT NOT NULL,
        created_at TEXT NOT NULL,
        updated_at TEXT NOT NULL
      );

      CREATE TABLE IF NOT EXISTS meals (
        id TEXT PRIMARY KEY,
        user_id TEXT NOT NULL,
        name TEXT NOT NULL,
        calories REAL NOT NULL,
        protein REAL NOT NULL,
        carbs REAL NOT NULL,
        fat REAL NOT NULL,
        timestamp TEXT NOT NULL,
        FOREIGN KEY(user_id) REFERENCES users(id)
      );

      CREATE TABLE IF NOT EXISTS weights (
        id TEXT PRIMARY KEY,
        user_id TEXT NOT NULL,
        weight REAL NOT NULL,
        date TEXT NOT NULL,
        FOREIGN KEY(user_id) REFERENCES users(id)
      );
    `);
  }
}
