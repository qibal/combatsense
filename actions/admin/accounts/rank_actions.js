'use server';

import { db } from '@/lib/db';
import { ranks, users } from '@/lib/schema';
import { revalidatePath } from 'next/cache';
import { eq, count } from 'drizzle-orm';

/**
 * Mengambil semua data pangkat dari database.
 */
export async function getRanks() {
    try {
        const allRanks = await db.select().from(ranks).orderBy(ranks.id);
        return { success: true, data: allRanks };
    } catch (error) {
        console.error('Error getting ranks:', error);
        return { success: false, message: 'Gagal mengambil data pangkat.' };
    }
}

/**
 * Menambah pangkat baru ke database.
 * @param {string} name - Nama pangkat baru.
 */
export async function addRank(name) {
    if (!name || name.trim() === '') {
        return { success: false, message: 'Nama pangkat tidak boleh kosong.' };
    }

    try {
        await db.insert(ranks).values({ name: name.trim() });
        revalidatePath('/admin/accounts');
        return { success: true, message: 'Pangkat berhasil ditambahkan.' };
    } catch (error) {
        console.error('Error adding rank:', error);
        return { success: false, message: 'Gagal menambahkan pangkat. Kemungkinan nama sudah ada.' };
    }
}

/**
 * Memperbarui nama pangkat yang ada di database.
 * @param {number} id - ID dari pangkat yang akan diperbarui.
 * @param {string} name - Nama baru untuk pangkat.
 */
export async function updateRank(id, name) {
    if (!name || name.trim() === '') {
        return { success: false, message: 'Nama pangkat tidak boleh kosong.' };
    }

    try {
        await db.update(ranks).set({ name: name.trim() }).where(eq(ranks.id, id));
        revalidatePath('/admin/accounts');
        return { success: true, message: 'Pangkat berhasil diperbarui.' };
    } catch (error) {
        console.error('Error updating rank:', error);
        return { success: false, message: 'Gagal memperbarui pangkat. Kemungkinan nama sudah ada.' };
    }
}

/**
 * Menghapus pangkat dari database.
 * Pangkat tidak dapat dihapus jika masih digunakan oleh pengguna.
 * @param {number} rankId - ID dari pangkat yang akan dihapus.
 */
export async function deleteRank(rankId) {
    try {
        // Cek apakah pangkat masih digunakan oleh pengguna
        const userCount = await db.select({ value: count() }).from(users).where(eq(users.rank_id, rankId));
        if (userCount[0].value > 0) {
            return { success: false, message: 'Pangkat tidak dapat dihapus karena masih digunakan oleh pengguna.' };
        }

        await db.delete(ranks).where(eq(ranks.id, rankId));
        revalidatePath('/admin/accounts');
        return { success: true, message: 'Pangkat berhasil dihapus.' };
    } catch (error) {
        console.error('Error deleting rank:', error);
        return { success: false, message: 'Gagal menghapus pangkat.' };
    }
} 