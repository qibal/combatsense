"use server";
import { db } from "@/lib/db.js";
import { users } from "@/lib/schema.js";
import bcrypt from "bcrypt";
import { eq } from "drizzle-orm";

export async function createDefaultAdmin() {
    const email = "admin@gmail.com";
    const full_name = "Admin CombatSense 1";
    const password = "admin123";
    // Cek apakah sudah ada
    const existing = await db.select().from(users).where(eq(users.email, email));
    if (existing && existing.length > 0) {
        return { success: false, message: "Akun admin sudah ada." };
    }
    const password_hash = await bcrypt.hash(password, 10);
    await db.insert(users).values({
        full_name,
        email,
        password_hash,
        role: 'admin',
        is_active: true
    });
    return { success: true, message: "Akun admin berhasil dibuat! Email: " + email + ", Password: " + password };
} 