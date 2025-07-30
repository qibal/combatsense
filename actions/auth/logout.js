"use server";

import { cookies } from 'next/headers';

export async function logoutAction() {
    try {
        // Hapus cookie 'session'
        cookies().set('session', '', {
            httpOnly: true,
            path: '/',
            maxAge: 0,
        });

        return { success: true, message: 'Logout berhasil.' };
    } catch (error) {
        return { success: false, message: 'Terjadi kesalahan saat logout.' };
    }
}
