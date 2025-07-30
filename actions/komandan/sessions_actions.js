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
export async function checkScheduleConflict(userIds, scheduledAt, excludeSessionId = null) {
    try {
        let whereConditions = [
            inArray(session_participants.user_id, userIds),
            eq(training_sessions.scheduled_at, scheduledAt),
            ne(training_sessions.status, 'dibatalkan')
        ];

        if (excludeSessionId !== null) {
            whereConditions.push(ne(training_sessions.id, excludeSessionId));
        }

        const conflicts = await db.select({
            user_id: session_participants.user_id,
            session_id: session_participants.session_id,
            session_name: training_sessions.name,
            scheduled_at: training_sessions.scheduled_at
        })
            .from(session_participants)
            .innerJoin(training_sessions, eq(session_participants.session_id, training_sessions.id))
            .where(and(...whereConditions));
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

export async function getAvailableUsersByRole(role, scheduledAt = null, excludeSessionId = null) {
    let relasiTable;
    if (role === "komandan") relasiTable = session_commanders;
    else if (role === "medis") relasiTable = session_medics;
    else relasiTable = session_participants;

    let whereConditions = [
        eq(users.role, role),
        notExists(
            db.select()
                .from(relasiTable)
                .innerJoin(training_sessions, eq(relasiTable.session_id, training_sessions.id))
                .where(
                    and(
                        eq(relasiTable.user_id, users.id),
                        eq(training_sessions.scheduled_at, scheduledAt),
                        ne(training_sessions.status, 'dibatalkan'),
                        ...(excludeSessionId !== null ? [ne(training_sessions.id, excludeSessionId)] : [])
                    )
                )
        )
    ];

    const result = await db.select()
        .from(users)
        .where(and(...whereConditions));

    return result;
}

export async function getSessionById(id) {
    // Ambil sesi berdasarkan ID
    const [session] = await db.select().from(training_sessions).where(eq(training_sessions.id, Number(id)));

    if (!session) return null;

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
}

export async function updateSessionAction(id, form) {
    try {
        await db.transaction(async (tx) => {
            // 1. Update data utama sesi
            await tx.update(training_sessions)
                .set({
                    name: form.name,
                    description: form.description,
                    scheduled_at: form.scheduled_at,
                    location_id: Number(form.location_id),
                })
                .where(eq(training_sessions.id, id));

            // 2. Hapus relasi lama
            await tx.delete(session_commanders).where(eq(session_commanders.session_id, id));
            await tx.delete(session_participants).where(eq(session_participants.session_id, id));
            await tx.delete(session_medics).where(eq(session_medics.session_id, id));

            // 3. Insert relasi baru
            if (form.commanders && form.commanders.length > 0) {
                await tx.insert(session_commanders).values(
                    form.commanders.map(user_id => ({ session_id: id, user_id }))
                );
            }
            if (form.participants && form.participants.length > 0) {
                await tx.insert(session_participants).values(
                    form.participants.map(user_id => ({ session_id: id, user_id }))
                );
            }
            if (form.medics && form.medics.length > 0) {
                await tx.insert(session_medics).values(
                    form.medics.map(user_id => ({ session_id: id, user_id }))
                );
            }
        });

        return { success: true, message: "Sesi latihan berhasil diperbarui." };
    } catch (err) {
        console.error("Update session error:", err);
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
    const stats = await db.select({
        timestamp: live_monitoring_stats.timestamp,
        heart_rate: live_monitoring_stats.heart_rate,
        speed_kph: live_monitoring_stats.speed_kph,
        latitude: live_monitoring_stats.latitude,
        longitude: live_monitoring_stats.longitude,
        user_id: live_monitoring_stats.user_id,
        full_name: users.full_name, // Menambahkan full_name
        avatar: users.avatar, // Menambahkan avatar
    })
        .from(live_monitoring_stats)
        .leftJoin(users, eq(live_monitoring_stats.user_id, users.id))
        .where(eq(live_monitoring_stats.session_id, sessionId));
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

export async function deleteSession(sessionId) {
    try {
        await db.transaction(async (tx) => {
            // Hapus entri terkait di tabel relasi
            await tx.delete(session_commanders).where(eq(session_commanders.session_id, sessionId));
            await tx.delete(session_participants).where(eq(session_participants.session_id, sessionId));
            await tx.delete(session_medics).where(eq(session_medics.session_id, sessionId));
            await tx.delete(live_monitoring_stats).where(eq(live_monitoring_stats.session_id, sessionId));

            // Hapus sesi utama
            await tx.delete(training_sessions).where(eq(training_sessions.id, sessionId));
        });
        return { success: true, message: "Sesi latihan berhasil dihapus." };
    } catch (err) {
        console.error("Error deleting session:", err);
        return { success: false, message: "Gagal menghapus sesi latihan." };
    }
}