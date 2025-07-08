"use server";

import { db } from "@/lib/db";
import { eq, and, sql } from "drizzle-orm";
import { training_sessions, users, session_participants, live_monitoring_stats } from "@/lib/schema";

const LOGGED_IN_USER_ID = 1; // Ubah ke number

export async function getTrainingHistory() {
    try {
        const history = await db.select({
            id: training_sessions.id,
            sessionName: training_sessions.name,
            date: training_sessions.scheduled_at,
            duration: sql`'2 jam'`, // Temporary - nanti bisa dihitung dari data
            // Statistik dummy untuk saat ini, karena perlu agregasi kompleks
            avgHeartRate: sql`100`,
            totalDistance: sql`5.2`,
            performance: sql`'baik'`
        })
            .from(session_participants)
            .leftJoin(training_sessions, eq(session_participants.session_id, training_sessions.id))
            .where(and(
                eq(session_participants.user_id, LOGGED_IN_USER_ID),
                eq(training_sessions.status, 'selesai') // Hanya ambil sesi yang sudah selesai
            ));

        // Pastikan data aman untuk serialisasi
        const safeHistory = history.map(item => ({
            id: item.id,
            sessionName: item.sessionName,
            date: item.date ? new Date(item.date).toISOString() : null,
            duration: item.duration,
            myStats: {
                avgHeartRate: item.avgHeartRate || 0,
                totalDistance: item.totalDistance || 0,
                performance: item.performance || 'baik'
            }
        }));

        // Validasi serialisasi untuk memastikan data aman
        try {
            JSON.stringify(safeHistory);
            return { success: true, data: safeHistory };
        } catch (serializeError) {
            console.error("Error serializing training history:", serializeError);
            return {
                success: false,
                message: "Terjadi kesalahan saat memproses data histori latihan."
            };
        }

    } catch (error) {
        console.error("Error fetching training history:", error);
        return { success: false, message: error.message };
    }
}

/**
 * Mengambil detail lengkap dari satu sesi latihan histori.
 * @param {string} sessionId - ID dari sesi latihan.
 * @returns {Promise<object>} - Objek yang berisi detail sesi dan data statistik.
 */
export async function getHistoryDetail(sessionId) {
    if (!sessionId) {
        return { success: false, message: "Session ID tidak valid." };
    }

    try {
        const id = parseInt(sessionId, 10);

        // 1. Mengambil detail sesi latihan
        const sessionDetails = await db.query.training_sessions.findFirst({
            where: eq(training_sessions.id, id),
            with: {
                location: true,
            }
        });

        if (!sessionDetails) {
            return { success: false, message: "Sesi latihan tidak ditemukan." };
        }

        // 2. Mengambil semua data statistik untuk sesi ini
        const statistics = await db.query.live_monitoring_stats.findMany({
            where: eq(live_monitoring_stats.session_id, id),
            orderBy: (stats, { asc }) => [asc(stats.timestamp)], // Urutkan berdasarkan waktu
        });

        // Pastikan data timestamp dikonversi ke string untuk serialisasi yang aman
        const response = {
            id: sessionDetails.id,
            name: sessionDetails.name,
            description: sessionDetails.description,
            scheduled_at: sessionDetails.scheduled_at ? new Date(sessionDetails.scheduled_at).toISOString() : null,
            status: sessionDetails.status,
            commander_name: 'Komandan Default', // Temporary - nanti bisa diambil dari session_commanders
            location_name: sessionDetails.location?.name || 'N/A',
            statistics: statistics.map(s => ({
                timestamp: s.timestamp ? new Date(s.timestamp).toISOString() : null,
                heart_rate: s.heart_rate || 0,
                speed_kph: s.speed_kph || 0,
                latitude: s.latitude ? parseFloat(s.latitude) : null,
                longitude: s.longitude ? parseFloat(s.longitude) : null,
                user_id: s.user_id
            }))
        };

        // Validasi tambahan untuk memastikan data aman untuk serialisasi
        try {
            // Test serialisasi untuk memastikan tidak ada circular reference
            JSON.stringify(response);
            return { success: true, data: response };
        } catch (serializeError) {
            console.error("Error serializing response:", serializeError);
            return {
                success: false,
                message: "Terjadi kesalahan saat memproses data histori."
            };
        }

    } catch (error) {
        console.error(`Error fetching history detail for session ${sessionId}:`, error);
        return { success: false, message: "Terjadi kesalahan saat mengambil data histori." };
    }
} 