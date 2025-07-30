'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/Shadcn/card';
import 'mapbox-gl/dist/mapbox-gl.css';
import { Badge } from "@/components/Shadcn/badge";
import { Separator } from "@/components/Shadcn/separator";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/Shadcn/avatar";
import { Button } from "@/components/Shadcn/button";
import { ArrowLeft } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import MiniMapbox from "@/components/komandan/MiniMapbox";
import { ChartContainer } from '@/components/Shadcn/chart';
import { LineChart, Line, XAxis, YAxis, Tooltip, Legend } from 'recharts';

const chartConfig = {
    heartRate: { label: "Detak Jantung (BPM)", color: "#ef4444" },
    speed: { label: "Kecepatan (km/h)", color: "#eab308" }
};

// Placeholder untuk komponen Chart dan Map yang akan kita buat atau integrasikan nanti
const PlaceholderChart = ({ title }) => (
    <Card>
        <CardHeader>
            <CardTitle>{title}</CardTitle>
        </CardHeader>
        <CardContent>
            <div className="h-60 w-full bg-gray-200 rounded-md flex items-center justify-center">
                <p className="text-gray-500">Chart akan ditampilkan di sini</p>
            </div>
        </CardContent>
    </Card>
);

const PlaceholderMap = () => (
    <Card>
        <CardHeader>
            <CardTitle>Peta Aktivitas</CardTitle>
        </CardHeader>
        <CardContent>
            <div className="h-80 w-full bg-gray-200 rounded-md flex items-center justify-center">
                <p className="text-gray-500">Peta akan ditampilkan di sini</p>
            </div>
        </CardContent>
    </Card>
);

