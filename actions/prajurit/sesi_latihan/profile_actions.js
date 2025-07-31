"use server";

import { db } from "@/lib/db";
import { users, ranks, units, medical_records } from "@/lib/schema";
import { eq } from "drizzle-orm";
import { getCurrentUserId } from "@/lib/auth-utils";

export async function getPrajuritProfile() {
    try {
        const currentUserId = await getCurrentUserId();
        if (!currentUserId) {
            return { success: false, message: "User tidak terautentikasi" };
        }

        const userProfile = await db.select({
            name: users.full_name,
            username: users.email,
            avatar: users.avatar,
            joinDate: users.join_date,
            rank: ranks.name,
            unit: units.name,
        })
            .from(users)
            .leftJoin(ranks, eq(users.rank_id, ranks.id))
            .leftJoin(units, eq(users.unit_id, units.id))
            .where(eq(users.id, currentUserId))
            .limit(1);

        if (!userProfile || userProfile.length === 0) {
            return { success: false, message: "Profil prajurit tidak ditemukan." };
        }

        return { success: true, data: userProfile[0] };

    } catch (error) {
        console.error("Error fetching prajurit profile:", error);
        return { success: false, message: error.message };
    }
}

export async function getMedicalHistory() {
    try {
        const currentUserId = await getCurrentUserId();
        if (!currentUserId) {
            return { success: false, message: "User tidak terautentikasi" };
        }

        const history = await db.select().from(medical_records).where(eq(medical_records.user_id, currentUserId));
        return { success: true, data: history };
    } catch (error) {
        console.error("Error fetching medical history:", error);
        return { success: false, message: error.message };
    }
} 