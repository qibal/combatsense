import { defineConfig } from 'drizzle-kit';
import 'dotenv/config';

/**
 * Konfigurasi Drizzle Kit.
 * File ini digunakan oleh Drizzle untuk menghasilkan file migrasi SQL
 * berdasarkan skema yang didefinisikan di './model/schema.js'.
 */
export default defineConfig({
    schema: './lib/schema.js',      // Path ke file schema database
    out: './database', // Direktori output untuk file migrasi
    dialect: 'postgresql',          // Tipe database yang digunakan
    dbCredentials: {
        url: process.env.DATABASE_URL, // Mengambil URL database dari environment variable
    },
    verbose: true, // Menampilkan output yang lebih detail saat menjalankan perintah drizzle-kit
    strict: true,  // Mode ketat untuk memastikan konsistensi
});

/**
 * Cara penggunaan:
 * 
 * File ini tidak dijalankan secara langsung.
 * Drizzle Kit akan menggunakan file ini saat Anda menjalankan perintah dari terminal,
 * seperti `npx drizzle-kit generate` untuk membuat file migrasi SQL baru
 * setiap kali Anda mengubah skema di `./model/schema.js`.
 */