export default function HistoryDetailClient({ historyData, error }) {
    const router = useRouter();

    const [heartRateData, setHeartRateData] = useState([]);
    const [speedData, setSpeedData] = useState([]);
    const [pathData, setPathData] = useState([]);

    useEffect(() => {
        if (historyData && historyData.statistics && historyData.statistics.length > 0) {
            const hrData = historyData.statistics.map(s => ({
                time: new Date(s.timestamp).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
                heartRate: s.heart_rate
            }));
            const spdData = historyData.statistics.map(s => ({
                time: new Date(s.timestamp).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
                speed: s.speed_kph ? parseFloat(s.speed_kph) : 0
            }));
            const pData = historyData.statistics
                .filter(s => s.latitude !== null && s.longitude !== null)
                .map(s => ({
                    lat: parseFloat(s.latitude),
                    lng: parseFloat(s.longitude)
                }));

            setHeartRateData(hrData);
            setSpeedData(spdData);
            setPathData(pData);
        }
    }, [historyData]);

    if (error) {
        return (
            <div className="flex flex-col items-center justify-center h-full">
                <p className="text-red-500">{error}</p>
                <Button onClick={() => router.back()} variant="outline" className="mt-4">
                    <ArrowLeft className="mr-2 h-4 w-4" /> Kembali
                </Button>
            </div>
        );
    }

    if (!historyData) {
        return (
            <div className="flex flex-col items-center justify-center h-full">
                <p className="text-gray-500">Data tidak ditemukan</p>
                <Button onClick={() => router.back()} variant="outline" className="mt-4">
                    <ArrowLeft className="mr-2 h-4 w-4" /> Kembali
                </Button>
            </div>
        );
    }

    // Fungsi untuk memformat tanggal
    const formatDate = (dateString) => {
        if (!dateString) return 'N/A';
        try {
            return new Date(dateString).toLocaleDateString('id-ID', {
                weekday: 'long', year: 'numeric', month: 'long', day: 'numeric'
            });
        } catch (error) {
            console.error('Error formatting date:', error);
            return 'N/A';
        }
    }

    return (
        <div className="flex flex-col gap-6 p-4 sm:p-6">
            <header className="flex items-center gap-4">
                <Button onClick={() => router.back()} variant="outline" size="icon">
                    <ArrowLeft className="h-4 w-4" />
                    <span className="sr-only">Kembali</span>
                </Button>
                <div>
                    <h1 className="text-2xl font-bold">{historyData.name || 'N/A'}</h1>
                    <p className="text-muted-foreground">
                        {formatDate(historyData.scheduled_at)}
                    </p>
                </div>
            </header>

            <div className="grid md:grid-cols-3 gap-6">
                <Card className="md:col-span-1">
                    <CardHeader>
                        <CardTitle>Ringkasan Latihan</CardTitle>
                        <CardDescription>{historyData.description || 'N/A'}</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="flex justify-between">
                            <span className="font-semibold">Status:</span>
                            <Badge variant={historyData.status === 'selesai' ? 'default' : 'secondary'}>
                                {historyData.status || 'N/A'}
                            </Badge>
                        </div>
                        <Separator />
                        <div className="flex justify-between">
                            <span className="font-semibold">Lokasi:</span>
                            <span>{historyData.location_name || 'N/A'}</span>
                        </div>
                        <Separator />
                        <div className="flex items-center gap-2">
                            <span className="font-semibold">Komandan:</span>
                            <div className="flex items-center gap-2 ml-auto">
                                <Avatar className="h-8 w-8">
                                    <AvatarImage src="/placeholder-avatar.png" />
                                    <AvatarFallback>KD</AvatarFallback>
                                </Avatar>
                                <span>{historyData.commander_name || 'N/A'}</span>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <div className="md:col-span-2 space-y-6">
                    <Card>
                        <CardHeader className="py-2 px-4">
                            <CardTitle className="text-xs">Grafik Detak Jantung</CardTitle>
                        </CardHeader>
                        <CardContent className="py-2 px-2">
                            {heartRateData.length > 0 ? (
                                <ChartContainer config={{}}>
                                    <LineChart data={heartRateData} width={500} height={200}>
                                        <XAxis dataKey="time" />
                                        <YAxis yAxisId="left" width={24} />
                                        <Tooltip />
                                        <Line
                                            yAxisId="left"
                                            type="monotone"
                                            dataKey="heartRate"
                                            stroke="#ef4444"
                                            name="Detak Jantung"
                                            strokeWidth={2}
                                            dot={false}
                                        />
                                    </LineChart>
                                </ChartContainer>
                            ) : (
                                <div className="h-16 bg-gray-100 rounded flex items-center justify-center">
                                    <span className="text-gray-400 text-xs">
                                        Tidak ada data detak jantung.
                                    </span>
                                </div>
                            )}
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader className="py-2 px-4">
                            <CardTitle className="text-xs">Grafik Kecepatan</CardTitle>
                        </CardHeader>
                        <CardContent className="py-2 px-2">
                            {speedData.length > 0 ? (
                                <ChartContainer config={{}}>
                                    <LineChart data={speedData} width={500} height={200}>
                                        <XAxis dataKey="time" />
                                        <YAxis yAxisId="left" width={24} />
                                        <Tooltip />
                                        <Line
                                            yAxisId="left"
                                            type="monotone"
                                            dataKey="speed"
                                            stroke="#3b82f6"
                                            name="Kecepatan"
                                            strokeWidth={2}
                                            dot={false}
                                        />
                                    </LineChart>
                                </ChartContainer>
                            ) : (
                                <div className="h-16 bg-gray-100 rounded flex items-center justify-center">
                                    <span className="text-gray-400 text-xs">
                                        Tidak ada data kecepatan.
                                    </span>
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </div>

                <Card>
                    <CardHeader>
                        <CardTitle>Peta Aktivitas</CardTitle>
                        <CardDescription>Jalur yang ditempuh selama sesi latihan.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        {pathData.length > 0 ? (
                            <MiniMapbox lat={pathData[pathData.length - 1].lat} lng={pathData[pathData.length - 1].lng} path={pathData} />
                        ) : (
                            <div className="w-full h-[600px] bg-gray-200 flex items-center justify-center rounded-lg">
                                <span className="text-gray-500 text-lg">Tidak ada data lokasi untuk sesi ini.</span>
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>
        </div>
    )
}