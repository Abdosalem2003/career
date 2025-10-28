import { drizzle } from 'drizzle-orm/mysql2';
import mysql from 'mysql2/promise';
import * as schema from '@shared/schema';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

// Create MySQL connection pool
const pool = mysql.createPool({
  uri: process.env.DATABASE_URL || 'mysql://root:password@localhost:3306/careercanvas',
});

// Initialize Drizzle with mysql2
export const db = drizzle(pool, { schema, mode: 'default' });

console.log('✅ [DB] Connected to MySQL database');
console.log('📍 Database URL:', process.env.DATABASE_URL?.split('@')[1]?.split('?')[0] || 'localhost:3306/careercanvas');
