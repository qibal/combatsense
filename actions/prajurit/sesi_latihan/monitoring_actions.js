"use server";

import { db } from "@/lib/db";
import { eq, and, desc } from "drizzle-orm";
import { live_monitoring_stats, training_sessions, session_participants } from "@/lib/schema";

const LOGGED_IN_USER_ID = 1; // Ubah sesuai user yang login

/**
 * Mengambil data monitoring real-time untuk prajurit yang sedang dalam sesi aktif
 */
export async function getCurrentMonitoringData() {
    try {
        // Cari sesi yang sedang berlangsung dan prajurit terlibat
        const activeSession = await db.select({
            session_id: training_sessions.id,
            session_name: training_sessions.name,
        })
            .from(session_participants)
            .innerJoin(training_sessions, eq(session_participants.session_id, training_sessions.id))
            .where(and(
                eq(session_participants.user_id, LOGGED_IN_USER_ID),
                eq(training_sessions.status, 'berlangsung')
            ))
            .limit(1);

        if (!activeSession || activeSession.length === 0) {
            return { success: false, message: "Tidak ada sesi aktif" };
        }

        // Ambil data monitoring terbaru untuk prajurit ini
        const latestStats = await db.select({
            heart_rate: live_monitoring_stats.heart_rate,
            speed_kph: live_monitoring_stats.speed_kph,
            latitude: live_monitoring_stats.latitude,
            longitude: live_monitoring_stats.longitude,
            timestamp: live_monitoring_stats.timestamp,
        })
            .from(live_monitoring_stats)
            .where(and(
                eq(live_monitoring_stats.session_id, activeSession[0].session_id),
                eq(live_monitoring_stats.user_id, LOGGED_IN_USER_ID)
            ))
            .orderBy(desc(live_monitoring_stats.timestamp))
            .limit(1);

        if (!latestStats || latestStats.length === 0) {
            return {
                success: true,
                data: {
                    session_name: activeSession[0].session_name,
                    heart_rate: null,
                    speed_kph: null,
                    latitude: null,
                    longitude: null,
                    timestamp: null
                }
            };
        }

        return {
            success: true,
            data: {
                session_name: activeSession[0].session_name,
                ...latestStats[0]
            }
        };

    } catch (error) {
        console.error("Error fetching monitoring data:", error);
        return { success: false, message: error.message };
    }
}

/**
 * Mengambil riwayat data monitoring untuk sesi tertentu
 */
export async function getMonitoringHistory(sessionId) {
    try {
        const stats = await db.select({
            heart_rate: live_monitoring_stats.heart_rate,
            speed_kph: live_monitoring_stats.speed_kph,
            latitude: live_monitoring_stats.latitude,
            longitude: live_monitoring_stats.longitude,
            timestamp: live_monitoring_stats.timestamp,
        })
            .from(live_monitoring_stats)
            .where(and(
                eq(live_monitoring_stats.session_id, sessionId),
                eq(live_monitoring_stats.user_id, LOGGED_IN_USER_ID)
            ))
            .orderBy(live_monitoring_stats.timestamp);

        return { success: true, data: stats };

    } catch (error) {
        console.error("Error fetching monitoring history:", error);
        return { success: false, message: error.message };
    }
} 