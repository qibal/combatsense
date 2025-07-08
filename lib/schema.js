import { pgTable, serial, varchar, text, timestamp, integer, date, real, pgEnum, bigint, decimal, primaryKey, bigserial, boolean } from "drizzle-orm/pg-core";

// Enum untuk role pengguna, agar konsisten
export const userRoleEnum = pgEnum('user_role', ['admin', 'komandan', 'medis', 'prajurit']);
export const sessionStatusEnum = pgEnum('session_status', ['direncanakan', 'berlangsung', 'selesai', 'dibatalkan']);
export const sessionUserStatusEnum = pgEnum('session_user_status', ['ikut', 'luang']);

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
    is_active: boolean('is_active').default(true).notNull(),
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
    latitude: real('latitude'),           // Koordinat latitude
    longitude: real('longitude'),         // Koordinat longitude
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
    actual_started_at: timestamp('actual_started_at', { withTimezone: true, mode: 'string' }), // Waktu mulai aktual
    actual_ended_at: timestamp('actual_ended_at', { withTimezone: true, mode: 'string' }), // Waktu selesai aktual
    status: varchar('status', { length: 32 }).notNull().default('direncanakan'),
    location_id: integer('location_id'), // relasi ke tabel lokasi
    // Tidak ada commander_id tunggal lagi!
});

// Relasi many-to-many: sesi <-> komandan
export const session_commanders = pgTable('session_commanders', {
    session_id: integer('session_id').notNull().references(() => training_sessions.id),
    user_id: integer('user_id').notNull().references(() => users.id),
    status: sessionUserStatusEnum('status').notNull().default('ikut'),
}, (table) => ({
    pk: primaryKey({ columns: [table.session_id, table.user_id] }),
}));

// Relasi many-to-many: sesi <-> prajurit
export const session_participants = pgTable('session_participants', {
    session_id: integer('session_id').notNull().references(() => training_sessions.id),
    user_id: integer('user_id').notNull().references(() => users.id),
    status: sessionUserStatusEnum('status').notNull().default('ikut'),
}, (table) => ({
    pk: primaryKey({ columns: [table.session_id, table.user_id] }),
}));

// Relasi many-to-many: sesi <-> medis
export const session_medics = pgTable('session_medics', {
    session_id: integer('session_id').notNull().references(() => training_sessions.id),
    user_id: integer('user_id').notNull().references(() => users.id),
    status: sessionUserStatusEnum('status').notNull().default('ikut'),
}, (table) => ({
    pk: primaryKey({ columns: [table.session_id, table.user_id] }),
}));

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
    glucose: real('glucose'),        // Tambahan: Gula darah (mg/dL)
    cholesterol: real('cholesterol'),// Tambahan: Kolesterol (mg/dL)
    hemoglobin: real('hemoglobin'),  // Tambahan: Hemoglobin (g/dL)
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