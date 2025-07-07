import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { medical_records } from '@/lib/schema';
import { eq } from 'drizzle-orm';

export async function GET(req) {
    const { searchParams } = new URL(req.url);
    const userId = searchParams.get('userId');
    if (!userId) return NextResponse.json({ success: false, records: [] });
    const records = await db.select().from(medical_records).where(eq(medical_records.user_id, Number(userId)));
    return NextResponse.json({ success: true, records });
}