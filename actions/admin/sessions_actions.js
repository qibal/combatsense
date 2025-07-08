'use server';

import { db } from '@/lib/db';
import { training_sessions, training_locations, users, session_participants, session_commanders } from '@/lib/schema';
import { eq, desc, sql, and, inArray, ne } from 'drizzle-orm';

/**
 * Mengambil semua data sesi latihan dengan data terkait.
 * - Join dengan lokasi untuk mendapatkan nama lokasi.
 * - Join dengan session_commanders untuk mendapatkan nama komandan.
 * - Menghitung jumlah peserta untuk setiap sesi.
 */
export async function getAllSessionsData() {
    try {
        // Subquery untuk menghitung jumlah peserta
        const participantSubquery = db
            .select({
                session_id: session_participants.session_id,
                count: sql`count(${session_participants.user_id})`.mapWith(Number).as('participant_count'),
            })
            .from(session_participants)
            .groupBy(session_participants.session_id)
            .as('participant_counts');

        // Subquery untuk mendapatkan komandan pertama dari setiap sesi
        const commanderSubquery = db
            .select({
                session_id: session_commanders.session_id,
                commander_name: users.full_name,
            })
            .from(session_commanders)
            .leftJoin(users, eq(session_commanders.user_id, users.id))
            .where(eq(session_commanders.status, 'ikut'))
            .limit(1)
            .as('commander_data');

        const sessions = await db.select({
            id: training_sessions.id,
            name: training_sessions.name,
            status: training_sessions.status,
            scheduled_at: training_sessions.scheduled_at,
            location_name: training_locations.name,
            commander_name: commanderSubquery.commander_name,
            participant_count: sql`COALESCE(${participantSubquery.count}, 0)`.mapWith(Number),
        })
            .from(training_sessions)
            .leftJoin(training_locations, eq(training_sessions.location_id, training_locations.id))
            .leftJoin(commanderSubquery, eq(training_sessions.id, commanderSubquery.session_id))
            .leftJoin(participantSubquery, eq(training_sessions.id, participantSubquery.session_id))
            .orderBy(desc(training_sessions.scheduled_at));

        return { success: true, data: sessions };

    } catch (error) {
        console.error("Error getting all sessions data:", error);
        return { success: false, message: "Gagal mengambil data sesi dari database." };
    }
}

export async function checkScheduleConflict(userIds, scheduledAt) {
    // Cek apakah user sudah punya sesi di waktu yang sama
    const conflicts = await db.select()
        .from(session_participants)
        .innerJoin(training_sessions, eq(session_participants.session_id, training_sessions.id))
        .where(
            and(
                inArray(session_participants.user_id, userIds),
                eq(training_sessions.scheduled_at, scheduledAt),
                ne(training_sessions.status, 'dibatalkan')
            )
        );
    return conflicts;
}

export async function setSessionActive(id) {
    try {
        await db.update(training_sessions)
            .set({
                status: "berlangsung",
                actual_started_at: new Date().toISOString()
            })
            .where(eq(training_sessions.id, id));
        return { success: true };
    } catch (err) {
        return { success: false, message: err.message };
    }
}

export async function setSessionFinished(id) {
    try {
        await db.update(training_sessions)
            .set({
                status: "selesai",
                actual_ended_at: new Date().toISOString()
            })
            .where(eq(training_sessions.id, id));
        return { success: true };
    } catch (err) {
        return { success: false, message: err.message };
    }
}