import { pool } from './config/db.js';
import { logger } from './utils/logger.js';

async function runMigration() {
    try {
        logger.info('Starting migration: Add role column to profiles');
        await pool.query("ALTER TABLE profiles ADD COLUMN IF NOT EXISTS role TEXT DEFAULT 'user';");
        logger.info('Migration successful: Profiles table updated with role column');
        process.exit(0);
    } catch (error: any) {
        logger.error('Migration failed:', error.message);
        process.exit(1);
    }
}

runMigration();
