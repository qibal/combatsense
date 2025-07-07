'use server';

import { db } from '@/lib/db';
import { training_sessions, session_participants, users, live_monitoring_stats } from '@/lib/schema';
import { eq, desc, inArray, and, isNotNull } from 'drizzle-orm';

/**
 * Mendapatkan posisi terakhir dari semua prajurit yang ada di sesi aktif.
 */
export async function getActiveSoldierPositions() {
    try {
        // 1. Cari sesi yang sedang berlangsung
        const activeSession = await db.query.training_sessions.findFirst({
            where: eq(training_sessions.status, 'berlangsung'),
            columns: { id: true }
        });

        if (!activeSession) {
            return { success: true, data: [] }; // Tidak ada sesi aktif
        }

        // 2. Dapatkan ID peserta di sesi tersebut
        const participants = await db.query.session_participants.findMany({
            where: eq(session_participants.session_id, activeSession.id),
            columns: { user_id: true }
        });

        if (participants.length === 0) {
            return { success: true, data: [] }; // Tidak ada peserta
        }

        const participantIds = participants.map(p => p.user_id);

        // 3. Ambil data posisi TERBARU untuk setiap peserta
        const latestPositions = await db.selectDistinctOn([live_monitoring_stats.user_id], {
            userId: live_monitoring_stats.user_id,
            latitude: live_monitoring_stats.latitude,
            longitude: live_monitoring_stats.longitude,
            timestamp: live_monitoring_stats.timestamp,
            fullName: users.full_name
        })
            .from(live_monitoring_stats)
            .leftJoin(users, eq(live_monitoring_stats.user_id, users.id))
            .where(and(
                inArray(live_monitoring_stats.user_id, participantIds),
                isNotNull(live_monitoring_stats.latitude),
                isNotNull(live_monitoring_stats.longitude)
            ))
            .orderBy(live_monitoring_stats.user_id, desc(live_monitoring_stats.timestamp));

        return { success: true, data: latestPositions };

    } catch (error) {
        console.error("Error getting active soldier positions:", error);
        return { success: false, message: "Gagal mengambil data posisi prajurit." };
    }
} 