"use server";

import { db } from "@/lib/db";
import { eq, and, sql } from "drizzle-orm";
import { training_sessions, users, session_participants, live_monitoring_stats } from "@/lib/schema";
import { getCurrentUserId } from "@/lib/auth-utils";

export async function getTrainingHistory() {
    try {
        const currentUserId = await getCurrentUserId();
        if (!currentUserId) {
            return { success: false, message: "User tidak terautentikasi" };
        }

        // Debug: Cek apakah ada data di tabel training_sessions
        const allSessions = await db.select().from(training_sessions);
        console.log("DEBUG HISTORY: Total sessions in database:", allSessions.length);
        console.log("DEBUG HISTORY: All sessions data:", allSessions);

        // Debug: Cek apakah ada data di tabel session_participants
        const allParticipants = await db.select().from(session_participants);
        console.log("DEBUG HISTORY: Total participants in database:", allParticipants.length);
        console.log("DEBUG HISTORY: All participants data:", allParticipants);

        // Debug: Cek apakah ada data di tabel live_monitoring_stats
        const allStats = await db.select().from(live_monitoring_stats);
        console.log("DEBUG HISTORY: Total stats in database:", allStats.length);
        console.log("DEBUG HISTORY: All stats data:", allStats);

        const history = await db.select({
            id: training_sessions.id,
            sessionName: training_sessions.name,
            date: training_sessions.scheduled_at,
            // Ambil semua statistik untuk sesi ini
            stats: sql`(SELECT json_agg(json_build_object(
                'timestamp', lms.timestamp,
                'heart_rate', lms.heart_rate,
                'speed_kph', lms.speed_kph,
                'latitude', lms.latitude,
                'longitude', lms.longitude
            ) ORDER BY lms.timestamp) FROM ${live_monitoring_stats} lms WHERE lms.session_id = ${training_sessions.id})`,
        })
            .from(session_participants)
            .leftJoin(training_sessions, eq(session_participants.session_id, training_sessions.id))
            .where(and(
                eq(session_participants.user_id, currentUserId),
                eq(training_sessions.status, 'selesai')
            ));

        console.log("DEBUG HISTORY: Raw history query result:", history);

        const processedHistory = history.map(item => {
            let duration = 'N/A';
            let avgHeartRate = 'N/A';
            let totalDistance = 'N/A';
            let performance = 'baik'; // Default value

            if (item.stats && item.stats.length > 0) {
                const sortedStats = item.stats.sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime());
                const firstTimestamp = new Date(sortedStats[0].timestamp);
                const lastTimestamp = new Date(sortedStats[sortedStats.length - 1].timestamp);
                const diffMs = lastTimestamp.getTime() - firstTimestamp.getTime();

                // Calculate duration in minutes or hours
                const minutes = Math.floor(diffMs / (1000 * 60));
                const hours = Math.floor(minutes / 60);
                if (hours > 0) {
                    duration = `${hours} jam ${minutes % 60} menit`;
                } else {
                    duration = `${minutes} menit`;
                }

                // Calculate average heart rate
                const totalHeartRate = sortedStats.reduce((sum, s) => sum + Number(s.heart_rate), 0);
                avgHeartRate = (totalHeartRate / sortedStats.length).toFixed(0);

                // Calculate total distance (simple approximation)
                let distKm = 0;
                for (let i = 1; i < sortedStats.length; i++) {
                    const p1 = sortedStats[i - 1];
                    const p2 = sortedStats[i];
                    if (p1.latitude && p1.longitude && p2.latitude && p2.longitude) {
                        // Haversine formula approximation for small distances
                        const R = 6371e3; // metres
                        const φ1 = Number(p1.latitude) * Math.PI / 180; // φ, λ in radians
                        const φ2 = Number(p2.latitude) * Math.PI / 180;
                        const Δφ = (Number(p2.latitude) - Number(p1.latitude)) * Math.PI / 180;
                        const Δλ = (Number(p2.longitude) - Number(p1.longitude)) * Math.PI / 180;

                        const a = Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
                            Math.cos(φ1) * Math.cos(φ2) *
                            Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
                        const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

                        distKm += (R * c) / 1000; // in kilometres
                    }
                }
                totalDistance = distKm.toFixed(2);

                // Simple performance logic (bisa dikembangkan)
                if (Number(avgHeartRate) > 110 && Number(totalDistance) > 3) {
                    performance = 'sangat baik';
                } else if (Number(avgHeartRate) > 90 && Number(totalDistance) > 1) {
                    performance = 'baik';
                } else {
                    performance = 'cukup';
                }
            }

            return {
                id: item.id,
                sessionName: item.sessionName,
                date: item.date ? new Date(item.date).toISOString() : null,
                duration: duration,
                myStats: {
                    avgHeartRate: avgHeartRate,
                    totalDistance: totalDistance,
                    performance: performance,
                },
            };
        });

        console.log("getTrainingHistory processedHistory:", processedHistory); // Tambahkan log ini
        console.log("DEBUG HISTORY: Processed history count:", processedHistory.length);
        return { success: true, data: processedHistory };

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
        const currentUserId = await getCurrentUserId();
        if (!currentUserId) {
            return { success: false, message: "User tidak terautentikasi" };
        }

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