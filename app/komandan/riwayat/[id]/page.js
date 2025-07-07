'use client';

import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from "@/components/Shadcn/card";
import MiniMapbox from "@/components/komandan/MiniMapbox";
import { getSessionById, getSessionStats } from "@/actions/komandan/sessions_actions";
import { ChartContainer } from "@/components/Shadcn/chart";
import { LineChart, Line, XAxis, YAxis, Tooltip, Legend } from "recharts";

// Fungsi utilitas untuk format data chart
function formatChartData(userStats) {
    return userStats.map(s => ({
        time: new Date(s.timestamp).toLocaleTimeString("id-ID"),
        heartRate: Number(s.heart_rate),
        speed: Number(s.speed_kph),
        lat: Number(s.latitude),
        lng: Number(s.longitude),
    }));
}

// Fungsi untuk mengelompokkan statistik per user_id
function groupStatsByUser(stats) {
    const grouped = {};
    for (const s of stats) {
        if (!grouped[s.user_id]) grouped[s.user_id] = [];
        grouped[s.user_id].push(s);
    }
    return grouped;
}

export default function RiwayatDetailPage() {
    const params = useParams();
    const sessionId = params.id;
    const [session, setSession] = useState(null);
    const [stats, setStats] = useState([]);

    useEffect(() => {
        async function fetchData() {
            const data = await getSessionById(sessionId);
            setSession(data);
        }
        fetchData();
    }, [sessionId]);

    useEffect(() => {
        async function fetchStats() {
            const data = await getSessionStats(sessionId);
            setStats(data);
        }
        fetchStats();
    }, [sessionId]);

    if (!session) return <div>Memuat data sesi...</div>;

    // Kelompokkan statistik per user
    const statsByUser = groupStatsByUser(stats);

    return (
        <div className="p-6">
            <Card>
                <CardHeader>
                    <CardTitle>{session.name}</CardTitle>
                    <CardDescription>
                        Lokasi: {session.location?.name} <br />
                        Jadwal: {new Date(session.scheduled_at).toLocaleString("id-ID")}
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    {Object.keys(statsByUser).length === 0 ? (
                        <div className="text-gray-500">Belum ada data statistik.</div>
                    ) : (
                        Object.entries(statsByUser).map(([userId, userStats]) => {
                            // Siapkan path untuk map
                            const path = userStats
                                .filter(s => s.latitude !== undefined && s.longitude !== undefined)
                                .map(s => ({
                                    lat: Number(s.latitude),
                                    lng: Number(s.longitude)
                                }));
                            // Nama prajurit (jika ada di session)
                            const prajurit = session.participants?.find(p => String(p.id) === String(userId));
                            return (
                                <div key={userId} className="mb-8">
                                    <h3 className="font-semibold mb-2">
                                        {prajurit ? prajurit.name : `Prajurit #${userId}`}
                                    </h3>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        {/* Chart Visualisasi */}
                                        <div>
                                            <ChartContainer config={{}}>
                                                <LineChart data={formatChartData(userStats)}>
                                                    <XAxis dataKey="time" />
                                                    <YAxis yAxisId="left" label={{ value: "Detak Jantung", angle: -90, position: "insideLeft" }} />
                                                    <YAxis yAxisId="right" orientation="right" label={{ value: "Kecepatan", angle: 90, position: "insideRight" }} />
                                                    <Tooltip />
                                                    <Legend />
                                                    <Line yAxisId="left" type="monotone" dataKey="heartRate" stroke="#ef4444" name="Detak Jantung" />
                                                    <Line yAxisId="right" type="monotone" dataKey="speed" stroke="#3b82f6" name="Kecepatan" />
                                                </LineChart>
                                            </ChartContainer>
                                        </div>
                                        {/* Map visualisasi jalur */}
                                        <div>
                                            {path.length > 0 ? (
                                                <MiniMapbox path={path} />
                                            ) : (
                                                <div className="text-xs text-gray-400">Lokasi tidak tersedia</div>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            );
                        })
                    )}
                </CardContent>
            </Card>
        </div>
    );
}