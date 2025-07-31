import { cookies } from 'next/headers';
import * as jose from 'jose';

/**
 * Mendapatkan user ID dari cookies session
 * @returns {number|null} User ID atau null jika tidak ada session
 */
export async function getCurrentUserId() {
    try {
        const session = cookies().get('session')?.value;
        if (!session) return null;

        const secret = new TextEncoder().encode(process.env.JWT_SECRET);
        const { payload } = await jose.jwtVerify(session, secret);

        return payload.id ? Number(payload.id) : null;
    } catch (error) {
        console.error('Error getting current user ID:', error);
        return null;
    }
}

/**
 * Mendapatkan data user lengkap dari cookies session
 * @returns {object|null} User data atau null jika tidak ada session
 */
export async function getCurrentUser() {
    try {
        const session = cookies().get('session')?.value;
        if (!session) return null;

        const secret = new TextEncoder().encode(process.env.JWT_SECRET);
        const { payload } = await jose.jwtVerify(session, secret);

        return payload;
    } catch (error) {
        console.error('Error getting current user:', error);
        return null;
    }
} 