const { pgTable, serial, varchar, timestamp, boolean, integer } = require('drizzle-orm/pg-core');
const { unitTable } = require('./unit');
const { rankTable } = require('./rank');

/**
 * Model Users Table (Updated dengan foreign key ke unit dan rank)
 * Menyimpan data user untuk sistem authentication dan role management
 * Role: prajurit, komandan, medis, admin
 */
const usersTable = pgTable('users', {
  user_id: serial('user_id').primaryKey(),
  username: varchar('username', { length: 50 }).notNull().unique(),
  password_hash: varchar('password_hash', { length: 255 }).notNull(),
  full_name: varchar('full_name', { length: 100 }).notNull(),
  role: varchar('role', { length: 20 }).notNull(), // prajurit, komandan, medis, admin
  unit_id: integer('unit_id').references(() => unitTable.unit_id), // foreign key ke unit
  rank_id: integer('rank_id').references(() => rankTable.rank_id), // foreign key ke rank
  avatar: varchar('avatar', { length: 255 }),
  is_active: boolean('is_active').default(true),
  created_at: timestamp('created_at').defaultNow(),
  updated_at: timestamp('updated_at').defaultNow(),
});

module.exports = {
  usersTable
};

/**
 * Cara penggunaan:
 * 
 * // Import di repository
 * const { usersTable } = require('../model/users');
 * const { unitTable } = require('../model/unit');
 * const { rankTable } = require('../model/rank');
 * 
 * // Query user dengan join unit dan rank
 * const usersWithDetails = await db
 *   .select({
 *     user_id: usersTable.user_id,
 *     username: usersTable.username,
 *     full_name: usersTable.full_name,
 *     role: usersTable.role,
 *     unit_name: unitTable.unit_name,
 *     rank_name: rankTable.rank_name
 *   })
 *   .from(usersTable)
 *   .leftJoin(unitTable, eq(usersTable.unit_id, unitTable.unit_id))
 *   .leftJoin(rankTable, eq(usersTable.rank_id, rankTable.rank_id));
 * 
 * // Insert user baru dengan unit dan rank
 * const newUser = await db.insert(usersTable).values({
 *   username: 'budi123',
 *   password_hash: 'hashed_password',
 *   full_name: 'Budi Santoso',
 *   role: 'prajurit',
 *   unit_id: 1, // reference ke unit table
 *   rank_id: 2  // reference ke rank table
 * });
 */