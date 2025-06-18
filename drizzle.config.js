require('dotenv').config();

/** @type { import("drizzle-kit").Config } */
module.exports = {
  schema: "./model/*.js",
  out: "./database",
  dialect: "postgresql",
  dbCredentials: {
    url: process.env.DATABASE_URL,
  },
  verbose: true,
  strict: true,
};

/**
 * Cara penggunaan:
 * 
 * // Generate migration
 * npx drizzle-kit generate
 * 
 * // Push ke database
 * npx drizzle-kit push
 * 
 * // Migrate ke database
 * npx drizzle-kit migrate
 */