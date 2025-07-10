'use server';

import { db } from '@/lib/db';
import { users, units, ranks } from '@/lib/schema';
import { revalidatePath } from 'next/cache';
import { eq, desc } from 'drizzle-orm';
import bcrypt from 'bcrypt';
import { z } from 'zod';

// Skema validasi untuk data pengguna menggunakan Zod
const UserSchema = z.object({
    full_name: z.string().min(1, 'Nama lengkap diperlukan.'),
    email: z.string().email('Email tidak valid.'),
    password: z.string().min(6, 'Password minimal 6 karakter.').optional().or(z.literal('')),
    role: z.enum(['admin', 'komandan', 'medis', 'prajurit'], { required_error: 'Role diperlukan.' }),
    rank_id: z.coerce.number({ invalid_type_error: 'Pangkat diperlukan.' }).min(1, 'Pangkat diperlukan.'),
    unit_id: z.coerce.number({ invalid_type_error: 'Unit diperlukan.' }).min(1, 'Unit diperlukan.'),
    is_active: z.boolean().default(true),
    birth_date: z.string().optional().nullable(), // Tambah validasi birth_date (string ISO, opsional)
});

/**
 * Mengambil semua data pengguna dengan join ke tabel unit dan pangkat.
 */
export async function getFullUsersData() {
    try {
        const fullUsers = await db.select({
            id: users.id,
            full_name: users.full_name,
            email: users.email,
            role: users.role,
            is_active: users.is_active,
            unit_name: units.name,
            rank_name: ranks.name,
            rank_id: ranks.id,
            unit_id: units.id,
            birth_date: users.birth_date, // Tambah birth_date ke hasil select
        })
            .from(users)
            .leftJoin(units, eq(users.unit_id, units.id))
            .leftJoin(ranks, eq(users.rank_id, ranks.id))
            .orderBy(desc(users.id));
        return { success: true, data: fullUsers };
    } catch (error) {
        console.error("Error getting full users data:", error);
        return { success: false, message: "Gagal mengambil data pengguna." };
    }
}

/**
 * Menambah atau memperbarui data pengguna (upsert).
 * Menggunakan Zod untuk validasi dan bcrypt untuk password.
 */
export async function upsertUser(userId, data) {

    // Jika userId ada, password tidak wajib diisi
    const schemaToUse = userId
        ? UserSchema
        : UserSchema.extend({
            password: z.string().min(6, 'Password harus memiliki minimal 6 karakter.'),
        });

    const validatedFields = schemaToUse.safeParse(data);

    if (!validatedFields.success) {
        // Mengubah format error Zod agar lebih mudah digunakan di client
        const errors = validatedFields.error.flatten().fieldErrors;
        console.error("Validation errors:", errors);
        const errorMessages = Object.entries(errors).map(([field, messages]) => `${field}: ${messages.join(', ')}`).join('; ');
        return {
            success: false,
            message: `Validasi gagal: ${errorMessages}`,
            errors: errors,
        };
    }

    const { full_name, email, password, role, rank_id, unit_id, is_active, birth_date } = validatedFields.data;

    try {
        if (userId) {
            // Logika untuk UPDATE
            const updateData = { full_name, email, role, rank_id, unit_id, is_active };

            if (password) {
                updateData.password_hash = await bcrypt.hash(password, 10);
            }
            if (birth_date) updateData.birth_date = birth_date;

            await db.update(users).set(updateData).where(eq(users.id, userId));
            revalidatePath('/admin/accounts');
            return { success: true, message: 'Pengguna berhasil diperbarui.' };

        } else {
            // Logika untuk INSERT
            const password_hash = await bcrypt.hash(password, 10);
            await db.insert(users).values({
                full_name,
                email,
                password_hash,
                role,
                rank_id,
                unit_id,
                is_active,
                birth_date: birth_date || null
            });
            revalidatePath('/admin/accounts');
            return { success: true, message: 'Pengguna berhasil ditambahkan.' };
        }
    } catch (error) {
        console.error('Upsert user error:', error);
        // Cek jika error karena email sudah ada (unique constraint)
        if (error.code === '23505') {
            return { success: false, message: 'Gagal: Email yang Anda masukkan sudah digunakan.' };
        }
        return { success: false, message: 'Terjadi kesalahan pada server saat menyimpan pengguna.' };
    }
}

/**
 * Menghapus pengguna dari database.
 * @param {number} userId - ID dari pengguna yang akan dihapus.
 */
export async function deleteUser(userId) {
    if (!userId) {
        return { success: false, message: 'ID Pengguna dibutuhkan.' };
    }
    try {
        await db.delete(users).where(eq(users.id, userId));
        revalidatePath('/admin/accounts');
        return { success: true, message: 'Pengguna berhasil dihapus.' };
    } catch (error) {
        console.error("Error deleting user:", error);
        return { success: false, message: 'Gagal menghapus pengguna.' };
    }
}

export async function insertDummyUser(role) {
    // Validasi role
    const allowedRoles = ['prajurit', 'komandan', 'medis'];
    if (!allowedRoles.includes(role)) {
        return { success: false, message: 'Role tidak valid.' };
    }
    // Ambil unit dan rank pertama
    const unit = await db.select().from(units).limit(1);
    const rank = await db.select().from(ranks).limit(1);
    if (!unit.length || !rank.length) {
        return { success: false, message: 'Unit atau pangkat belum ada di database.' };
    }
    const password = role === 'prajurit' ? 'prajurit123' : role === 'komandan' ? 'komandan123' : 'medis123';
    const password_hash = await bcrypt.hash(password, 10);
    const now = Date.now();
    const email = `${role}${now}@dummy.com`;
    const full_name = `${role.charAt(0).toUpperCase() + role.slice(1)} Dummy ${now}`;

    // Fungsi untuk generate birth_date random (usia 20-80 tahun)
    function getRandomBirthDate() {
        const today = new Date();
        const minAge = 20;
        const maxAge = 80;
        const minBirthYear = today.getFullYear() - maxAge;
        const maxBirthYear = today.getFullYear() - minAge;
        const year = Math.floor(Math.random() * (maxBirthYear - minBirthYear + 1)) + minBirthYear;
        const month = Math.floor(Math.random() * 12); // 0-11
        // Untuk menghindari tanggal invalid (misal 31 Feb), ambil tanggal max 28
        const day = Math.floor(Math.random() * 28) + 1;
        const birthDate = new Date(year, month, day);
        return birthDate.toISOString().split('T')[0]; // format YYYY-MM-DD
    }
    const birth_date = getRandomBirthDate();
    try {
        await db.insert(users).values({
            full_name,
            email,
            password_hash,
            role,
            rank_id: rank[0].id,
            unit_id: unit[0].id,
            is_active: true,
            birth_date
        });
        revalidatePath('/admin/accounts');
        return { success: true, message: `User dummy ${role} berhasil ditambahkan. Email: ${email}` };
    } catch (error) {
        return { success: false, message: 'Gagal menambah user dummy.' };
    }
} 