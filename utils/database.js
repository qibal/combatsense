const { drizzle } = require('drizzle-orm/node-postgres');
const { Pool } = require('pg');
require('dotenv').config();

/**
 * Konfigurasi koneksi database PostgreSQL
 * Menggunakan DATABASE_URL untuk connection string yang lebih simple
 */
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

/**
 * Instance Drizzle ORM
 * Digunakan untuk semua operasi database
 */
const db = drizzle(pool);

/**
 * Function untuk test koneksi database
 * Berguna untuk memastikan database tersambung dengan benar
 */
async function testConnection() {
  try {
    const client = await pool.connect();
    console.log('✅ Database connected successfully');
    client.release();
    return true;
  } catch (error) {
    console.error('❌ Database connection failed:', error.message);
    return false;
  }
}

module.exports = {
  db,
  pool,
  testConnection
};

/**
 * Cara penggunaan:
 * 
 * // Import di file lain
 * const { db } = require('../utils/database');
 * 
 * // Test koneksi
 * const { testConnection } = require('../utils/database');
 * await testConnection();
 * 
 * // Query database
 * const result = await db.select().from(personnelTable);
 */