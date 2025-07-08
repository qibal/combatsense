"use server";
import { db } from "@/lib/db";
import { users, training_sessions, session_commanders, session_participants, session_medics, training_locations, live_monitoring_stats } from "@/lib/schema";
import { eq, and, inArray, ne } from "drizzle-orm";

import { notExists } from "drizzle-orm";
// Get semua user dengan role tertentu
export async function getUsersByRole(role) {
    const result = await db.select({
        id: users.id,
        name: users.full_name,
        email: users.email,
        role: users.role,
    }).from(users).where(users.role.eq(role));
    return result;
}

// Get semua lokasi latihan
export async function getAllLocations() {
    return await db.select({
        id: training_locations.id,
        name: training_locations.name,
    }).from(training_locations);
}

// Cek konflik jadwal untuk prajurit
export async function checkScheduleConflict(userIds, scheduledAt) {
    try {
        const conflicts = await db.select({
            user_id: session_participants.user_id,
            session_id: session_participants.session_id,
            session_name: training_sessions.name,
            scheduled_at: training_sessions.scheduled_at
        })
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
    } catch (error) {
        console.error('Error checking schedule conflict:', error);
        return [];
    }
}

export async function createSessionAction(form) {
    try {
        // Cek konflik jadwal untuk prajurit
        if (form.participants && form.participants.length > 0) {
            const conflicts = await checkScheduleConflict(form.participants, form.scheduled_at);
            if (conflicts.length > 0) {
                const conflictUsers = conflicts.map(c => c.user_id).join(', ');
                return {
                    success: false,
                    message: `Prajurit dengan ID ${conflictUsers} sudah memiliki sesi latihan di waktu yang sama.`
                };
            }
        }

        // 1. Insert ke training_sessions
        const [session] = await db.insert(training_sessions).values({
            name: form.name,
            description: form.description,
            scheduled_at: form.scheduled_at,
            location_id: Number(form.location_id),
            status: "direncanakan"
        }).returning({ id: training_sessions.id });

        // 2. Insert ke session_commanders
        await Promise.all(
            form.commanders.map(user_id =>
                db.insert(session_commanders).values({ session_id: session.id, user_id })
            )
        );
        // 3. Insert ke session_participants
        await Promise.all(
            form.participants.map(user_id =>
                db.insert(session_participants).values({ session_id: session.id, user_id })
            )
        );
        // 4. Insert ke session_medics
        await Promise.all(
            form.medics.map(user_id =>
                db.insert(session_medics).values({ session_id: session.id, user_id })
            )
        );

        return { success: true };
    } catch (err) {
        return { success: false, message: err.message };
    }
}

// Ambil semua sesi latihan beserta relasi
export async function getAllSessions() {
    // Ambil semua sesi
    const sessions = await db.select().from(training_sessions);

    // Untuk setiap sesi, ambil peserta, komandan, medis, lokasi
    const sessionsWithDetails = await Promise.all(sessions.map(async (session) => {
        // Ambil peserta
        const participants = await db.select({
            id: users.id,
            full_name: users.full_name,
            avatar: users.avatar,
            unit_id: users.unit_id,
            rank_id: users.rank_id,
        })
            .from(session_participants)
            .innerJoin(users, eq(session_participants.user_id, users.id))
            .where(eq(session_participants.session_id, session.id));

        // Ambil komandan
        const commanders = await db.select({
            id: users.id,
            full_name: users.full_name,
        })
            .from(session_commanders)
            .innerJoin(users, eq(session_commanders.user_id, users.id))
            .where(eq(session_commanders.session_id, session.id));

        // Ambil medis
        const medics = await db.select({
            id: users.id,
            full_name: users.full_name,
        })
            .from(session_medics)
            .innerJoin(users, eq(session_medics.user_id, users.id))
            .where(eq(session_medics.session_id, session.id));

        // Ambil lokasi
        const location = await db.select().from(training_locations).where(eq(training_locations.id, session.location_id));

        return {
            ...session,
            participants,
            commanders,
            medics,
            location: location[0] || null,
        };
    }));

    return sessionsWithDetails;
}
export async function getAvailableUsersByRole(role, scheduledAt = null) {
    // Cek di semua relasi, hanya ambil user yang tidak punya status "ikut" di sesi "berlangsung"
    let relasiTable;
    if (role === "komandan") relasiTable = session_commanders;
    else if (role === "medis") relasiTable = session_medics;
    else relasiTable = session_participants;

    // Query: user yang tidak punya sesi di waktu yang sama (jika scheduledAt diberikan)
    let whereCondition;

    if (scheduledAt) {
        // Filter berdasarkan waktu yang dipilih
        whereCondition = and(
            eq(users.role, role),
            notExists(
                db.select()
                    .from(relasiTable)
                    .innerJoin(training_sessions, eq(relasiTable.session_id, training_sessions.id))
                    .where(
                        and(
                            eq(relasiTable.user_id, users.id),
                            eq(training_sessions.scheduled_at, scheduledAt),
                            ne(training_sessions.status, 'dibatalkan')
                        )
                    )
            )
        );
    } else {
        // Filter berdasarkan sesi aktif (behavior lama)
        whereCondition = and(
            eq(users.role, role),
            notExists(
                db.select()
                    .from(relasiTable)
                    .where(
                        and(
                            eq(relasiTable.user_id, users.id),
                            eq(relasiTable.status, "ikut")
                        )
                    )
            )
        );
    }

    const result = await db.select()
        .from(users)
        .where(whereCondition);

    return result;
}
export async function getSessionById(id) {
    // Ambil sesi latihan beserta relasi peserta, komandan, medis, lokasi
    const sessions = await getAllSessions();
    return sessions.find(s => s.id === Number(id)) || null;
}
export async function updateSessionAction(id, form) {
    try {
        // Update data utama sesi
        await db.update(training_sessions)
            .set({
                name: form.name,
                description: form.description,
                scheduled_at: form.scheduled_at,
                location_id: Number(form.location_id),
                // status: ... (jika ingin bisa update status)
            })
            .where(eq(training_sessions.id, id));

        // (Opsional) Update relasi peserta, komandan, medis
        // Biasanya: hapus semua relasi lama, insert ulang dari form

        // ...implementasi update relasi...

        return { success: true };
    } catch (err) {
        return { success: false, message: err.message };
    }
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
export async function setSessionCancelled(sessionId) {
    try {
        await db.update(training_sessions)
            .set({ status: "dibatalkan" })
            .where(eq(training_sessions.id, sessionId));
        return { success: true };
    } catch (err) {
        return { success: false, message: err.message };
    }
}
export async function getSessionStats(sessionId) {
    const stats = await db.select().from(live_monitoring_stats).where(eq(live_monitoring_stats.session_id, sessionId));
    return stats;
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