import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { live_monitoring_stats } from "@/lib/schema";

export async function POST(req) {
    try {
        const body = await req.json();
        const { sessionId, timestamp, stats } = body;

        if (!sessionId || !timestamp || !stats || typeof stats !== "object") {
            return NextResponse.json({ success: false, message: "Data tidak lengkap" }, { status: 400 });
        }

        // Siapkan array data untuk bulk insert
        const rows = Object.entries(stats).map(([userId, stat]) => ({
            session_id: sessionId,
            user_id: Number(userId),
            timestamp,
            heart_rate: stat.heartRate,
            speed_kph: stat.speed,
            latitude: stat.lat,
            longitude: stat.lng,
        }));

        if (rows.length === 0) {
            return NextResponse.json({ success: false, message: "Tidak ada data untuk disimpan" }, { status: 400 });
        }

        // Bulk insert ke tabel live_monitoring_stats
        await db.insert(live_monitoring_stats).values(rows);

        return NextResponse.json({ success: true, count: rows.length });
    } catch (err) {
        return NextResponse.json({ success: false, message: err.message }, { status: 500 });
    }
}