'use server';

import { db } from '@/lib/db';
import { training_sessions, session_participants, users, ranks, units, live_monitoring_stats } from '@/lib/schema';
import { eq, desc, inArray } from 'drizzle-orm';

/**
 * Mendapatkan daftar peserta dari sesi latihan yang sedang aktif.
 * Mengambil detail lengkap setiap peserta (nama, pangkat, unit, avatar).
 */
export async function getActiveSessionParticipants() {
    try {
        // 1. Cari ID sesi yang sedang berlangsung
        const activeSession = await db.query.training_sessions.findFirst({
            where: eq(training_sessions.status, 'berlangsung'),
            columns: { id: true }
        });

        if (!activeSession) {
            return { success: true, data: [] }; // Tidak ada sesi aktif, kembalikan array kosong
        }

        // 2. Dapatkan ID semua peserta dari sesi aktif tersebut
        const participants = await db.query.session_participants.findMany({
            where: eq(session_participants.session_id, activeSession.id),
            columns: { user_id: true }
        });

        if (participants.length === 0) {
            return { success: true, data: [] }; // Tidak ada peserta dalam sesi aktif
        }

        const participantIds = participants.map(p => p.user_id);

        // 3. Dapatkan detail lengkap para peserta dengan join ke tabel lain
        const fullParticipantDetails = await db.select({
            id: users.id,
            full_name: users.full_name,
            avatar: users.avatar,
            rank_name: ranks.name,
            unit_name: units.name
        })
            .from(users)
            .leftJoin(ranks, eq(users.rank_id, ranks.id))
            .leftJoin(units, eq(users.unit_id, units.id))
            .where(inArray(users.id, participantIds));

        return { success: true, data: fullParticipantDetails };

    } catch (error) {
        console.error('Error getting active session participants:', error);
        return { success: false, message: 'Gagal mendapatkan data peserta dari sesi aktif.' };
    }
}

/**
 * Mengambil data monitoring terbaru untuk daftar pengguna tertentu.
 * @param {number[]} userIds - Array dari ID pengguna yang datanya akan diambil.
 */
export async function getLatestMonitoringStats(userIds) {
    if (!userIds || userIds.length === 0) {
        return { success: true, data: {} };
    }

    try {
        // Query ini secara efisien mengambil HANYA baris data terbaru untuk setiap user_id
        const latestStats = await db.selectDistinctOn([live_monitoring_stats.user_id], {
            user_id: live_monitoring_stats.user_id,
            heart_rate: live_monitoring_stats.heart_rate,
            speed_kph: live_monitoring_stats.speed_kph,
            timestamp: live_monitoring_stats.timestamp,
        })
            .from(live_monitoring_stats)
            .where(inArray(live_monitoring_stats.user_id, userIds))
            .orderBy(live_monitoring_stats.user_id, desc(live_monitoring_stats.timestamp));

        // Ubah array hasil query menjadi sebuah object map agar mudah diakses di client
        const statsMap = latestStats.reduce((acc, stat) => {
            acc[stat.user_id] = stat;
            return acc;
        }, {});

        return { success: true, data: statsMap };

    } catch (error) {
        console.error('Error getting latest monitoring stats:', error);
        return { success: false, message: 'Gagal mengambil data monitoring terbaru.' };
    }
} 