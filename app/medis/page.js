// app/medis/page.js
'use server'
import { cookies } from 'next/headers';
import { verify } from 'jsonwebtoken';
import { db } from '@/lib/db';
import { users } from '@/lib/schema';
import MedisForm from '@/components/medis/MedisForm';
import { eq } from "drizzle-orm";
export default async function MedisPage() {
    // Ambil token dari cookie
    const cookiesStore = await cookies();
    const token = cookiesStore.get('token')?.value;
    let currentMedic = null;

    if (token) {
        try {
            const payload = verify(token, process.env.JWT_SECRET);
            // Ambil data user medis dari database
            const userList = await db.select().from(users).where(eq(users.id, payload.id));
            if (userList.length > 0) {
                currentMedic = userList[0];
            }
        } catch (e) {
            // token invalid
        }
    }

    // Ambil daftar prajurit dari database
    const soldiers = await db.select().from(users).where(eq(users.role, 'prajurit'));

    return (
        <div className="min-h-screen bg-gray-100 dark:bg-zinc-950 p-4 sm:p-6 lg:p-8">
            <div className="max-w-7xl mx-auto">
                <MedisForm soldiers={soldiers} currentMedic={currentMedic} />
            </div>
        </div>
    );
}