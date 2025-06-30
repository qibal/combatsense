'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/Shadcn/card';
import { Button } from '@/components/Shadcn/button';
import { Badge } from '@/components/Shadcn/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/Shadcn/tabs';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/Shadcn/avatar';
import { Switch } from '@/components/Shadcn/switch';
import { Progress } from '@/components/Shadcn/progress';
import { ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/Shadcn/chart';
import { Label } from '@/components/Shadcn/label';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/Shadcn/tooltip"
import { ScrollArea } from '@/components/Shadcn/scroll-area';
import {
    Dialog,
    DialogClose,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogOverlay,
    DialogPortal,
    DialogTitle,
    DialogTrigger
} from '@/components/Shadcn/dialog';
import { Separator } from '@/components/Shadcn/separator';
import {
    User,
    Activity,
    Calendar,
    Heart,
    Zap,
    Route,
    MapPin,
    Clock,
    Users,
    Play,
    Square,
    Wifi,
    WifiOff
} from 'lucide-react';
import { useState, useEffect, useMemo } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, ResponsiveContainer,Legend } from 'recharts';
import Image from 'next/image';

/**
 * Dashboard Prajurit - Profile, Sesi Latihan, Device Connection, Real-time Monitoring
 * Menu: Profile, Sesi Latihan Tersedia, Monitoring Real-time
 */
