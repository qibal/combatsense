"use server";

import { db } from "@/lib/db";
import { training_sessions, users, session_participants, training_locations, session_commanders } from "@/lib/schema";
import { eq, sql } from "drizzle-orm";
import { getCurrentUserId } from "@/lib/auth-utils";

export async function getAvailableSessions() {
    try {
        const currentUserId = await getCurrentUserId();
        if (!currentUserId) {
            return { success: false, message: "User tidak terautentikasi" };
        }

        // Debug: Cek apakah ada data di tabel training_sessions
        const allSessions = await db.select().from(training_sessions);
        console.log("DEBUG: Total sessions in database:", allSessions.length);
        console.log("DEBUG: All sessions data:", allSessions);

        // Debug: Cek apakah ada data di tabel session_participants
        const allParticipants = await db.select().from(session_participants);
        console.log("DEBUG: Total participants in database:", allParticipants.length);
        console.log("DEBUG: All participants data:", allParticipants);

        // Subquery ini berfungsi untuk menghitung jumlah peserta (prajurit)
        // yang sudah terdaftar di setiap sesi latihan.
        const participantsCountSubquery = db
            .select({
                sessionId: session_participants.session_id,
                // Menggunakan sql`count(...)` dari Drizzle untuk melakukan agregasi
                count: sql`count(${session_participants.user_id})`.mapWith(Number).as('participants_count')
            })
            .from(session_participants)
            .groupBy(session_participants.session_id)
            .as('participants_count_sq'); // 'as' untuk memberi alias pada subquery

        // Query utama untuk mengambil data sesi yang tersedia
        const availableSessionsRaw = await db.select({
            id: training_sessions.id,
            name: training_sessions.name,
            // 'scheduled_at' berisi tanggal dan waktu, bisa dipisah di frontend jika perlu
            date: training_sessions.scheduled_at,
            time: training_sessions.scheduled_at,
            // Join dengan lokasi untuk mendapatkan nama lokasi
            location: training_locations.name,
            status: training_sessions.status,
            // Untuk saat ini, jumlah maksimal peserta di-hardcode.
            // Sebaiknya, ini menjadi kolom di tabel `training_sessions`.
            maxParticipants: sql`20`.mapWith(Number),
            commander: users.full_name,
            // Menggunakan coalesce untuk memastikan jika tidak ada peserta (null), nilainya menjadi 0.
            participants: sql`coalesce(${participantsCountSubquery.count}, 0)`.mapWith(Number),
        })
            .from(training_sessions)
            // Join dengan tabel lokasi untuk mendapatkan nama lokasi
            .leftJoin(training_locations, eq(training_sessions.location_id, training_locations.id))
            // Join dengan tabel users untuk mendapatkan nama komandan (jika ada)
            .leftJoin(session_commanders, eq(session_commanders.session_id, training_sessions.id))
            .leftJoin(users, eq(session_commanders.user_id, users.id)) // Menggunakan users alias untuk komandan
            // Join dengan subquery untuk mendapatkan jumlah peserta
            .leftJoin(participantsCountSubquery, eq(training_sessions.id, participantsCountSubquery.sessionId))
            .where(sql`${training_sessions.status} = 'direncanakan' OR ${training_sessions.status} = 'berlangsung'`); // Hapus .distinct()

        // Filter agar hanya sesi unik berdasarkan id
        const seen = new Set();
        const availableSessions = [];
        for (const session of availableSessionsRaw) {
            if (!seen.has(session.id)) {
                availableSessions.push(session);
                seen.add(session.id);
            }
        }

        console.log("getAvailableSessions result:", availableSessions); // Tambahkan log ini
        console.log("DEBUG: Available sessions count:", availableSessions.length);

        return { success: true, data: availableSessions };
    } catch (error) {
        console.error("Error fetching available sessions:", error);
        // Mengembalikan pesan error yang lebih informatif jika terjadi masalah
        return { success: false, message: "Gagal mengambil data sesi latihan: " + error.message };
    }
}