const { pgTable, serial, varchar, text, timestamp, boolean } = require('drizzle-orm/pg-core');

/**
 * Model Unit Table
 * Menyimpan data unit untuk sistem militer
 */
const unitTable = pgTable('unit', {
  unit_id: serial('unit_id').primaryKey(),
  unit_name: varchar('unit_name', { length: 100 }).notNull().unique(),
  is_active: boolean('is_active').default(true),
  created_at: timestamp('created_at').defaultNow(),
  updated_at: timestamp('updated_at').defaultNow(),
});

module.exports = {
  unitTable
};

/**
 * Cara penggunaan:
 * 
 * // Import di repository
 * const { unitTable } = require('../model/unit');
 * 
 * // Query contoh
 * const allUnits = await db.select().from(unitTable);
 * const newUnit = await db.insert(unitTable).values({
 *   unit_name: 'Kompi A Rajawali',
 *   unit_description: 'Kompi tempur utama'
 * });
 * 
 * // Get active units
 * const activeUnits = await db.select().from(unitTable).where(eq(unitTable.is_active, true));
 */