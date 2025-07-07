'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/Shadcn/card';
import 'mapbox-gl/dist/mapbox-gl.css';
import { Badge } from "@/components/Shadcn/badge";
import { Separator } from "@/components/Shadcn/separator";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/Shadcn/avatar";
import { Button } from "@/components/Shadcn/button";
import { ArrowLeft } from "lucide-react";
import { useRouter } from "next/navigation";

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
        return <div>Loading...</div>; // Atau tampilkan skeleton loader
    }

    // Fungsi untuk memformat tanggal
    const formatDate = (dateString) => {
        if (!dateString) return 'N/A';
        return new Date(dateString).toLocaleDateString('id-ID', {
            weekday: 'long', year: 'numeric', month: 'long', day: 'numeric'
        });
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
                    <PlaceholderChart title="Grafik Detak Jantung" />
                    <PlaceholderChart title="Grafik Kecepatan" />
                </div>
            </div>

            <PlaceholderMap />

            {/* Bagian untuk menampilkan data mentah untuk debugging */}
            <Card>
                <CardHeader>
                    <CardTitle>Data Statistik Mentah</CardTitle>
                    <CardDescription>
                        Total {historyData.statistics?.length || 0} titik data.
                    </CardDescription>
                </CardHeader>
                <CardContent className="max-h-60 overflow-auto">
                    <pre className="text-xs bg-gray-100 p-2 rounded">
                        {JSON.stringify(historyData.statistics || [], null, 2)}
                    </pre>
                </CardContent>
            </Card>
        </div>
    )
}