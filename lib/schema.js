import { pgTable, serial, varchar, text, timestamp, integer, date, real, pgEnum, bigint, decimal, primaryKey } from "drizzle-orm/pg-core";

// Enum untuk role pengguna, agar konsisten
export const userRoleEnum = pgEnum('user_role', ['admin', 'komandan', 'medis', 'prajurit']);
export const sessionStatusEnum = pgEnum('session_status', ['direncanakan', 'berlangsung', 'selesai', 'dibatalkan']);

/**
 * Tabel `ranks` (Pangkat)
 * Menyimpan semua jenis pangkat yang ada.
 * direferensikan oleh tabel `users`.
 */
export const ranks = pgTable('ranks', {
    id: serial('id').primaryKey(),
    name: varchar('name', { length: 256 }).notNull().unique(),
});

/**
 * Tabel `units` (Unit/Kesatuan)
 * Menyimpan semua jenis unit/kesatuan.
 * direferensikan oleh tabel `users`.
 */
export const units = pgTable('units', {
    id: serial('id').primaryKey(),
    name: varchar('name', { length: 256 }).notNull().unique(),
});

/**
 * Tabel `users` (Pengguna)
 * Tabel inti yang menyimpan data semua pengguna sistem.
 * Mencakup detail profil yang lebih lengkap.
 */
export const users = pgTable('users', {
    id: serial('id').primaryKey(),
    full_name: varchar('full_name', { length: 256 }).notNull(),
    email: varchar('email', { length: 256 }).notNull().unique(),
    password_hash: text('password_hash').notNull(),
    role: userRoleEnum('role').notNull(),
    avatar: text('avatar'),
    join_date: date('join_date'),
    height_cm: integer('height_cm'),
    weight_kg: real('weight_kg'),
    
    // Relasi
    rank_id: integer('rank_id').references(() => ranks.id),
    unit_id: integer('unit_id').references(() => units.id),
});

/**
 * Tabel `training_locations` (Lokasi Latihan)
 * Menyimpan informasi tentang tempat-tempat yang bisa digunakan untuk latihan.
 */
export const training_locations = pgTable('training_locations', {
    id: serial('id').primaryKey(),
    name: varchar('name', { length: 256 }).notNull(),
    description: text('description'),
    map_image_url: text('map_image_url'), // URL ke gambar peta, seperti di /prajurit/page.js
});

/**
 * Tabel `training_sessions` (Sesi Latihan)
 * Mencatat setiap sesi latihan, komandan, lokasi, dan statusnya.
 */
export const training_sessions = pgTable('training_sessions', {
    id: serial('id').primaryKey(),
    name: varchar('name', { length: 256 }).notNull(),
    description: text('description'),
    scheduled_at: timestamp('scheduled_at', { withTimezone: true, mode: 'string' }).notNull(),
    status: sessionStatusEnum('status').notNull().default('direncanakan'),

    // Relasi
    location_id: integer('location_id').references(() => training_locations.id),
    commander_id: integer('commander_id').references(() => users.id), // Komandan yang memimpin
});

/**
 * Tabel `session_participants` (Peserta Sesi)
 * Tabel penghubung untuk relasi Many-to-Many antara users dan training_sessions.
 * Menandakan prajurit mana yang ikut serta dalam sesi mana.
 */
export const session_participants = pgTable('session_participants', {
    session_id: integer('session_id').notNull().references(() => training_sessions.id),
    user_id: integer('user_id').notNull().references(() => users.id),
}, (table) => {
    return {
        pk: primaryKey({ columns: [table.session_id, table.user_id] }), // Composite Primary Key
    };
});


/**
 * Tabel `medical_records` (Rekam Medis)
 * Menyimpan riwayat pemeriksaan kesehatan untuk setiap prajurit.
 * Dibuat oleh pengguna dengan role 'medis'.
 */
export const medical_records = pgTable('medical_records', {
    id: serial('id').primaryKey(),
    checkup_date: date('checkup_date').notNull(),
    general_condition: text('general_condition'),
    notes: text('notes'),
    weight_kg: real('weight_kg'),
    height_cm: integer('height_cm'),
    blood_pressure: varchar('blood_pressure', { length: 50 }),
    pulse: integer('pulse'), // denyut nadi (bpm)
    temperature: real('temperature'), // suhu (celcius)
    other_diseases: text('other_diseases'),
    
    // Relasi
    user_id: integer('user_id').notNull().references(() => users.id), // Prajurit yang diperiksa
    examiner_id: integer('examiner_id').references(() => users.id), // Medis yang memeriksa
});

/**
 * Tabel `live_monitoring_stats` (Statistik Monitoring Live)
 * Menyimpan data time-series dari device prajurit selama sesi latihan.
 * Tabel ini akan menjadi sangat besar.
 */
export const live_monitoring_stats = pgTable('live_monitoring_stats', {
    id: bigserial('id', { mode: 'number' }).primaryKey(),
    timestamp: timestamp('timestamp', { withTimezone: true, mode: 'string' }).notNull(),
    heart_rate: integer('heart_rate'), // bpm
    speed_kph: real('speed_kph'), // km/h
    // Menggunakan tipe data `decimal` untuk presisi Lintang & Bujur
    latitude: decimal('latitude', { precision: 9, scale: 6 }), 
    longitude: decimal('longitude', { precision: 9, scale: 6 }),

    // Relasi
    session_id: integer('session_id').notNull().references(() => training_sessions.id),
    user_id: integer('user_id').notNull().references(() => users.id),
}); 