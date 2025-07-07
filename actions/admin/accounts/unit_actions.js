'use server';

import { db } from '@/lib/db';
import { units, users } from '@/lib/schema';
import { revalidatePath } from 'next/cache';
import { eq, count } from 'drizzle-orm';

/**
 * Mengambil semua data unit dari database.
 */
export async function getUnits() {
    try {
        const allUnits = await db.select().from(units).orderBy(units.id);
        return { success: true, data: allUnits };
    } catch (error) {
        console.error('Error getting units:', error);
        return { success: false, message: 'Gagal mengambil data unit.' };
    }
}

/**
 * Menambah unit baru ke database.
 * @param {string} name - Nama unit baru.
 */
export async function addUnit(name) {
    if (!name || name.trim() === '') {
        return { success: false, message: 'Nama unit tidak boleh kosong.' };
    }

    try {
        await db.insert(units).values({ name: name.trim() });
        revalidatePath('/admin/accounts');
        return { success: true, message: 'Unit berhasil ditambahkan.' };
    } catch (error) {
        console.error('Error adding unit:', error);
        return { success: false, message: 'Gagal menambahkan unit. Kemungkinan nama sudah ada.' };
    }
}

/**
 * Memperbarui nama unit yang ada di database.
 * @param {number} id - ID dari unit yang akan diperbarui.
 * @param {string} name - Nama baru untuk unit.
 */
export async function updateUnit(id, name) {
    if (!name || name.trim() === '') {
        return { success: false, message: 'Nama unit tidak boleh kosong.' };
    }

    try {
        await db.update(units).set({ name: name.trim() }).where(eq(units.id, id));
        revalidatePath('/admin/accounts');
        return { success: true, message: 'Unit berhasil diperbarui.' };
    } catch (error) {
        console.error('Error updating unit:', error);
        return { success: false, message: 'Gagal memperbarui unit. Kemungkinan nama sudah ada.' };
    }
}

/**
 * Menghapus unit dari database.
 * Unit tidak dapat dihapus jika masih digunakan oleh pengguna.
 * @param {number} unitId - ID dari unit yang akan dihapus.
 */
export async function deleteUnit(unitId) {
    try {
        // Cek apakah unit masih digunakan oleh pengguna
        const userCount = await db.select({ value: count() }).from(users).where(eq(users.unit_id, unitId));
        if (userCount[0].value > 0) {
            return { success: false, message: 'Unit tidak dapat dihapus karena masih digunakan oleh pengguna.' };
        }

        await db.delete(units).where(eq(units.id, unitId));
        revalidatePath('/admin/accounts');
        return { success: true, message: 'Unit berhasil dihapus.' };
    } catch (error) {
        console.error('Error deleting unit:', error);
        return { success: false, message: 'Gagal menghapus unit.' };
    }
} 