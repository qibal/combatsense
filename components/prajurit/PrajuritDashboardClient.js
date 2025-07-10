'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/Shadcn/card';
import { Button } from '@/components/Shadcn/button';
import { Badge } from '@/components/Shadcn/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/Shadcn/tabs';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/Shadcn/avatar';
import { Switch } from '@/components/Shadcn/switch';
import { Progress } from '@/components/Shadcn/progress';
import { Label } from '@/components/Shadcn/label';
import { Separator } from '@/components/Shadcn/separator';
import {
    User, Activity, Calendar, Heart, Clock, Users, Play, MapPin, Wifi, WifiOff, LogOut
} from 'lucide-react';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Map, { Marker } from 'react-map-gl/mapbox';
import 'mapbox-gl/dist/mapbox-gl.css';
import { ChartContainer } from '@/components/Shadcn/chart';
import { LineChart, Line, XAxis, YAxis, Tooltip, Legend } from 'recharts';
import { logoutAction } from "@/actions/auth/logout";

export default function PrajuritDashboardClient({
    initialProfile = {},
    initialMedicalHistory = [],
    initialInvitations = [],
    initialAvailableSessions = [],
    initialTrainingHistory = []
}) {
    const router = useRouter();
    const [activeTab, setActiveTab] = useState("profile");
    const [isDeviceConnected, setIsDeviceConnected] = useState(false);
    const [monitoringStats, setMonitoringStats] = useState({});
    const [lastPosition, setLastPosition] = useState({ lat: -6.1754, lng: 106.8272 });
    const [heartRateData, setHeartRateData] = useState([]);
    const [speedData, setSpeedData] = useState([]);

    // Handler untuk logout
    const handleLogout = async () => {
        try {
            await logoutAction();
            router.push('/');
        } catch (error) {
            console.error('Error during logout:', error);
            // Tetap redirect meski ada error
            router.push('/');
        }
    };

    // Helper badge
    const getPerformanceBadge = (performance) => {
        switch (performance) {
            case 'sangat baik': return <Badge variant="default" className="bg-green-500">Sangat Baik</Badge>;
            case 'baik': return <Badge variant="default" className="bg-blue-500">Baik</Badge>;
            case 'cukup': return <Badge variant="outline" className="border-yellow-500 text-yellow-600">Cukup</Badge>;
            case 'kurang': return <Badge variant="destructive">Kurang</Badge>;
            default: return <Badge variant="secondary">{performance || 'N/A'}</Badge>;
        }
    };

    // Simulasi monitoring seperti di halaman komandan
    useEffect(() => {
        let interval;
        if (isDeviceConnected) {
            interval = setInterval(() => {
                // Ambil posisi terakhir menggunakan functional update
                setLastPosition(prevPosition => {
                    let prevLat = prevPosition.lat;
                    let prevLng = prevPosition.lng;

                    // Simulasi kecepatan lari (7-18 km/jam)
                    const speed = 7 + Math.random() * 11;
                    const speedMs = speed / 3.6; // konversi ke m/s

                    // 1 derajat latitude ~ 111.32 km, longitude tergantung latitude
                    const meterToDegLat = 1 / 111320;
                    const meterToDegLng = 1 / (111320 * Math.cos(prevLat * Math.PI / 180));

                    // Langkah per detik
                    const step = speedMs; // meter per detik
                    const angle = Math.random() * 2 * Math.PI;
                    let lat = prevLat + Math.sin(angle) * step * meterToDegLat;
                    let lng = prevLng + Math.cos(angle) * step * meterToDegLng;

                    // Jika terlalu jauh dari Monas (>200m), arahkan balik ke tengah
                    const dist = Math.sqrt(Math.pow((lat + 6.1754) * 111320, 2) + Math.pow((lng - 106.8272) * 111320, 2));
                    if (dist > 200) {
                        lat = -6.1754 + (Math.random() - 0.5) * 0.001;
                        lng = 106.8272 + (Math.random() - 0.5) * 0.001;
                    }

                    // Simulasi statistik lain
                    const heartRate = 90 + Math.round(Math.random() * 30);
                    let status = "sehat";
                    if (heartRate > 110) status = "lelah";
                    if (heartRate > 120) status = "bahaya";

                    const currentTime = new Date().toLocaleTimeString('id-ID', {
                        hour: '2-digit',
                        minute: '2-digit',
                        second: '2-digit'
                    });

                    setMonitoringStats({
                        heartRate,
                        speed,
                        lat,
                        lng,
                        status
                    });

                    // Update chart data
                    setHeartRateData(prev => {
                        const newData = [...prev, { time: currentTime, heartRate }];
                        return newData.slice(-20); // Keep last 20 data points
                    });

                    setSpeedData(prev => {
                        const newData = [...prev, { time: currentTime, speed: parseFloat(speed.toFixed(1)) }];
                        return newData.slice(-20); // Keep last 20 data points
                    });

                    return { lat, lng };
                });
            }, 1000);
        } else {
            setMonitoringStats({});
            setLastPosition({ lat: -6.1754, lng: 106.8272 });
            setHeartRateData([]);
            setSpeedData([]);
        }
        return () => clearInterval(interval);
    }, [isDeviceConnected]); // Hapus lastPosition dari dependency array

    const getStatusBadge = (status) => {
        switch (status) {
            case 'sehat': return <Badge variant="default" className="bg-green-500">Sehat</Badge>;
            case 'lelah': return <Badge variant="outline" className="border-yellow-500 text-yellow-600">Lelah</Badge>;
            case 'bahaya': return <Badge variant="destructive">Bahaya</Badge>;
            default: return <Badge variant="secondary">{status || 'N/A'}</Badge>;
        }
    };

    // Safe access helpers dengan validasi tambahan
    const profile = initialProfile || {};
    const medicalHistory = Array.isArray(initialMedicalHistory) ? initialMedicalHistory : [];
    const availableSessions = Array.isArray(initialAvailableSessions) ? initialAvailableSessions : [];
    const trainingHistory = Array.isArray(initialTrainingHistory) ? initialTrainingHistory : [];

    return (
        <div className="min-h-screen bg-gray-50 p-6">
            <div className="max-w-7xl mx-auto">
                <div className="flex items-center justify-between mb-6">
                    <div>
                        <h1 className="text-3xl font-bold text-gray-900">Dashboard Prajurit</h1>
                        <p className="text-gray-600">Selamat datang, {profile.name || 'Prajurit'}</p>
                    </div>
                    <div className="flex items-center gap-4">
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={handleLogout}
                            className="text-red-600 hover:text-red-700 hover:bg-red-50 flex items-center gap-2"
                        >
                            <LogOut size={16} />
                            Logout
                        </Button>
                        <Badge variant="outline" className="px-3 py-1">
                            <Clock className="h-4 w-4 mr-1" />
                            {new Date().toLocaleDateString('id-ID')}
                        </Badge>
                    </div>
                </div>

                <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
                    <TabsList className="grid w-full grid-cols-4">
                        <TabsTrigger value="profile" className="flex items-center gap-2"><User className="h-4 w-4" />Profile</TabsTrigger>
                        <TabsTrigger value="sessions" className="flex items-center gap-2"><Calendar className="h-4 w-4" />Sesi Latihan</TabsTrigger>
                        <TabsTrigger value="history" className="flex items-center gap-2"><Clock className="h-4 w-4" />History</TabsTrigger>
                        <TabsTrigger value="monitoring" className="flex items-center gap-2"><Activity className="h-4 w-4" />Monitoring</TabsTrigger>
                    </TabsList>

                    <TabsContent value="profile" className="space-y-6">
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2"><User className="h-5 w-5" />Informasi Profile</CardTitle>
                                <CardDescription>Data pribadi dan informasi akun Anda</CardDescription>
                            </CardHeader>
                            <CardContent>
                                <div className="flex items-center gap-6">
                                    <Avatar className="h-24 w-24">
                                        <AvatarImage src={profile.avatar} alt={profile.name} />
                                        <AvatarFallback className="text-lg">{(profile.name || 'P').split(' ').map(n => n[0]).join('')}</AvatarFallback>
                                    </Avatar>
                                    <div className="grid gap-3 flex-1">
                                        <div className="grid grid-cols-2 gap-4">
                                            <div><Label className="text-sm font-medium text-gray-600">Nama Lengkap</Label><p className="text-lg font-semibold">{profile.name || 'N/A'}</p></div>
                                            <div><Label className="text-sm font-medium text-gray-600">Username</Label><p className="text-lg font-semibold">{profile.username || 'N/A'}</p></div>
                                        </div>
                                        <div className="grid grid-cols-2 gap-4">
                                            <div><Label className="text-sm font-medium text-gray-600">Pangkat</Label><p className="text-lg font-semibold">{profile.rank || 'N/A'}</p></div>
                                            <div><Label className="text-sm font-medium text-gray-600">Unit</Label><p className="text-lg font-semibold">{profile.unit || 'N/A'}</p></div>
                                        </div>
                                        <div>
                                            <Label className="text-sm font-medium text-gray-600">Tanggal Bergabung</Label>
                                            <p className="text-lg font-semibold">{profile.joinDate ? new Date(profile.joinDate).toLocaleDateString('id-ID') : 'N/A'}</p>
                                        </div>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2"><Heart className="h-5 w-5 text-red-500" />Riwayat Pemeriksaan Medis</CardTitle>
                                <CardDescription>Hasil pemeriksaan kondisi kesehatan oleh tim medis.</CardDescription>
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-4">
                                    {medicalHistory.length > 0 ? medicalHistory.map((record) => (
                                        <Card key={record.id} className="border-l-4 border-l-red-500">
                                            <CardContent className="p-4">
                                                <div className="flex justify-between items-start mb-2">
                                                    <div>
                                                        <h4 className="font-semibold">Pemeriksaan {record.checkup_date ? new Date(record.checkup_date).toLocaleDateString('id-ID') : 'N/A'}</h4>
                                                        <p className="text-sm text-gray-500">Oleh: {record.examiner_id || 'N/A'}</p>
                                                    </div>
                                                    <Badge variant={record.general_condition === 'Baik' ? 'default' : 'destructive'} className={record.general_condition === 'Baik' ? 'bg-green-500' : ''}>{record.general_condition || 'N/A'}</Badge>
                                                </div>
                                                <Separator className="my-2" />
                                                <div className="space-y-1 text-sm">
                                                    <p><strong className="font-medium text-gray-700">Catatan:</strong> {record.notes || 'N/A'}</p>
                                                    <p><strong className="font-medium text-gray-700">Berat/Tinggi:</strong> {record.weight_kg || 'N/A'} kg / {record.height_cm || 'N/A'} cm</p>
                                                    <p><strong>Tekanan Darah:</strong> {record.blood_pressure || 'N/A'}</p>
                                                    <p><strong>Denyut Nadi:</strong> {record.pulse || 'N/A'} bpm</p>
                                                    <p><strong>Suhu Tubuh:</strong> {record.temperature || 'N/A'} °C</p>
                                                    <p><strong>Gula Darah:</strong> {record.glucose || 'N/A'} mg/dL</p>
                                                    <p><strong>Kolesterol:</strong> {record.cholesterol || 'N/A'} mg/dL</p>
                                                    <p><strong>Hemoglobin:</strong> {record.hemoglobin || 'N/A'} g/dL</p>
                                                    <p><strong className="font-medium text-gray-700">Penyakit Lain:</strong> {record.other_diseases || 'N/A'}</p>
                                                </div>
                                            </CardContent>
                                        </Card>
                                    )) : <p className="text-sm text-center text-gray-500 py-4">Belum ada riwayat pemeriksaan medis.</p>}
                                </div>
                            </CardContent>
                        </Card>
                    </TabsContent>

                    <TabsContent value="sessions" className="space-y-6">
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2"><Calendar className="h-5 w-5" />Jadwal Sesi Latihan</CardTitle>
                                <CardDescription>Jadwal sesi latihan yang telah ditentukan oleh komandan</CardDescription>
                            </CardHeader>
                            <CardContent>
                                <div className="grid gap-4">
                                    {availableSessions.length > 0 ? availableSessions.map((session) => (
                                        <Card key={session.id} className="border-l-4 border-l-blue-500">
                                            <CardContent className="pt-4">
                                                <div className="flex items-center justify-between mb-3">
                                                    <h4 className="font-semibold text-lg">{session.name || 'N/A'}</h4>
                                                    <Badge variant={session.status === 'direncanakan' ? 'default' : 'secondary'}>
                                                        {session.status || 'N/A'}
                                                    </Badge>
                                                </div>
                                                <div className="grid md:grid-cols-2 gap-3 text-sm text-gray-600 mb-4">
                                                    <div className="flex items-center gap-2"><Calendar className="h-4 w-4" />{session.date ? new Date(session.date).toLocaleDateString('id-ID') : 'N/A'}</div>
                                                    <div className="flex items-center gap-2"><Clock className="h-4 w-4" />{session.time ? new Date(session.time).toLocaleTimeString('id-ID') : 'N/A'}</div>
                                                    <div className="flex items-center gap-2"><MapPin className="h-4 w-4" />{session.location || 'N/A'}</div>
                                                    <div className="flex items-center gap-2"><User className="h-4 w-4" />{session.commander || 'N/A'}</div>
                                                </div>
                                                <div className="flex items-center justify-between">
                                                    <div className="flex items-center gap-2">
                                                        <Users className="h-4 w-4" /><span className="text-sm">{session.participants || 0}/{session.maxParticipants || 20} peserta</span>
                                                        <Progress value={((session.participants || 0) / (session.maxParticipants || 20)) * 100} className="w-24 h-2" />
                                                    </div>
                                                    <Badge variant={session.status === 'direncanakan' ? 'default' : session.status === 'berlangsung' ? 'secondary' : 'outline'}>
                                                        {session.status === 'direncanakan' ? 'Direncanakan' : session.status === 'berlangsung' ? 'Sedang Berlangsung' : session.status}
                                                    </Badge>
                                                </div>
                                            </CardContent>
                                        </Card>
                                    )) : <p className="text-sm text-center text-gray-500 py-4">Belum ada jadwal sesi latihan yang ditentukan komandan.</p>}
                                </div>
                            </CardContent>
                        </Card>
                    </TabsContent>

                    <TabsContent value="history" className="space-y-6">
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2"><Clock className="h-5 w-5" />History Sesi Latihan</CardTitle>
                                <CardDescription>Riwayat sesi latihan yang pernah Anda ikuti</CardDescription>
                            </CardHeader>
                            <CardContent>
                                {trainingHistory.length > 0 ? (
                                    <div className="space-y-4">
                                        {trainingHistory.map((session) => (
                                            <Card key={session.id} className="border-l-4 border-l-green-500">
                                                <CardContent className="pt-4">
                                                    <div className="flex items-center justify-between mb-3">
                                                        <div>
                                                            <h4 className="font-semibold text-lg">{session.sessionName || 'N/A'}</h4>
                                                            <p className="text-sm text-gray-600">{session.date ? new Date(session.date).toLocaleDateString('id-ID') : 'N/A'} • {session.duration || 'N/A'}</p>
                                                        </div>
                                                        <Badge variant="secondary">Selesai</Badge>
                                                    </div>
                                                    <div className="grid grid-cols-3 gap-4 mb-3">
                                                        <div className="text-center"><p className="text-xs text-gray-600">Avg HR</p><p className="text-lg font-semibold text-red-600">{session.myStats?.avgHeartRate || 'N/A'} BPM</p></div>
                                                        <div className="text-center"><p className="text-xs text-gray-600">Jarak</p><p className="text-lg font-semibold text-blue-600">{session.myStats?.totalDistance || 'N/A'} km</p></div>
                                                        <div className="text-center"><p className="text-xs text-gray-600">Performa</p><div className="mt-1">{getPerformanceBadge(session.myStats?.performance || 'baik')}</div></div>
                                                    </div>
                                                </CardContent>
                                            </Card>
                                        ))}
                                    </div>
                                ) : (
                                    <div className="text-center py-10">
                                        <Clock className="h-16 w-16 text-gray-400 mx-auto mb-4" /><h3 className="text-lg font-medium text-gray-900 mb-2">Belum ada history</h3>
                                        <p className="text-gray-500">Anda belum pernah mengikuti sesi latihan</p>
                                    </div>
                                )}
                            </CardContent>
                        </Card>
                    </TabsContent>

                    <TabsContent value="monitoring" className="space-y-6">
                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                            {/* Kolom kiri: Kontrol Device & Statistik */}
                            <div className="lg:col-span-1 space-y-4">
                                {/* Card Kontrol Device (horizontal kecil) */}
                                <Card>
                                    <CardHeader className="pb-2">
                                        <CardTitle className="flex items-center justify-between">
                                            <span>Kontrol Device</span>
                                            <Button
                                                onClick={() => setIsDeviceConnected(!isDeviceConnected)}
                                                variant={isDeviceConnected ? "destructive" : "default"}
                                                className="flex items-center gap-2"
                                                size="sm"
                                            >
                                                {isDeviceConnected ? (
                                                    <>
                                                        <WifiOff className="h-4 w-4" />
                                                        Disconnect
                                                    </>
                                                ) : (
                                                    <>
                                                        <Wifi className="h-4 w-4" />
                                                        Connect
                                                    </>
                                                )}
                                            </Button>
                                        </CardTitle>
                                    </CardHeader>
                                    <CardContent className="py-2 px-4">
                                        {/* Informasi monitoring horizontal kecil */}
                                        <div className="flex flex-row items-center justify-between gap-2 text-xs">
                                            <div className="flex flex-col items-center px-2">
                                                <Heart className="h-4 w-4 text-red-500 mb-1" />
                                                <span className="font-semibold">{monitoringStats.heartRate || '-'}</span>
                                                <span className="text-[10px] text-gray-500">BPM</span>
                                            </div>
                                            <div className="flex flex-col items-center px-2">
                                                <Activity className="h-4 w-4 text-blue-500 mb-1" />
                                                <span className="font-semibold">{monitoringStats.speed ? monitoringStats.speed.toFixed(1) : '-'}</span>
                                                <span className="text-[10px] text-gray-500">km/jam</span>
                                            </div>
                                            <div className="flex flex-col items-center px-2">
                                                <MapPin className="h-4 w-4 text-purple-500 mb-1" />
                                                <span className="font-mono">{monitoringStats.lat ? monitoringStats.lat.toFixed(3) : '-'}</span>
                                                <span className="font-mono">{monitoringStats.lng ? monitoringStats.lng.toFixed(3) : '-'}</span>
                                            </div>
                                            <div className="flex flex-col items-center px-2">
                                                <span className="text-[10px] text-gray-500 mb-1">Status</span>
                                                {getStatusBadge(monitoringStats.status)}
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>
                                {/* Card Detak Jantung */}
                                <Card>
                                    <CardHeader className="py-2 px-4">
                                        <CardTitle className="text-xs">Grafik Detak Jantung</CardTitle>
                                    </CardHeader>
                                    <CardContent className="py-2 px-2">
                                        {isDeviceConnected && heartRateData.length > 0 ? (
                                            <ChartContainer config={{}}>
                                                <LineChart data={heartRateData} width={220} height={90}>
                                                    <XAxis dataKey="time" hide />
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
                                                    {isDeviceConnected ? 'Menunggu data...' : 'Device tidak terhubung'}
                                                </span>
                                            </div>
                                        )}
                                    </CardContent>
                                </Card>
                                {/* Card Kecepatan */}
                                <Card>
                                    <CardHeader className="py-2 px-4">
                                        <CardTitle className="text-xs">Grafik Kecepatan</CardTitle>
                                    </CardHeader>
                                    <CardContent className="py-2 px-2">
                                        {isDeviceConnected && speedData.length > 0 ? (
                                            <ChartContainer config={{}}>
                                                <LineChart data={speedData} width={220} height={90}>
                                                    <XAxis dataKey="time" hide />
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
                                                    {isDeviceConnected ? 'Menunggu data...' : 'Device tidak terhubung'}
                                                </span>
                                            </div>
                                        )}
                                    </CardContent>
                                </Card>
                            </div>
                            {/* Kolom kanan: Peta besar */}
                            <div className="lg:col-span-2">
                                <Card>
                                    <CardHeader>
                                        <CardTitle>Peta Lokasi Real-time</CardTitle>
                                        <CardDescription>Geser, zoom, dan eksplorasi area latihan</CardDescription>
                                    </CardHeader>
                                    <CardContent>
                                        <div className="w-full h-[600px] rounded-lg overflow-hidden border">
                                            {isDeviceConnected ? (
                                                <Map
                                                    mapboxAccessToken={process.env.NEXT_PUBLIC_MAPBOX_TOKEN}
                                                    initialViewState={{
                                                        longitude: lastPosition.lng,
                                                        latitude: lastPosition.lat,
                                                        zoom: 16
                                                    }}
                                                    longitude={lastPosition.lng}
                                                    latitude={lastPosition.lat}
                                                    zoom={16}
                                                    style={{ width: '100%', height: '100%' }}
                                                    mapStyle="mapbox://styles/mapbox/streets-v11"
                                                    attributionControl={false}
                                                    scrollZoom={true}
                                                    dragPan={true}
                                                    dragRotate={true}
                                                    doubleClickZoom={true}
                                                    touchZoomRotate={true}
                                                    keyboard={true}
                                                    boxZoom={true}
                                                >
                                                    <Marker
                                                        longitude={lastPosition.lng}
                                                        latitude={lastPosition.lat}
                                                        color="#ef4444"
                                                    />
                                                </Map>
                                            ) : (
                                                <div className="w-full h-full bg-gray-200 flex items-center justify-center">
                                                    <div className="text-center">
                                                        <WifiOff className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                                                        <span className="text-gray-500 text-lg">Device tidak terhubung</span>
                                                        <p className="text-gray-400 text-sm mt-2">Hubungkan device untuk melihat lokasi</p>
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    </CardContent>
                                </Card>
                            </div>
                        </div>
                    </TabsContent>
                </Tabs>
            </div>
        </div>
    );
}