export default function PrajuritDashboard() {
    const [isDeviceConnected, setIsDeviceConnected] = useState(false);
    const [isTrainingActive, setIsTrainingActive] = useState(false);
    
    // Hapus state heartRateData yang lama, ganti dengan yang lebih komprehensif
    // const [heartRateData, setHeartRateData] = useState([]);

    // State baru untuk data monitoring yang lebih canggih
    const [monitoringHistory, setMonitoringHistory] = useState([]); // Menyimpan semua data point {time, timestamp, heartRate, speed, position}
    const [mapPath, setMapPath] = useState([]); // Menyimpan jejak di peta [{x, y}]
    const [heartRateInterval, setHeartRateInterval] = useState('realtime'); // 'realtime', '1m', '5m', '10m'
    const [speedInterval, setSpeedInterval] = useState('realtime'); // 'realtime', '1m', '5m', '10m'


    const [activeSession, setActiveSession] = useState(null); // State untuk melacak sesi aktif
    const [activeTab, setActiveTab] = useState("profile"); // State untuk mengontrol tab aktif
    const [currentStats, setCurrentStats] = useState({
        heartRate: 70,
        speed: 0,
        distance: 0,
        healthStatus: 'normal'
    });
    // Perbaikan pada state - tambah state untuk detail modal
    const [selectedSession, setSelectedSession] = useState(null);
    const [showDetailModal, setShowDetailModal] = useState(false);
    const [showConnectionModal, setShowConnectionModal] = useState(false); // State untuk modal koneksi
    const [sessionToJoin, setSessionToJoin] = useState(null); // State untuk menyimpan sesi yang akan diikuti
    const [lastActiveSession, setLastActiveSession] = useState(null); // State untuk sesi yang baru saja ditinggalkan

    // State untuk sesi latihan dari API
    const [availableTrainingSessions, setAvailableTrainingSessions] = useState([]);
    const [sessionsLoading, setSessionsLoading] = useState(true);
    const [sessionsError, setSessionsError] = useState(null);


    const [medicalHistory, setMedicalHistory] = useState([
        {
            id: 1,
            checkupDate: "2024-06-15",
            examiner: "Tim Medis Kompi A",
            generalCondition: "Baik",
            notes: "Kondisi fisik prima. Tidak ada keluhan berarti.",
            weight: 70,
            height: 175,
            bmi: 22.9,
            bloodPressure: "120/80 mmHg",
            pulse: 72,
            temperature: 36.7,
            glucose: 90,
            cholesterol: 180,
            hemoglobin: 14.5,
            otherDiseases: "Tidak ada"
        },
        {
            id: 2,
            checkupDate: "2024-03-10",
            examiner: "Tim Medis Batalyon",
            generalCondition: "Cukup",
            notes: "Sedikit kelelahan pasca latihan.",
            weight: 68,
            height: 174,
            bmi: 22.5,
            bloodPressure: "130/85 mmHg",
            pulse: 78,
            temperature: 36.9,
            glucose: 95,
            cholesterol: 190,
            hemoglobin: 14.0,
            otherDiseases: "Riwayat cedera engkel"
        }
    ]);


    const [invitations, setInvitations] = useState([
        {
            id: 1,
            sessionName: "Latihan Infiltrasi Malam",
            commander: "Mayor Suharto",
            date: "2024-07-25",
            time: "21:00",
            status: "pending" // 'pending', 'accepted', 'coming_soon'
        },
        {
            id: 2,
            sessionName: "Simulasi Pertempuran Kota",
            commander: "Kapten Ahmad",
            date: "2024-07-26",
            time: "09:00",
            status: "pending"
        }
    ]);
    const chartConfig = {
        heartRate: {
            label: "Detak Jantung (BPM)",
            color: "#ef4444",
        },
        speed: {
            label: "Kecepatan (km/h)",
            color: "#eab308",
        },
        distance: {
            label: "Jarak (km)",
            color: "#3b82f6",
        }
    };
    // Data dummy profile prajurit
    const profileData = {
        name: "Budi Santoso",
        username: "budi123",
        rank: "Sersan Dua",
        unit: "Kompi A Rajawali",
        avatar: "/avatars/budi.jpg",
        joinDate: "2023-01-15"
    };

    // Data dummy sesi latihan tersedia Dihapus, akan diambil dari API
    const sesiLatihan = [
        {
            id: 1,
            nama: "Latihan Tembak Siang",
            waktu: "2024-06-21 14:00",
            lokasi: "Lapangan A",
            komandanLapangan: [1, 2], // id dari array komandan
            prajurit: [1, 3, 4],      // id dari array prajurit
            timMedis: [1],            // id dari array medis
        },
        // dst...
    ];

    const daftarKomandan = [
        { id: 1, nama: "Mayor Suharto" },
        { id: 2, nama: "Kapten Ahmad" },
        // dst...
    ];

    const daftarPrajurit = [
        { id: 1, nama: "Budi Santoso" },
        { id: 2, nama: "Siti Aminah" },
        // dst...
    ];

    const daftarMedis = [
        { id: 1, nama: "Dr. Rina" },
        { id: 2, nama: "Sersan Medis Dedi" },
        // dst...
    ];

    const [trainingHistory, setTrainingHistory] = useState([
        {
            id: 1,
            sessionName: "Latihan Tembak Siang",
            date: "2024-06-20",
            startTime: "14:00",
            endTime: "16:00",
            duration: "2 jam",
            commander: "Mayor Suharto",
            commanderAvatar: "/avatars/suharto.jpg",
            location: "Lapangan A",
            participants: [
                {
                    id: 1,
                    name: "Budi Santoso",
                    unit: "Kompi A",
                    avatar: "/avatars/budi.jpg",
                    avgHeartRate: 95,
                    maxHeartRate: 125,
                    minHeartRate: 72,
                    avgSpeed: 8.5,
                    maxSpeed: 15.2,
                    totalDistance: 5.8,
                    finalStatus: "normal",
                    performance: "baik"
                },
                {
                    id: 2,
                    name: "Siti Aminah",
                    unit: "Tim Medis",
                    avatar: "/avatars/siti.jpg",
                    avgHeartRate: 88,
                    maxHeartRate: 108,
                    minHeartRate: 68,
                    avgSpeed: 6.2,
                    maxSpeed: 12.1,
                    totalDistance: 4.2,
                    finalStatus: "normal",
                    performance: "baik"
                }
            ],
            myStats: {
                avgHeartRate: 95,
                maxHeartRate: 125,
                minHeartRate: 72,
                avgSpeed: 8.5,
                maxSpeed: 15.2,
                totalDistance: 5.8,
                finalStatus: "normal",
                performance: "baik",
                // Interval 2 menit untuk tracking detail perubahan detak jantung
                chartData: [
                    { time: "14:00", heartRate: 72, speed: 0, distance: 0 },
                    { time: "14:02", heartRate: 75, speed: 2.1, distance: 0.07 },
                    { time: "14:04", heartRate: 82, speed: 4.5, distance: 0.22 },
                    { time: "14:06", heartRate: 88, speed: 6.8, distance: 0.45 },
                    { time: "14:08", heartRate: 95, speed: 8.2, distance: 0.72 },
                    { time: "14:10", heartRate: 102, speed: 9.8, distance: 1.05 },
                    { time: "14:12", heartRate: 98, speed: 8.5, distance: 1.35 },
                    { time: "14:14", heartRate: 105, speed: 10.2, distance: 1.68 },
                    { time: "14:16", heartRate: 115, speed: 12.1, distance: 2.08 },
                    { time: "14:18", heartRate: 125, speed: 15.2, distance: 2.58 }
                ],
                mapPath: [
                    { x: 50, y: 250 }, { x: 65, y: 240 }, { x: 80, y: 245 }, { x: 100, y: 235 },
                    { x: 120, y: 220 }, { x: 145, y: 210 }, { x: 160, y: 195 }, { x: 180, y: 180 },
                    { x: 200, y: 165 }, { x: 220, y: 150 }, { x: 240, y: 130 }, { x: 260, y: 110 },
                    { x: 280, y: 90 }, { x: 300, y: 75 }, { x: 320, y: 60 }
                ]
            }
        },
        {
            id: 2,
            sessionName: "Patroli Malam",
            date: "2024-06-19",
            startTime: "20:00",
            endTime: "23:00",
            duration: "3 jam",
            commander: "Kapten Ahmad",
            commanderAvatar: "/avatars/ahmad.jpg",
            location: "Sector 3",
            participants: [
                {
                    id: 1,
                    name: "Budi Santoso",
                    unit: "Kompi A",
                    avatar: "/avatars/budi.jpg",
                    avgHeartRate: 78,
                    maxHeartRate: 95,
                    minHeartRate: 65,
                    avgSpeed: 4.2,
                    maxSpeed: 8.5,
                    totalDistance: 8.2,
                    finalStatus: "normal",
                    performance: "sangat baik"
                }
            ],
            myStats: {
                avgHeartRate: 78,
                maxHeartRate: 95,
                minHeartRate: 65,
                avgSpeed: 4.2,
                maxSpeed: 8.5,
                totalDistance: 8.2,
                finalStatus: "normal",
                performance: "sangat baik",
                // Interval 2 menit untuk patroli
                chartData: [
                    { time: "20:00", heartRate: 65, speed: 0, distance: 0 },
                    { time: "20:02", heartRate: 68, speed: 2.5, distance: 0.08 },
                    { time: "20:04", heartRate: 72, speed: 3.8, distance: 0.21 },
                    { time: "20:06", heartRate: 75, speed: 4.2, distance: 0.35 },
                    { time: "20:08", heartRate: 78, speed: 4.8, distance: 0.51 },
                    { time: "20:10", heartRate: 82, speed: 5.5, distance: 0.69 },
                    { time: "20:12", heartRate: 85, speed: 6.2, distance: 0.89 },
                    { time: "20:14", heartRate: 88, speed: 7.1, distance: 1.12 },
                    { time: "20:16", heartRate: 92, speed: 8.2, distance: 1.39 },
                    { time: "20:18", heartRate: 95, speed: 8.5, distance: 1.67 }
                ],
                mapPath: [
                    { x: 350, y: 50 }, { x: 340, y: 65 }, { x: 335, y: 80 }, { x: 325, y: 95 },
                    { x: 310, y: 110 }, { x: 295, y: 120 }, { x: 280, y: 135 }, { x: 265, y: 150 },
                    { x: 250, y: 160 }, { x: 235, y: 175 }, { x: 220, y: 190 }, { x: 205, y: 205 },
                    { x: 190, y: 220 }, { x: 175, y: 230 }, { x: 160, y: 245 }
                ]
            }
        }
    ]);
    // Function untuk handle lihat detail
    const handleViewDetail = (session) => {
        setSelectedSession(session);
        setShowDetailModal(true);
    };

    // Helper function untuk performance badge
    const getPerformanceBadge = (performance) => {
        switch (performance) {
            case 'sangat baik':
                return <Badge variant="default" className="bg-green-500">Sangat Baik</Badge>;
            case 'baik':
                return <Badge variant="default" className="bg-blue-500">Baik</Badge>;
            case 'cukup':
                return <Badge variant="outline" className="border-yellow-500 text-yellow-600">Cukup</Badge>;
            case 'kurang':
                return <Badge variant="destructive">Kurang</Badge>;
            default:
                return <Badge variant="secondary">{performance}</Badge>;
        }
    };

    // Fungsi untuk mengubah status undangan
    const handleInvitationAction = (invitationId, newStatus) => {
        setInvitations(invitations.map(inv =>
            inv.id === invitationId ? { ...inv, status: newStatus } : inv
        ));
    };

    // Helper function untuk badge status undangan
    const getInvitationStatusBadge = (status) => {
        switch (status) {
            case 'pending':
                return <Badge variant="outline" className="border-yellow-500 text-yellow-600">Menunggu Konfirmasi</Badge>;
            case 'accepted':
                return <Badge variant="default" className="bg-green-500">Diterima</Badge>;
            case 'coming_soon':
                return <Badge variant="default" className="bg-blue-500">Segera Datang</Badge>;
            default:
                return <Badge variant="secondary">{status}</Badge>;
        }
    };

    // Fungsi baru untuk memulai sesi latihan setelah device dipastikan terhubung
    const startTrainingSession = (session) => {
        // Reset stats spesifik sesi latihan
        setCurrentStats(prev => ({
            ...prev,
            distance: 0 // Jarak direset saat sesi baru dimulai
        }));
        
        // Reset state monitoring baru
        setMonitoringHistory([]);
        setMapPath([]);

        setLastActiveSession(null); // Hapus info sesi yang ditinggalkan
        setActiveSession(session); // Set sesi yang sedang aktif
        setActiveTab("monitoring"); // Langsung pindah ke tab monitoring
        setShowConnectionModal(false); // Tutup modal jika terbuka
    };


    // Perbaikan pada fungsi untuk bergabung ke sesi latihan
    const handleJoinSession = (session) => {
        if (!isDeviceConnected) {
            // Jika device tidak terhubung, tampilkan modal
            setSessionToJoin(session);
            setShowConnectionModal(true);
        } else {
            // Jika sudah terhubung, langsung mulai sesi
            startTrainingSession(session);
        }
    };

    // Fungsi yang dipanggil saat user klik "Hubungkan dan Mulai Sesi" dari modal
    const handleConnectAndStartSession = () => {
        setIsDeviceConnected(true); // Asumsikan koneksi berhasil
        if (sessionToJoin) {
            startTrainingSession(sessionToJoin);
        }
    };

    // Fungsi untuk bergabung kembali ke sesi yang ditinggalkan
    const handleRejoinSession = () => {
        setActiveSession(lastActiveSession);
        setLastActiveSession(null);
    };


    // Fungsi untuk keluar dari sesi latihan
    const handleLeaveSession = () => {
        setLastActiveSession(activeSession); // Simpan sesi yang baru saja ditinggalkan
        setActiveSession(null); // Hapus sesi aktif
        // Data monitoring tidak di-reset agar bisa dilanjutkan
    };


    // Perbaikan pada useEffect - langsung mulai deteksi saat device connected
    useEffect(() => {
        let interval;

        // Langsung mulai deteksi saat device terhubung (hapus kondisi isTrainingActive)
        if (isDeviceConnected) {
            // Inisialisasi posisi awal di peta
            if (mapPath.length === 0) {
                setMapPath([{ x: 50, y: 150 }]); // Titik awal di peta (misal: 500x300)
            }

            interval = setInterval(() => {
                const timestamp = new Date();
                const timeString = timestamp.toLocaleTimeString();
                const newHeartRate = Math.floor(Math.random() * (120 - 70) + 70); // 70-120 BPM
                const newSpeed = Math.random() * (15 - 1) + 1; // 1-15 km/h

                setCurrentStats(prev => ({
                    heartRate: newHeartRate,
                    speed: parseFloat(newSpeed.toFixed(1)),
                    distance: parseFloat((prev.distance + newSpeed / 3600).toFixed(2)), // increment distance
                    healthStatus: getHealthStatus(newHeartRate)
                }));

                // Simulasi pergerakan di peta
                setMapPath(prevPath => {
                    const lastPos = prevPath[prevPath.length - 1];
                    // Pergerakan lebih realistis: kecepatan mempengaruhi jarak, arah sedikit acak
                    const angle = Math.random() * 2 * Math.PI; // Arah acak
                    const distanceMoved = newSpeed * 0.1; // Skala pergerakan
                    const newX = Math.max(10, Math.min(490, lastPos.x + Math.cos(angle) * distanceMoved));
                    const newY = Math.max(10, Math.min(290, lastPos.y + Math.sin(angle) * distanceMoved));
                    const newPosition = { x: newX, y: newY };
                    
                    // Tambahkan data point baru ke history
                    setMonitoringHistory(prevHistory => [...prevHistory, {
                        time: timeString,
                        timestamp: timestamp,
                        heartRate: newHeartRate,
                        speed: parseFloat(newSpeed.toFixed(1)),
                        position: newPosition
                    }]);

                    return [...prevPath, newPosition];
                });

            }, 2000); // Update setiap 2 detik untuk simulasi yang lebih jelas
        }

        return () => clearInterval(interval);
    }, [isDeviceConnected, mapPath.length]); 

    // Memoized selector untuk memfilter data chart berdasarkan interval
    const getFilteredData = (sourceData, interval) => {
        if (!sourceData || sourceData.length === 0) return [];

        const now = new Date();
        switch (interval) {
            case '1m':
                return sourceData.filter(d => now - d.timestamp < 60000);
            case '5m':
                return sourceData.filter(d => now - d.timestamp < 300000);
            case '10m':
                return sourceData.filter(d => now - d.timestamp < 600000);
            case 'realtime':
            default:
                return sourceData.slice(-30); // Tampilkan 30 data point terakhir
        }
    };

    const displayedHeartRateData = useMemo(() => getFilteredData(monitoringHistory, heartRateInterval), [monitoringHistory, heartRateInterval]);
    const displayedSpeedData = useMemo(() => getFilteredData(monitoringHistory, speedInterval), [monitoringHistory, speedInterval]);


    // Function untuk menentukan status kesehatan berdasarkan heart rate
    const getHealthStatus = (heartRate) => {
        if (heartRate < 60) return 'rendah';
        if (heartRate >= 60 && heartRate <= 100) return 'normal';
        if (heartRate > 100 && heartRate <= 120) return 'tinggi';
        return 'bahaya';
    };

    // Helper function untuk badge status
    const getHealthStatusBadge = (status) => {
        switch (status) {
            case 'normal':
                return <Badge variant="default" className="bg-green-500">Normal</Badge>;
            case 'tinggi':
                return <Badge variant="outline" className="border-yellow-500 text-yellow-600">Tinggi</Badge>;
            case 'rendah':
                return <Badge variant="outline" className="border-blue-500 text-blue-600">Rendah</Badge>;
            case 'bahaya':
                return <Badge variant="destructive">Bahaya</Badge>;
            default:
                return <Badge variant="secondary">{status}</Badge>;
        }
    };

    const getSessionStatusBadge = (status) => {
        switch (status) {
            case 'open':
                return <Badge variant="default" className="bg-green-500">Terbuka</Badge>;
            case 'waiting':
                return <Badge variant="outline">Menunggu</Badge>;
            case 'closed':
                return <Badge variant="destructive">Ditutup</Badge>;
            default:
                return <Badge variant="secondary">{status}</Badge>;
        }
    };

    // Perbaikan handle device toggle - reset data saat disconnect
    const handleDeviceToggle = () => {
        setIsDeviceConnected(!isDeviceConnected);
        if (isDeviceConnected) {
            // Reset semua data saat disconnect
            setMonitoringHistory([]);
            setMapPath([]);
            setCurrentStats({
                heartRate: 70,
                speed: 0,
                distance: 0,
                healthStatus: 'normal'
            });
        }
    };

    // Handle join training session
    const handleJoinTraining = () => {
        if (isDeviceConnected) {
            setIsTrainingActive(!isTrainingActive);
            if (!isTrainingActive) {
                setCurrentStats(prev => ({ ...prev, distance: 0 }));
                setMonitoringHistory([]);
                setMapPath([]);
            }
        }
    };

    // useEffect untuk fetch data sesi latihan
    useEffect(() => {
        const fetchSessions = async () => {
            try {
                setSessionsLoading(true);
                const response = await fetch('/api/sessions');
                if (!response.ok) {
                    throw new Error('Gagal mengambil data sesi');
                }
                const data = await response.json();
                setAvailableTrainingSessions(data.data.sessions);
                setSessionsError(null);
            } catch (error) {
                console.error("Fetch sessions error:", error);
                setSessionsError(error.message);
            } finally {
                setSessionsLoading(false);
            }
        };

        fetchSessions();
    }, []);



    return (
        <div className="min-h-screen bg-gray-50 p-6">
            <div className="max-w-7xl mx-auto">
                <div className="flex items-center justify-between mb-6">
                    <div>
                        <h1 className="text-3xl font-bold text-gray-900">Dashboard Prajurit</h1>
                        <p className="text-gray-600">Selamat datang, {profileData.name}</p>
                    </div>
                    <Badge variant="outline" className="px-3 py-1">
                        <Clock className="h-4 w-4 mr-1" />
                        {new Date().toLocaleDateString('id-ID')}
                    </Badge>
                </div>

                <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
                    <TabsList className="grid w-full grid-cols-4">
                        <TabsTrigger value="profile" className="flex items-center gap-2">
                            <User className="h-4 w-4" />
                            Profile
                        </TabsTrigger>
                        <TabsTrigger value="sessions" className="flex items-center gap-2">
                            <Calendar className="h-4 w-4" />
                            Sesi Latihan
                        </TabsTrigger>
                        <TabsTrigger value="history" className="flex items-center gap-2">
                            <Clock className="h-4 w-4" />
                            History
                        </TabsTrigger>
                        <TabsTrigger value="monitoring" className="flex items-center gap-2">
                            <Activity className="h-4 w-4" />
                            Monitoring
                        </TabsTrigger>
                    </TabsList>

                    {/* Profile Tab */}
                    <TabsContent value="profile" className="space-y-6">
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <User className="h-5 w-5" />
                                    Informasi Profile
                                </CardTitle>
                                <CardDescription>Data pribadi dan informasi akun Anda</CardDescription>
                            </CardHeader>
                            <CardContent>
                                <div className="flex items-center gap-6">
                                    <Avatar className="h-24 w-24">
                                        <AvatarImage src={profileData.avatar} alt={profileData.name} />
                                        <AvatarFallback className="text-lg">
                                            {profileData.name.split(' ').map(n => n[0]).join('')}
                                        </AvatarFallback>
                                    </Avatar>

                                    <div className="grid gap-3 flex-1">
                                        <div className="grid grid-cols-2 gap-4">
                                            <div>
                                                <Label className="text-sm font-medium text-gray-600">Nama Lengkap</Label>
                                                <p className="text-lg font-semibold">{profileData.name}</p>
                                            </div>
                                            <div>
                                                <Label className="text-sm font-medium text-gray-600">Username</Label>
                                                <p className="text-lg font-semibold">{profileData.username}</p>
                                            </div>
                                        </div>

                                        <div className="grid grid-cols-2 gap-4">
                                            <div>
                                                <Label className="text-sm font-medium text-gray-600">Pangkat</Label>
                                                <p className="text-lg font-semibold">{profileData.rank}</p>
                                            </div>
                                            <div>
                                                <Label className="text-sm font-medium text-gray-600">Unit</Label>
                                                <p className="text-lg font-semibold">{profileData.unit}</p>
                                            </div>
                                        </div>

                                        <div>
                                            <Label className="text-sm font-medium text-gray-600">Tanggal Bergabung</Label>
                                            <p className="text-lg font-semibold">
                                                {new Date(profileData.joinDate).toLocaleDateString('id-ID')}
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        {/* Medical History Card */}
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <Heart className="h-5 w-5 text-red-500" />
                                    Riwayat Pemeriksaan Medis
                                </CardTitle>
                                <CardDescription>Hasil pemeriksaan kondisi kesehatan oleh tim medis.</CardDescription>
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-4">
                                    {medicalHistory.length > 0 ? medicalHistory.map((record) => (
                                        <Card key={record.id} className="border-l-4 border-l-red-500">
                                            <CardContent className="p-4">
                                                <div className="flex justify-between items-start mb-2">
                                                    <div>
                                                        <h4 className="font-semibold">Pemeriksaan {new Date(record.checkupDate).toLocaleDateString('id-ID')}</h4>
                                                        <p className="text-sm text-gray-500">Oleh: {record.examiner}</p>
                                                    </div>
                                                    <Badge variant={record.generalCondition === 'Baik' ? 'default' : 'destructive'} className={record.generalCondition === 'Baik' ? 'bg-green-500' : ''}>
                                                        {record.generalCondition}
                                                    </Badge>
                                                </div>
                                                <Separator className="my-2" />
                                                <div className="space-y-1 text-sm">
                                                    <p><strong className="font-medium text-gray-700">Catatan:</strong> {record.notes}</p>
                                                    <p><strong className="font-medium text-gray-700">Riwayat:</strong> {record.healthHistory}</p>
                                                    <p><strong className="font-medium text-gray-700">Fisik:</strong> {record.physicalCondition}</p>
                                                    <p><strong className="font-medium text-gray-700">Berat/Tinggi:</strong> {record.weight} kg / {record.height} cm</p>
                                                    <p><strong>IMT:</strong> {record.bmi}</p>
                                                    <p><strong>Tekanan Darah:</strong> {record.bloodPressure}</p>
                                                    <p><strong>Denyut Nadi:</strong> {record.pulse} bpm</p>
                                                    <p><strong>Suhu Tubuh:</strong> {record.temperature} °C</p>
                                                    <p><strong>Gula Darah:</strong> {record.glucose} mg/dL</p>
                                                    <p><strong>Kolesterol:</strong> {record.cholesterol} mg/dL</p>
                                                    <p><strong>Hemoglobin:</strong> {record.hemoglobin} g/dL</p>
                                                    <p><strong className="font-medium text-gray-700">Penyakit Lain:</strong> {record.otherDiseases}</p>
                                                </div>
                                            </CardContent>
                                        </Card>
                                    )) : (
                                        <p className="text-sm text-center text-gray-500 py-4">Belum ada riwayat pemeriksaan medis.</p>
                                    )}
                                </div>
                            </CardContent>
                        </Card>
                    </TabsContent>

                    {/* Sesi Latihan Tab */}
                    <TabsContent value="sessions" className="space-y-6">
                        {/* Bagian Undangan Sesi Latihan */}
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <Users className="h-5 w-5 text-orange-500" />
                                    Undangan Sesi Latihan
                                </CardTitle>
                                <CardDescription>Sesi latihan yang diwajibkan oleh komandan untuk Anda ikuti.</CardDescription>
                            </CardHeader>
                            <CardContent>
                                <div className="grid gap-4">
                                    {invitations.length > 0 ? invitations.map((invitation) => (
                                        <Card key={invitation.id} className="border-l-4 border-l-orange-500">
                                            <CardContent className="pt-4">
                                                <div className="flex flex-wrap items-center justify-between gap-y-3 mb-3">
                                                    <div>
                                                        <h4 className="font-semibold text-lg">{invitation.sessionName}</h4>
                                                        <p className="text-sm text-gray-600">Diundang oleh: {invitation.commander}</p>
                                                    </div>
                                                    {getInvitationStatusBadge(invitation.status)}
                                                </div>

                                                <div className="flex items-center justify-between">
                                                    <div className="flex items-center gap-4 text-sm text-gray-600">
                                                        <div className="flex items-center gap-2">
                                                            <Calendar className="h-4 w-4" />
                                                            {new Date(invitation.date).toLocaleDateString('id-ID')}
                                                        </div>
                                                        <div className="flex items-center gap-2">
                                                            <Clock className="h-4 w-4" />
                                                            {invitation.time}
                                                        </div>
                                                    </div>

                                                    {invitation.status === 'pending' && (
                                                        <div className="flex items-center gap-2">
                                                            <Button
                                                                size="sm"
                                                                onClick={() => handleInvitationAction(invitation.id, 'coming_soon')}
                                                            >
                                                                Segera Datang
                                                            </Button>
                                                            <Button
                                                                size="sm"
                                                                variant="outline"
                                                                onClick={() => handleInvitationAction(invitation.id, 'accepted')}
                                                            >
                                                                Terima
                                                            </Button>
                                                        </div>
                                                    )}
                                                </div>
                                            </CardContent>
                                        </Card>
                                    )) : (
                                        <p className="text-sm text-center text-gray-500 py-4">Tidak ada undangan untuk saat ini.</p>
                                    )}
                                </div>
                            </CardContent>
                        </Card>

                        {/* Sesi Latihan Tersedia */}
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <Calendar className="h-5 w-5" />
                                    Sesi Latihan Tersedia
                                </CardTitle>
                                <CardDescription>Pilih sesi latihan yang ingin Anda ikuti</CardDescription>
                            </CardHeader>
                            <CardContent>
                                {sessionsLoading ? (
                                    <div className="text-center py-10">
                                        <p>Memuat sesi latihan...</p>
                                    </div>
                                ) : sessionsError ? (
                                    <div className="text-center py-10 text-red-500">
                                        <p>Error: {sessionsError}</p>
                                    </div>
                                ) : (
                                <div className="grid gap-4">
                                    {availableTrainingSessions.map((session) => (
                                        <Card key={session.id} className="border-l-4 border-l-blue-500">
                                            <CardContent className="pt-4">
                                                <div className="flex items-center justify-between mb-3">
                                                    <h4 className="font-semibold text-lg">{session.name}</h4>
                                                    {getSessionStatusBadge(session.status)}
                                                </div>

                                                <div className="grid md:grid-cols-2 gap-3 text-sm text-gray-600 mb-4">
                                                    <div className="flex items-center gap-2">
                                                        <Calendar className="h-4 w-4" />
                                                        {new Date(session.date).toLocaleDateString('id-ID')}
                                                    </div>
                                                    <div className="flex items-center gap-2">
                                                        <Clock className="h-4 w-4" />
                                                        {session.time}
                                                    </div>
                                                    <div className="flex items-center gap-2">
                                                        <MapPin className="h-4 w-4" />
                                                        {session.location}
                                                    </div>
                                                    <div className="flex items-center gap-2">
                                                        <User className="h-4 w-4" />
                                                        {session.commander}
                                                    </div>
                                                </div>

                                                <div className="flex items-center justify-between">
                                                    <div className="flex items-center gap-2">
                                                        <Users className="h-4 w-4" />
                                                        <span className="text-sm">
                                                            {session.participants}/{session.maxParticipants} peserta
                                                        </span>
                                                        <Progress
                                                            value={(session.participants / session.maxParticipants) * 100}
                                                            className="w-24 h-2"
                                                        />
                                                    </div>

                                                    <Button
                                                        disabled={session.status !== 'open' || activeSession}
                                                        className="flex items-center gap-2"
                                                        onClick={() => handleJoinSession(session)}
                                                    >
                                                        <Play className="h-4 w-4" />
                                                        Ikut Sesi
                                                    </Button>
                                                </div>
                                            </CardContent>
                                        </Card>
                                    ))}
                                </div>
                                )}
                            </CardContent>
                        </Card>
                    </TabsContent>
                    {/* History Tab - Simple Card Version */}
                    <TabsContent value="history" className="space-y-6">
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <Clock className="h-5 w-5" />
                                    History Sesi Latihan
                                </CardTitle>
                                <CardDescription>
                                    Riwayat sesi latihan yang pernah Anda ikuti
                                </CardDescription>
                            </CardHeader>
                            <CardContent>
                                {trainingHistory.length > 0 ? (
                                    <div className="space-y-4">
                                        {trainingHistory.map((session) => (
                                            <Card key={session.id} className="border-l-4 border-l-green-500">
                                                <CardContent className="pt-4">
                                                    {/* Simple Header */}
                                                    <div className="flex items-center justify-between mb-3">
                                                        <div>
                                                            <h4 className="font-semibold text-lg">{session.sessionName}</h4>
                                                            <p className="text-sm text-gray-600">
                                                                {new Date(session.date).toLocaleDateString('id-ID')} • {session.duration}
                                                            </p>
                                                        </div>
                                                        <Badge variant="secondary">Selesai</Badge>
                                                    </div>

                                                    {/* Quick Stats */}
                                                    <div className="grid grid-cols-3 gap-4 mb-3">
                                                        <div className="text-center">
                                                            <p className="text-xs text-gray-600">Avg HR</p>
                                                            <p className="text-lg font-semibold text-red-600">{session.myStats.avgHeartRate} BPM</p>
                                                        </div>
                                                        <div className="text-center">
                                                            <p className="text-xs text-gray-600">Jarak</p>
                                                            <p className="text-lg font-semibold text-blue-600">{session.myStats.totalDistance} km</p>
                                                        </div>
                                                        <div className="text-center">
                                                            <p className="text-xs text-gray-600">Performa</p>
                                                            <div className="mt-1">
                                                                {getPerformanceBadge(session.myStats.performance)}
                                                            </div>
                                                        </div>
                                                    </div>

                                                    {/* Action Button */}
                                                    <div className="flex justify-end">
                                                        <Button
                                                            variant="outline"
                                                            size="sm"
                                                            onClick={() => handleViewDetail(session)}
                                                            className="flex items-center gap-2"
                                                        >
                                                            <Activity className="h-4 w-4" />
                                                            Lihat Detail
                                                        </Button>
                                                    </div>
                                                </CardContent>
                                            </Card>
                                        ))}
                                    </div>
                                ) : (
                                    <div className="text-center py-10">
                                        <Clock className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                                        <h3 className="text-lg font-medium text-gray-900 mb-2">Belum ada history</h3>
                                        <p className="text-gray-500">
                                            Anda belum pernah mengikuti sesi latihan
                                        </p>
                                    </div>
                                )}
                            </CardContent>
                        </Card>

                        {/* Detail Modal */}

                        {showDetailModal && selectedSession && (
                            <Dialog open={showDetailModal} onOpenChange={setShowDetailModal}>
                                <DialogContent className="max-w-7xl w-[200vw] max-h-[90vh] overflow-hidden p-0">
                                    <DialogHeader className="px-6 pt-6 pb-2 sticky top-0 bg-white z-10">
                                        <DialogTitle>Detail Sesi: {selectedSession.sessionName}</DialogTitle>
                                        <DialogDescription>
                                            {new Date(selectedSession.date).toLocaleDateString('id-ID')} • {selectedSession.duration}
                                        </DialogDescription>
                                    </DialogHeader>

                                    <ScrollArea className="px-6 pb-6 max-h-[calc(90vh-8rem)]">
                                        <div className="space-y-6">
                                            {/* Session Info */}
                                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 p-3 bg-gray-50 rounded-lg items-center">
                                                <div className="flex items-center gap-2">
                                                    <MapPin className="h-4 w-4 flex-shrink-0 text-gray-500" />
                                                    <span className="text-sm">{selectedSession.location}</span>
                                                </div>
                                                <div className="flex items-center gap-3">
                                                    <Avatar className="h-9 w-9">
                                                        <AvatarImage src={selectedSession.commanderAvatar} alt={selectedSession.commander} />
                                                        <AvatarFallback>{selectedSession.commander.split(' ').map(n => n[0]).join('')}</AvatarFallback>
                                                    </Avatar>
                                                    <div>
                                                        <p className="text-xs text-gray-500">Komandan</p>
                                                        <p className="text-sm font-medium">{selectedSession.commander}</p>
                                                    </div>
                                                </div>
                                                <div className="flex items-center gap-2">
                                                    <Clock className="h-4 w-4 flex-shrink-0 text-gray-500" />
                                                    <span className="text-sm">{selectedSession.startTime} - {selectedSession.endTime}</span>
                                                </div>
                                                <div className="flex items-center gap-2">
                                                    <Users className="h-4 w-4 flex-shrink-0 text-gray-500" />
                                                    <span className="text-sm">{selectedSession.participants.length} peserta</span>
                                                </div>
                                            </div>

                                            {/* Detailed Stats */}
                                            <div>
                                                <h5 className="font-medium mb-3 text-gray-800">Statistik Performa Saya:</h5>
                                                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                                                    <div className="bg-red-50 p-3 rounded-lg border border-red-100">
                                                        <p className="text-xs text-red-700">Rata-rata HR</p>
                                                        <p className="text-lg font-semibold text-red-600">{selectedSession.myStats.avgHeartRate} BPM</p>
                                                        <p className="text-xs text-red-600">Max: {selectedSession.myStats.maxHeartRate} | Min: {selectedSession.myStats.minHeartRate}</p>
                                                    </div>
                                                    <div className="bg-yellow-50 p-3 rounded-lg border border-yellow-100">
                                                        <p className="text-xs text-yellow-700">Rata-rata Speed</p>
                                                        <p className="text-lg font-semibold text-yellow-600">{selectedSession.myStats.avgSpeed} km/h</p>
                                                        <p className="text-xs text-yellow-600">Max: {selectedSession.myStats.maxSpeed} km/h</p>
                                                    </div>
                                                    <div className="bg-blue-50 p-3 rounded-lg border border-blue-100">
                                                        <p className="text-xs text-blue-700">Total Jarak</p>
                                                        <p className="text-lg font-semibold text-blue-600">{selectedSession.myStats.totalDistance} km</p>
                                                    </div>
                                                    <div className="bg-green-50 p-3 rounded-lg border border-green-100">
                                                        <p className="text-xs text-green-700">Status Akhir</p>
                                                        <div className="mt-1">
                                                            {getHealthStatusBadge(selectedSession.myStats.finalStatus)}
                                                        </div>
                                                        <div className="mt-1">
                                                            {getPerformanceBadge(selectedSession.myStats.performance)}
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>

                                            {/* New Chart and Map Layout */}
                                            <div className="grid lg:grid-cols-3 gap-6">
                                                <div className="lg:col-span-2 space-y-6">
                                                    {/* Heart Rate Chart Card */}
                                                    <Card>
                                                        <CardHeader>
                                                            <CardTitle>Chart Detak Jantung</CardTitle>
                                                            <CardDescription>Analisis detak jantung selama sesi</CardDescription>
                                                        </CardHeader>
                                                        <CardContent>
                                                            <ChartContainer config={chartConfig} className="h-[250px]">
                                                                <ResponsiveContainer width="100%" height="100%">
                                                                    <LineChart data={selectedSession.myStats.chartData} margin={{ top: 5, right: 20, left: 10, bottom: 5 }}>
                                                                        <CartesianGrid strokeDasharray="3 3" />
                                                                        <XAxis dataKey="time" />
                                                                        <YAxis domain={[50, 150]} />
                                                                        <Tooltip content={<ChartTooltipContent />} />
                                                                        <Line type="monotone" dataKey="heartRate" stroke={chartConfig.heartRate.color} strokeWidth={2} dot={false} name="Detak Jantung" />
                                                                    </LineChart>
                                                                </ResponsiveContainer>
                                                            </ChartContainer>
                                                        </CardContent>
                                                    </Card>

                                                    {/* Speed Chart Card */}
                                                    <Card>
                                                        <CardHeader>
                                                            <CardTitle>Chart Kecepatan</CardTitle>
                                                            <CardDescription>Analisis kecepatan pergerakan selama sesi</CardDescription>
                                                        </CardHeader>
                                                        <CardContent>
                                                            <ChartContainer config={chartConfig} className="h-[250px]">
                                                                <ResponsiveContainer width="100%" height="100%">
                                                                    <LineChart data={selectedSession.myStats.chartData} margin={{ top: 5, right: 20, left: 10, bottom: 5 }}>
                                                                        <CartesianGrid strokeDasharray="3 3" />
                                                                        <XAxis dataKey="time" />
                                                                        <YAxis domain={[0, 20]} />
                                                                        <Tooltip content={<ChartTooltipContent />} />
                                                                        <Line type="monotone" dataKey="speed" stroke={chartConfig.speed.color} strokeWidth={2} dot={false} name="Kecepatan" />
                                                                    </LineChart>
                                                                </ResponsiveContainer>
                                                            </ChartContainer>
                                                        </CardContent>
                                                    </Card>
                                                </div>

                                                {/* Kolom Kanan: Peta */}
                                                <div className="lg:col-span-1">
                                                    <Card className="h-full">
                                                        <CardHeader>
                                                            <CardTitle>Visualisasi Peta</CardTitle>
                                                            <CardDescription>Jejak pergerakan selama sesi</CardDescription>
                                                        </CardHeader>
                                                        <CardContent>
                                                            <div className="relative w-full h-[550px] bg-gray-200 rounded-lg overflow-hidden">
                                                                <Image src="/maps/lapangan_a.jpg" alt="Peta Latihan" fill className="object-cover" />
                                                                {selectedSession.myStats.mapPath && (
                                                                    <svg className="absolute top-0 left-0 w-full h-full">
                                                                        {selectedSession.myStats.mapPath.length > 1 && (
                                                                            <polyline
                                                                                points={selectedSession.myStats.mapPath.map(p => `${p.x},${p.y}`).join(' ')}
                                                                                fill="none"
                                                                                stroke="rgba(59, 130, 246, 0.7)"
                                                                                strokeWidth="3"
                                                                            />
                                                                        )}
                                                                    </svg>
                                                                )}
                                                            </div>
                                                        </CardContent>
                                                    </Card>
                                                </div>
                                            </div>


                                            {/* Participants List */}
                                            <div className="pt-2">
                                                <h5 className="font-medium mb-3 text-gray-800">Peserta Lain ({selectedSession.participants.length} orang):</h5>
                                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                    {selectedSession.participants.map((participant) => (
                                                        <Card key={participant.id}>
                                                            <CardContent className="p-4 flex items-center gap-4">
                                                                <Avatar className="h-12 w-12">
                                                                    <AvatarImage src={participant.avatar} alt={participant.name} />
                                                                    <AvatarFallback>{participant.name.split(' ').map(n => n[0]).join('')}</AvatarFallback>
                                                                </Avatar>
                                                                <div className="flex-1">
                                                                    <div className="flex items-center justify-between">
                                                                        <div>
                                                                            <h6 className="font-semibold text-base">{participant.name}</h6>
                                                                            <p className="text-sm text-gray-600">{participant.unit}</p>
                                                                        </div>
                                                                        {getPerformanceBadge(participant.performance)}
                                                                    </div>
                                                                    <Separator className="my-2" />
                                                                    <div className="grid grid-cols-2 gap-2 text-sm text-gray-600">
                                                                        <p>Avg HR: <span className="font-semibold">{participant.avgHeartRate}</span> BPM</p>
                                                                        <p>Jarak: <span className="font-semibold">{participant.totalDistance}</span> km</p>
                                                                    </div>
                                                                </div>
                                                            </CardContent>
                                                        </Card>
                                                    ))}
                                                </div>
                                            </div>
                                        </div>
                                    </ScrollArea>

                                    <div className="px-6 py-4 border-t bg-white sticky bottom-0">
                                        <Button variant="outline" onClick={() => setShowDetailModal(false)}>
                                            Tutup
                                        </Button>
                                    </div>
                                </DialogContent>
                            </Dialog>
                        )}

                    </TabsContent>



                    {/* Monitoring Tab */}
                    <TabsContent value="monitoring" className="space-y-6">
                        {activeSession ? (
                            // Tampilan ketika prajurit sedang dalam sesi latihan aktif
                            <>
                                <Card className="bg-green-50 border-green-200">
                                    <CardHeader>
                                        <div className="flex flex-wrap items-start justify-between gap-4">
                                            <div>
                                                <CardTitle className="flex items-center gap-2 text-green-800">
                                                    <Activity className="h-5 w-5" />
                                                    Sesi Latihan Aktif
                                                </CardTitle>
                                                <CardDescription className="text-green-700 mt-1">
                                                    Anda sedang mengikuti sesi: <span className="font-semibold">{activeSession.name}</span>
                                                </CardDescription>
                                            </div>
                                            <Button
                                                variant="destructive"
                                                size="sm"
                                                onClick={handleLeaveSession}
                                            >
                                                <Square className="h-4 w-4 mr-2" />
                                                Keluar dari Sesi
                                            </Button>
                                        </div>
                                    </CardHeader>
                                    <CardContent>
                                        <div className="flex items-center justify-between p-3 bg-white rounded-lg border border-gray-200">
                                            <div className="flex items-center gap-2">
                                                {isDeviceConnected ? (
                                                    <>
                                                        <Wifi className="h-5 w-5 text-green-500" />
                                                        <span className="text-sm font-medium text-green-600">Device Terhubung</span>
                                                    </>
                                                ) : (
                                                    <>
                                                        <WifiOff className="h-5 w-5 text-red-500" />
                                                        <span className="text-sm font-medium text-red-600">Device Terputus</span>
                                                    </>
                                                )}
                                            </div>
                                            <Button size="sm" variant="outline" onClick={() => setIsDeviceConnected(true)}>
                                                Koneksi Ulang
                                            </Button>
                                        </div>
                                    </CardContent>
                                </Card>

                                {/* Real-time Stats akan tampil jika device terhubung */}
                                {isDeviceConnected ? (
                                    <div className="grid lg:grid-cols-3 gap-6">
                                        {/* Kolom Kiri: Stats dan Charts */}
                                        <div className="lg:col-span-2 space-y-6">
                                            {/* Stat Cards */}
                                            <div className="grid md:grid-cols-2 xl:grid-cols-4 gap-4">
                                                <Card>
                                                    <CardContent className="pt-4">
                                                        <div className="flex items-center gap-3">
                                                            <Heart className="h-8 w-8 text-red-500" />
                                                            <div>
                                                                <p className="text-sm text-gray-600">Detak Jantung</p>
                                                                <p className="text-2xl font-bold">{currentStats.heartRate} BPM</p>
                                                            </div>
                                                        </div>
                                                    </CardContent>
                                                </Card>
                                                <Card>
                                                    <CardContent className="pt-4">
                                                        <div className="flex items-center gap-3">
                                                            <Zap className="h-8 w-8 text-yellow-500" />
                                                            <div>
                                                                <p className="text-sm text-gray-600">Kecepatan</p>
                                                                <p className="text-2xl font-bold">{currentStats.speed} km/h</p>
                                                            </div>
                                                        </div>
                                                    </CardContent>
                                                </Card>
                                                <Card>
                                                    <CardContent className="pt-4">
                                                        <div className="flex items-center gap-3">
                                                            <Route className="h-8 w-8 text-blue-500" />
                                                            <div>
                                                                <p className="text-sm text-gray-600">Jarak Tempuh</p>
                                                                <p className="text-2xl font-bold">{currentStats.distance} km</p>
                                                            </div>
                                                        </div>
                                                    </CardContent>
                                                </Card>
                                                <Card>
                                                    <CardContent className="pt-4">
                                                        <div className="flex items-center gap-3">
                                                            <Activity className="h-8 w-8 text-green-500" />
                                                            <div>
                                                                <p className="text-sm text-gray-600">Status</p>
                                                                <div className="mt-1">
                                                                    {getHealthStatusBadge(currentStats.healthStatus)}
                                                                </div>
                                                            </div>
                                                        </div>
                                                    </CardContent>
                                                </Card>
                                            </div>

                                            {/* Heart Rate Chart Card */}
                                            <Card>
                                                <CardHeader>
                                                    <div className="flex items-center justify-between">
                                                        <div>
                                                            <CardTitle>Chart Detak Jantung</CardTitle>
                                                            <CardDescription>Analisis detak jantung berdasarkan waktu</CardDescription>
                                                        </div>
                                                        <div className="flex items-center gap-1">
                                                            {['realtime', '1m', '5m', '10m'].map(interval => (
                                                                <Button
                                                                    key={interval}
                                                                    size="sm"
                                                                    variant={heartRateInterval === interval ? 'default' : 'outline'}
                                                                    onClick={() => setHeartRateInterval(interval)}
                                                                >
                                                                    {interval === 'realtime' ? 'Live' : interval}
                                                                </Button>
                                                            ))}
                                                        </div>
                                                    </div>
                                                </CardHeader>
                                                <CardContent>
                                                    <ChartContainer config={chartConfig} className="h-[250px]">
                                                        <ResponsiveContainer width="100%" height="100%">
                                                            <LineChart data={displayedHeartRateData}>
                                                                <CartesianGrid strokeDasharray="3 3" />
                                                                <XAxis dataKey="time" />
                                                                <YAxis domain={[60, 140]} />
                                                                <ChartTooltip content={<ChartTooltipContent />} />
                                                                <Line type="monotone" dataKey="heartRate" stroke={chartConfig.heartRate.color} strokeWidth={2} dot={false} />
                                                            </LineChart>
                                                        </ResponsiveContainer>
                                                    </ChartContainer>
                                                </CardContent>
                                            </Card>

                                            {/* Speed Chart Card */}
                                            <Card>
                                                <CardHeader>
                                                    <div className="flex items-center justify-between">
                                                        <div>
                                                            <CardTitle>Chart Kecepatan</CardTitle>
                                                            <CardDescription>Analisis kecepatan pergerakan berdasarkan waktu</CardDescription>
                                                        </div>
                                                        <div className="flex items-center gap-1">
                                                            {['realtime', '1m', '5m', '10m'].map(interval => (
                                                                <Button
                                                                    key={interval}
                                                                    size="sm"
                                                                    variant={speedInterval === interval ? 'default' : 'outline'}
                                                                    onClick={() => setSpeedInterval(interval)}
                                                                >
                                                                    {interval === 'realtime' ? 'Live' : interval}
                                                                </Button>
                                                            ))}
                                                        </div>
                                                    </div>
                                                </CardHeader>
                                                <CardContent>
                                                    <ChartContainer config={chartConfig} className="h-[250px]">
                                                        <ResponsiveContainer width="100%" height="100%">
                                                            <LineChart data={displayedSpeedData}>
                                                                <CartesianGrid strokeDasharray="3 3" />
                                                                <XAxis dataKey="time" />
                                                                <YAxis domain={[0, 20]} />
                                                                <ChartTooltip content={<ChartTooltipContent />} />
                                                                <Line type="monotone" dataKey="speed" stroke={chartConfig.speed.color} strokeWidth={2} dot={false} />
                                                            </LineChart>
                                                        </ResponsiveContainer>
                                                    </ChartContainer>
                                                </CardContent>
                                            </Card>
                                        </div>

                                        {/* Kolom Kanan: Peta */}
                                        <div className="lg:col-span-1">
                                            <Card className="h-full">
                                                <CardHeader>
                                                    <CardTitle>Visualisasi Peta</CardTitle>
                                                    <CardDescription>Jejak pergerakan prajurit di area latihan</CardDescription>
                                                </CardHeader>
                                                <CardContent>
                                                    <div className="relative w-full h-[620px] bg-gray-200 rounded-lg overflow-hidden">
                                                        <Image src="/maps/lapangan_a.jpg" alt="Peta Latihan" fill className="object-cover" />
                                                        <svg className="absolute top-0 left-0 w-full h-full">
                                                            {mapPath.length > 1 && (
                                                                <polyline
                                                                    points={mapPath.map(p => `${p.x},${p.y}`).join(' ')}
                                                                    fill="none"
                                                                    stroke="rgba(59, 130, 246, 0.7)"
                                                                    strokeWidth="3"
                                                                />
                                                            )}
                                                            {mapPath.length > 0 && (
                                                                <circle
                                                                    cx={mapPath[mapPath.length - 1].x}
                                                                    cy={mapPath[mapPath.length - 1].y}
                                                                    r="6"
                                                                    fill="#ef4444"
                                                                    stroke="white"
                                                                    strokeWidth="2"
                                                                />
                                                            )}
                                                        </svg>
                                                    </div>
                                                </CardContent>
                                            </Card>
                                        </div>
                                    </div>
                                ) : (
                                    <Card>
                                        <CardContent className="text-center py-10">
                                            <WifiOff className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                                            <h3 className="text-lg font-medium text-red-700 mb-2">Koneksi Device Terputus!</h3>
                                            <p className="text-gray-500 mb-4">
                                                Data performa tidak dapat dicatat. Coba sambungkan ulang device Anda.
                                            </p>
                                            <Button onClick={() => setIsDeviceConnected(true)} className="flex items-center gap-2 mx-auto">
                                                <Wifi className="h-4 w-4" />
                                                Coba Koneksi Ulang
                                            </Button>
                                        </CardContent>
                                    </Card>
                                )}
                            </>
                        ) : lastActiveSession ? (
                            <Card>
                                <CardHeader>
                                    <CardTitle className="flex items-center gap-2">
                                        <Play className="h-5 w-5 text-blue-500" />
                                        Lanjutkan Sesi Latihan
                                    </CardTitle>
                                    <CardDescription>
                                        Anda sebelumnya keluar dari sesi: <span className="font-semibold">{lastActiveSession.name}</span>.
                                    </CardDescription>
                                </CardHeader>
                                <CardContent>
                                    <p className="text-sm text-gray-600 mb-4">
                                        Data monitoring Anda masih berjalan. Gabung kembali untuk melanjutkan.
                                    </p>
                                    <Button onClick={handleRejoinSession} className="w-full flex items-center gap-2">
                                        <Activity className="h-4 w-4" />
                                        Gabung Kembali
                                    </Button>
                                </CardContent>
                            </Card>
                        ) : (
                            // Tampilan default jika tidak ada sesi aktif
                            <>
                                {/* Device Connection Card */}
                                <Card>
                                    <CardHeader>
                                        <CardTitle className="flex items-center gap-2">
                                            {isDeviceConnected ? <Wifi className="h-5 w-5 text-green-500" /> : <WifiOff className="h-5 w-5 text-red-500" />}
                                            Koneksi Device
                                        </CardTitle>
                                        <CardDescription>
                                            Hubungkan device monitoring untuk melacak aktivitas real-time (tanpa sesi)
                                        </CardDescription>
                                    </CardHeader>

                                    <CardContent>
                                        <div className="flex items-center justify-between">
                                            <div className="flex items-center gap-3">
                                                <Switch
                                                    checked={isDeviceConnected}
                                                    onCheckedChange={handleDeviceToggle}
                                                />
                                                <Label>
                                                    {isDeviceConnected ? 'Device Terhubung - Monitoring Aktif' : 'Device Tidak Terhubung'}
                                                </Label>
                                            </div>

                                            {/* Status indicator saat device connected */}
                                            {isDeviceConnected && (
                                                <Badge variant="default" className="bg-green-500">
                                                    <Activity className="h-4 w-4 mr-1" />
                                                    Monitoring Aktif
                                                </Badge>
                                            )}
                                        </div>
                                    </CardContent>
                                </Card>

                                {/* Real-time Stats for non-session monitoring */}
                                {isDeviceConnected && (
                                    <div className="grid lg:grid-cols-3 gap-6">
                                        {/* Kolom Kiri: Stats dan Charts */}
                                        <div className="lg:col-span-2 space-y-6">
                                            {/* Stat Cards */}
                                            <div className="grid md:grid-cols-2 xl:grid-cols-4 gap-4">
                                                <Card>
                                                    <CardContent className="pt-4">
                                                        <div className="flex items-center gap-3">
                                                            <Heart className="h-8 w-8 text-red-500" />
                                                            <div>
                                                                <p className="text-sm text-gray-600">Detak Jantung</p>
                                                                <p className="text-2xl font-bold">{currentStats.heartRate} BPM</p>
                                                            </div>
                                                        </div>
                                                    </CardContent>
                                                </Card>
                                                <Card>
                                                    <CardContent className="pt-4">
                                                        <div className="flex items-center gap-3">
                                                            <Zap className="h-8 w-8 text-yellow-500" />
                                                            <div>
                                                                <p className="text-sm text-gray-600">Kecepatan</p>
                                                                <p className="text-2xl font-bold">{currentStats.speed} km/h</p>
                                                            </div>
                                                        </div>
                                                    </CardContent>
                                                </Card>
                                                <Card>
                                                    <CardContent className="pt-4">
                                                        <div className="flex items-center gap-3">
                                                            <Route className="h-8 w-8 text-blue-500" />
                                                            <div>
                                                                <p className="text-sm text-gray-600">Jarak Tempuh</p>
                                                                <p className="text-2xl font-bold">{currentStats.distance} km</p>
                                                            </div>
                                                        </div>
                                                    </CardContent>
                                                </Card>
                                                <Card>
                                                    <CardContent className="pt-4">
                                                        <div className="flex items-center gap-3">
                                                            <Activity className="h-8 w-8 text-green-500" />
                                                            <div>
                                                                <p className="text-sm text-gray-600">Status</p>
                                                                <div className="mt-1">
                                                                    {getHealthStatusBadge(currentStats.healthStatus)}
                                                                </div>
                                                            </div>
                                                        </div>
                                                    </CardContent>
                                                </Card>
                                            </div>

                                            {/* Heart Rate Chart Card */}
                                            <Card>
                                                <CardHeader>
                                                    <div className="flex items-center justify-between">
                                                        <div>
                                                            <CardTitle>Chart Detak Jantung</CardTitle>
                                                            <CardDescription>Analisis detak jantung berdasarkan waktu</CardDescription>
                                                        </div>
                                                        <div className="flex items-center gap-1">
                                                            {['realtime', '1m', '5m', '10m'].map(interval => (
                                                                <Button
                                                                    key={interval}
                                                                    size="sm"
                                                                    variant={heartRateInterval === interval ? 'default' : 'outline'}
                                                                    onClick={() => setHeartRateInterval(interval)}
                                                                >
                                                                    {interval === 'realtime' ? 'Live' : interval}
                                                                </Button>
                                                            ))}
                                                        </div>
                                                    </div>
                                                </CardHeader>
                                                <CardContent>
                                                    <ChartContainer config={chartConfig} className="h-[250px]">
                                                        <ResponsiveContainer width="100%" height="100%">
                                                            <LineChart data={displayedHeartRateData}>
                                                                <CartesianGrid strokeDasharray="3 3" />
                                                                <XAxis dataKey="time" />
                                                                <YAxis domain={[60, 140]} />
                                                                <ChartTooltip content={<ChartTooltipContent />} />
                                                                <Line type="monotone" dataKey="heartRate" stroke={chartConfig.heartRate.color} strokeWidth={2} dot={false} />
                                                            </LineChart>
                                                        </ResponsiveContainer>
                                                    </ChartContainer>
                                                </CardContent>
                                            </Card>

                                            {/* Speed Chart Card */}
                                            <Card>
                                                <CardHeader>
                                                    <div className="flex items-center justify-between">
                                                        <div>
                                                            <CardTitle>Chart Kecepatan</CardTitle>
                                                            <CardDescription>Analisis kecepatan pergerakan berdasarkan waktu</CardDescription>
                                                        </div>
                                                        <div className="flex items-center gap-1">
                                                            {['realtime', '1m', '5m', '10m'].map(interval => (
                                                                <Button
                                                                    key={interval}
                                                                    size="sm"
                                                                    variant={speedInterval === interval ? 'default' : 'outline'}
                                                                    onClick={() => setSpeedInterval(interval)}
                                                                >
                                                                    {interval === 'realtime' ? 'Live' : interval}
                                                                </Button>
                                                            ))}
                                                        </div>
                                                    </div>
                                                </CardHeader>
                                                <CardContent>
                                                    <ChartContainer config={chartConfig} className="h-[250px]">
                                                        <ResponsiveContainer width="100%" height="100%">
                                                            <LineChart data={displayedSpeedData}>
                                                                <CartesianGrid strokeDasharray="3 3" />
                                                                <XAxis dataKey="time" />
                                                                <YAxis domain={[0, 20]} />
                                                                <ChartTooltip content={<ChartTooltipContent />} />
                                                                <Line type="monotone" dataKey="speed" stroke={chartConfig.speed.color} strokeWidth={2} dot={false} />
                                                            </LineChart>
                                                        </ResponsiveContainer>
                                                    </ChartContainer>
                                                </CardContent>
                                            </Card>
                                        </div>

                                        {/* Kolom Kanan: Peta */}
                                        <div className="lg:col-span-1">
                                            <Card className="h-full">
                                                <CardHeader>
                                                    <CardTitle>Visualisasi Peta</CardTitle>
                                                    <CardDescription>Jejak pergerakan prajurit di area latihan</CardDescription>
                                                </CardHeader>
                                                <CardContent>
                                                    <div className="relative w-full h-[620px] bg-gray-200 rounded-lg overflow-hidden">
                                                        <Image src="/maps/lapangan_a.jpg" alt="Peta Latihan" fill className="object-cover" />
                                                        <svg className="absolute top-0 left-0 w-full h-full">
                                                            {mapPath.length > 1 && (
                                                                <polyline
                                                                    points={mapPath.map(p => `${p.x},${p.y}`).join(' ')}
                                                                    fill="none"
                                                                    stroke="rgba(59, 130, 246, 0.7)"
                                                                    strokeWidth="3"
                                                                />
                                                            )}
                                                            {mapPath.length > 0 && (
                                                                <circle
                                                                    cx={mapPath[mapPath.length - 1].x}
                                                                    cy={mapPath[mapPath.length - 1].y}
                                                                    r="6"
                                                                    fill="#ef4444"
                                                                    stroke="white"
                                                                    strokeWidth="2"
                                                                />
                                                            )}
                                                        </svg>
                                                    </div>
                                                </CardContent>
                                            </Card>
                                        </div>
                                    </div>
                                )}

                                {/* Empty state jika device tidak terhubung */}
                                {!isDeviceConnected && (
                                    <Card>
                                        <CardContent className="text-center py-10">
                                            <WifiOff className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                                            <h3 className="text-lg font-medium text-gray-900 mb-2">Tidak Ada Sesi Aktif</h3>
                                            <p className="text-gray-500 mb-4">
                                                Ikuti sesi latihan atau hubungkan device secara manual untuk memulai monitoring.
                                            </p>
                                        </CardContent>
                                    </Card>
                                )}
                            </>
                        )}
                    </TabsContent>
                </Tabs>

                {/* Modal untuk validasi koneksi device */}
                <Dialog open={showConnectionModal} onOpenChange={setShowConnectionModal}>
                    <DialogContent>
                        <DialogHeader>
                            <DialogTitle className="flex items-center gap-2">
                                <WifiOff className="h-5 w-5 text-red-500" />
                                Koneksi Device Diperlukan
                            </DialogTitle>
                            <DialogDescription>
                                Device monitoring Anda tidak terhubung. Harap hubungkan device untuk dapat memulai sesi latihan dan mencatat performa Anda.
                            </DialogDescription>
                        </DialogHeader>
                        <DialogFooter>
                            <Button variant="outline" onClick={() => setShowConnectionModal(false)}>Batal</Button>
                            <Button onClick={handleConnectAndStartSession} className="flex items-center gap-2">
                                <Wifi className="h-4 w-4" />
                                Hubungkan dan Mulai Sesi
                            </Button>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>
            </div>
        </div>
    );
}

/**
 * Cara penggunaan:
 * 
 * 1. Dashboard 3 tab: Profile, Sesi Latihan, Monitoring
 * 2. Profile: Data pribadi prajurit
 * 3. Sesi Latihan: List sesi tersedia dengan tombol ikut
 * 4. Monitoring: Device connection + real-time chart
 * 
 * Features:
 * - Device simulation dengan Switch toggle
 * - Real-time heart rate chart menggunakan Shadcn Chart
 * - Data increment dummy setiap detik
 * - Status kesehatan berdasarkan heart rate:
 *   - Normal: 60-100 BPM
 *   - Tinggi: 100-120 BPM
 *   - Rendah: <60 BPM
 *   - Bahaya: >120 BPM
 * - Responsive design dengan Tailwind
 * - Interactive buttons dan state management
 * 
 * Next steps:
 * - Integrasikan dengan API sesi latihan
 * - Implementasi join session functionality
 * - Connect dengan real device via WebSocket
 * - Tambah notifikasi real-time
 */