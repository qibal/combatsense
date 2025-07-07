"use server";
import { db } from "@/lib/db";

import { eq } from "drizzle-orm";
import { users, units, ranks, medical_records } from "@/lib/schema";
export async function getAllPrajurit() {
    return await db.select({
        id: users.id,
        full_name: users.full_name,
        email: users.email,
        unit_id: users.unit_id,
        unit_name: units.name,
        rank_id: users.rank_id,
        rank_name: ranks.name,
        is_active: users.is_active,
        avatar: users.avatar,
    })
        .from(users)
        .leftJoin(units, eq(users.unit_id, units.id))
        .leftJoin(ranks, eq(users.rank_id, ranks.id))
        .where(eq(users.role, "prajurit"));
} export async function getPrajuritDetail(prajuritId) {
    // Ambil data prajurit
    const prajurit = await db.select({
        id: users.id,
        full_name: users.full_name,
        email: users.email,
        unit_id: users.unit_id,
        unit_name: units.name,
        rank_id: users.rank_id,
        rank_name: ranks.name,
        is_active: users.is_active,
        avatar: users.avatar,
    })
        .from(users)
        .leftJoin(units, eq(users.unit_id, units.id))
        .leftJoin(ranks, eq(users.rank_id, ranks.id))
        .where(eq(users.id, prajuritId));

    // Ambil medical history
    const medicalHistory = await db.select().from(medical_records).where(eq(medical_records.user_id, prajuritId));

    return {
        ...prajurit[0],
        medicalHistory,
    };
}