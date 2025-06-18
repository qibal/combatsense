const { pgTable, serial, varchar, text, timestamp, boolean } = require('drizzle-orm/pg-core');

/**
 * Model Rank Table
 * Menyimpan data pangkat untuk sistem militer
 */
const rankTable = pgTable('rank', {
  rank_id: serial('rank_id').primaryKey(),
  rank_name: varchar('rank_name', { length: 50 }).notNull().unique(),
  is_active: boolean('is_active').default(true),
  created_at: timestamp('created_at').defaultNow(),
  updated_at: timestamp('updated_at').defaultNow(),
});

module.exports = {
  rankTable
};

/**
 * Cara penggunaan:
 * 
 * // Import di repository
 * const { rankTable } = require('../model/rank');
 * 
 * // Query contoh
 * const allRanks = await db.select().from(rankTable);
 * const newRank = await db.insert(rankTable).values({
 *   rank_name: 'Sersan Dua',
 *   rank_description: 'Pangkat bintara rendah'
 * });
 * 
 * // Get active ranks
 * const activeRanks = await db.select().from(rankTable).where(eq(rankTable.is_active, true));
 */