'use client'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/Shadcn/card';
import { Button } from '@/components/Shadcn/button';
import { Badge } from '@/components/Shadcn/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/Shadcn/avatar';
import { Progress } from '@/components/Shadcn/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/Shadcn/tabs';
import { Input } from '@/components/Shadcn/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/Shadcn/select';
import { 
  Activity, 
  MapPin, 
  Clock,
  Heart,
  Zap,
  Route,
  User,
  Search,
  Filter,
  History,
  Plus,
  Play,
  Square,
  Edit,
  Wifi,
  WifiOff,
  FileText,
  Users,
  Calendar
} from 'lucide-react';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/Shadcn/dialog";
import { ScrollArea } from "@/components/Shadcn/scroll-area";
import { Separator } from "@/components/Shadcn/separator";
import { Label } from "@/components/Shadcn/label";

export default function KomandanDashboard() {
  const router = useRouter();
  
  // State untuk sesi aktif dan monitoring
  const [activeSessions, setActiveSessions] = useState([]);
  const [monitoringData, setMonitoringData] = useState({});
  const [isSessionStarted, setIsSessionStarted] = useState(false);

  // State untuk modal detail prajurit
  const [selectedPrajurit, setSelectedPrajurit] = useState(null);
  const [showDetailModal, setShowDetailModal] = useState(false);

  // Data dummy sesi aktif dengan status device
  const [sesiAktif] = useState([
    {
      id: 1,
      nama: "Latihan Tembak Siang",
      waktu: "2024-06-21 14:00",
      lokasi: "Lapangan A",
      status: "berlangsung",
      isStarted: false,
      prajurit: [
        {
          id: 1,
          nama: "Budi Santoso",
          avatar: "/avatars/budi.jpg",
          heartRate: 85,
          speed: 12.5,
          distance: 2.3,
          status: "sehat",
          deviceConnected: true,
          stats: {
            heartRate: 0,
            speed: 0,
            distance: 0
          }
        },
        {
          id: 2,
          nama: "Ahmad Yusuf",
          avatar: "/avatars/ahmad.jpg",
          heartRate: 95,
          speed: 15.1,
          distance: 3.1,
          status: "lelah",
          deviceConnected: false,
          stats: {
            heartRate: 0,
            speed: 0,
            distance: 0
          }
        }
      ]
    }
  ]);

  // Data dummy semua prajurit
  const [allPrajurit] = useState([
    {
      id: 1,
      nama: "Budi Santoso",
      unit: "Kompi A",
      pangkat: "Sersan Dua",
      avatar: "/avatars/budi.jpg",
      status: "aktif"
    },
    {
      id: 2,
      nama: "Siti Aminah",
      unit: "Kompi B",
      pangkat: "Kopral",
      avatar: "/avatars/siti.jpg",
      status: "aktif"
    },
    // ... tambahkan data prajurit lainnya
  ]);

  // State untuk filter prajurit
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedUnit, setSelectedUnit] = useState('semua');

  // Data dummy untuk detail prajurit
  const prajuritDetails = {
    1: {
      id: 1,
      nama: "Budi Santoso",
      username: "budi123",
      pangkat: "Sersan Dua",
      unit: "Kompi A Rajawali",
      avatar: "/avatars/budi.jpg",
      joinDate: "2023-01-15",
      activeSessions: ["Latihan Tembak Siang"],
      medicalHistory: [
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
        }
      ]
    },
    2: {
      id: 2,
      nama: "Ahmad Yusuf",
      username: "ahmad456",
      pangkat: "Kopral Kepala",
      unit: "Kompi B Garuda",
      avatar: "/avatars/ahmad.jpg",
      joinDate: "2022-08-20",
      activeSessions: ["Latihan Tembak Siang"],
      medicalHistory: [
        {
          id: 1,
          checkupDate: "2024-06-10",
          examiner: "Tim Medis Kompi B",
          generalCondition: "Cukup",
          notes: "Riwayat cedera lutut ringan, sudah dalam pemulihan.",
          weight: 68,
          height: 170,
          bmi: 23.5,
          bloodPressure: "125/85 mmHg",
          pulse: 75,
          temperature: 36.8,
          glucose: 95,
          cholesterol: 175,
          hemoglobin: 14.0,
          otherDiseases: "Cedera lutut (dalam pemulihan)"
        }
      ]
    }
  };

  // Function untuk memulai sesi
  const startSession = (sessionId) => {
    setActiveSessions(prev => 
      prev.map(session => 
        session.id === sessionId 
          ? { ...session, isStarted: true }
          : session
      )
    );
    setIsSessionStarted(true);
  };

  // Function untuk mengakhiri sesi
  const endSession = (sessionId) => {
    setActiveSessions(prev => 
      prev.map(session => 
        session.id === sessionId 
          ? { ...session, isStarted: false }
          : session
      )
    );
    setIsSessionStarted(false);
    // Di sini bisa ditambahkan logic untuk menyimpan data statistik
  };

  // Effect untuk simulasi update data real-time
  useEffect(() => {
    let interval;
    if (isSessionStarted) {
      interval = setInterval(() => {
        setMonitoringData(prev => {
          const newData = { ...prev };
          sesiAktif[0].prajurit.forEach(prajurit => {
            if (prajurit.deviceConnected) {
              newData[prajurit.id] = {
                heartRate: Math.floor(Math.random() * (120 - 70) + 70),
                speed: parseFloat((Math.random() * (15 - 1) + 1).toFixed(1)),
                distance: parseFloat((prev[prajurit.id]?.distance || 0) + Math.random() * 0.1).toFixed(2)
              };
            }
          });
          return newData;
        });
      }, 2000);
    }
    return () => clearInterval(interval);
  }, [isSessionStarted, sesiAktif]);

  // Helper function untuk status badge
  const getStatusBadge = (status) => {
    switch(status) {
      case 'sehat':
        return <Badge variant="default" className="bg-green-500">Sehat</Badge>;
      case 'lelah':
        return <Badge variant="outline" className="border-yellow-500 text-yellow-600">Lelah</Badge>;
      case 'bahaya':
        return <Badge variant="destructive">Bahaya</Badge>;
      default:
        return <Badge variant="secondary">{status}</Badge>;
    }
  };

  // Helper function untuk device status
  const getDeviceStatusBadge = (isConnected) => {
    return isConnected ? (
      <Badge variant="default" className="bg-green-500 flex items-center gap-1">
        <Wifi className="h-3 w-3" />
        Terhubung
      </Badge>
    ) : (
      <Badge variant="destructive" className="flex items-center gap-1">
        <WifiOff className="h-3 w-3" />
        Terputus
      </Badge>
    );
  };

  // Helper function untuk progress value
  const getProgressValue = (value, max) => Math.min(Math.round((value / max) * 100), 100);

  // Filter prajurit berdasarkan pencarian dan unit
  const filteredPrajurit = allPrajurit.filter(prajurit => {
    const matchSearch = prajurit.nama.toLowerCase().includes(searchTerm.toLowerCase()) ||
                       prajurit.pangkat.toLowerCase().includes(searchTerm.toLowerCase());
    const matchUnit = selectedUnit === 'semua' || prajurit.unit === selectedUnit;
    return matchSearch && matchUnit;
  });

  // Function untuk menampilkan modal detail prajurit
  const showPrajuritDetail = (prajuritId) => {
    setSelectedPrajurit(prajuritDetails[prajuritId]);
    setShowDetailModal(true);
  };

  // Helper function untuk badge sesi aktif
  const getActiveSessionBadge = (sessions) => {
    if (sessions && sessions.length > 0) {
      return (
        <Badge variant="outline" className="border-blue-500 text-blue-600 flex items-center gap-1">
          <Activity className="h-3 w-3" />
          {sessions[0]}
        </Badge>
      );
    }
    return null;
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-3xl font-bold">Dashboard Komandan</h1>
          <Button variant="outline" size="sm">
            <User className="h-4 w-4 mr-2" />
            Profile
          </Button>
        </div>

        {/* Main Tabs */}
        <Tabs defaultValue="sesi-aktif" className="space-y-6">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="sesi-aktif" className="flex items-center gap-2">
              <Activity className="h-4 w-4" />
              Sesi Aktif
            </TabsTrigger>
            <TabsTrigger value="prajurit" className="flex items-center gap-2">
              <User className="h-4 w-4" />
              Daftar Prajurit
            </TabsTrigger>
            <TabsTrigger value="sesi-latihan" className="flex items-center gap-2">
              <History className="h-4 w-4" />
              Sesi Latihan
            </TabsTrigger>
          </TabsList>

          {/* Tab Sesi Aktif */}
          <TabsContent value="sesi-aktif">
            {sesiAktif.length > 0 ? (
              <div className="grid gap-6">
                {sesiAktif.map(sesi => (
                  <Card key={sesi.id}>
                    <CardHeader>
                      <div className="flex items-center justify-between">
                        <div>
                          <CardTitle>{sesi.nama}</CardTitle>
                          <CardDescription>
                            <div className="flex items-center gap-2">
                              <Clock className="h-4 w-4" /> {sesi.waktu}
                              <MapPin className="h-4 w-4" /> {sesi.lokasi}
                            </div>
                          </CardDescription>
                        </div>
                        <div className="flex items-center gap-2">
                          <Button
                            variant="outline"
                            onClick={() => router.push(`/komandan/kelola_latihan?id=${sesi.id}`)}
                          >
                            <Edit className="h-4 w-4 mr-2" />
                            Edit Sesi
                          </Button>
                          {!isSessionStarted ? (
                            <Button onClick={() => startSession(sesi.id)}>
                              <Play className="h-4 w-4 mr-2" />
                              Mulai Sesi
                            </Button>
                          ) : (
                            <Button variant="destructive" onClick={() => endSession(sesi.id)}>
                              <Square className="h-4 w-4 mr-2" />
                              Selesai
                            </Button>
                          )}
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="grid gap-4">
                        {sesi.prajurit
                          .sort((a, b) => (a.deviceConnected === b.deviceConnected ? 0 : a.deviceConnected ? 1 : -1))
                          .map(prajurit => {
                            const detail = prajuritDetails[prajurit.id];
                            return (
                              <Card key={prajurit.id} className={`border-l-4 ${prajurit.deviceConnected ? 'border-l-green-500' : 'border-l-red-500'}`}>
                                <CardContent className="pt-4">
                                  <div className="flex items-center gap-4">
                                    <Avatar className="h-16 w-16">
                                      <AvatarImage src={prajurit.avatar} alt={prajurit.nama} />
                                      <AvatarFallback>{prajurit.nama.split(' ').map(n => n[0]).join('')}</AvatarFallback>
                                    </Avatar>
                                    <div className="flex-1">
                                      <div className="flex items-center justify-between mb-2">
                                        <div>
                                          <h4 className="font-semibold text-lg">{detail.nama}</h4>
                                          <p className="text-sm text-gray-600">{detail.pangkat} • {detail.unit}</p>
                                        </div>
                                        {getDeviceStatusBadge(prajurit.deviceConnected)}
                                      </div>
                                      <div className="flex items-center gap-2">
                                        {isSessionStarted && prajurit.deviceConnected && (
                                          getStatusBadge(prajurit.status)
                                        )}
                                        <Button
                                          variant="outline"
                                          size="sm"
                                          onClick={() => showPrajuritDetail(prajurit.id)}
                                          className="ml-auto"
                                        >
                                          <FileText className="h-4 w-4 mr-2" />
                                          Lihat Detail
                                        </Button>
                                      </div>
                                    </div>
                                  </div>
                                  {isSessionStarted && prajurit.deviceConnected && monitoringData[prajurit.id] && (
                                    <div className="space-y-2">
                                      <div>
                                        <div className="flex justify-between text-xs mb-1">
                                          <span className="flex items-center gap-1">
                                            <Heart className="h-3 w-3 text-red-500" />Detak Jantung
                                          </span>
                                          <span>{monitoringData[prajurit.id].heartRate} bpm</span>
                                        </div>
                                        <Progress value={getProgressValue(monitoringData[prajurit.id].heartRate, 200)} />
                                      </div>
                                      <div>
                                        <div className="flex justify-between text-xs mb-1">
                                          <span className="flex items-center gap-1">
                                            <Zap className="h-3 w-3 text-yellow-500" />Kecepatan
                                          </span>
                                          <span>{monitoringData[prajurit.id].speed} km/h</span>
                                        </div>
                                        <Progress value={getProgressValue(monitoringData[prajurit.id].speed, 30)} />
                                      </div>
                                      <div>
                                        <div className="flex justify-between text-xs mb-1">
                                          <span className="flex items-center gap-1">
                                            <Route className="h-3 w-3 text-blue-500" />Jarak
                                          </span>
                                          <span>{monitoringData[prajurit.id].distance} km</span>
                                        </div>
                                        <Progress value={getProgressValue(monitoringData[prajurit.id].distance, 10)} />
                                      </div>
                                    </div>
                                  )}
                                  {isSessionStarted && !prajurit.deviceConnected && (
                                    <div className="text-center py-3 text-sm text-red-500">
                                      Device tidak terhubung. Data tidak dapat dimonitor.
                                    </div>
                                  )}
                                </CardContent>
                              </Card>
                            );
                          })}
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <Card>
                <CardContent className="text-center py-10">
                  <Activity className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">Tidak Ada Sesi Aktif</h3>
                  <p className="text-gray-500">
                    Saat ini tidak ada sesi latihan yang sedang berlangsung.
                  </p>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          {/* Tab Daftar Prajurit */}
          <TabsContent value="prajurit">
            <Card>
              <CardHeader>
                <CardTitle>Daftar Prajurit</CardTitle>
                <CardDescription>Kelola dan pantau prajurit</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex gap-4 mb-6">
                  <div className="flex-1">
                    <div className="relative">
                      <Search className="absolute left-2 top-2.5 h-4 w-4 text-gray-500" />
                      <Input
                        placeholder="Cari prajurit..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="pl-8"
                      />
                    </div>
                  </div>
                  <div className="w-48">
                    <Select value={selectedUnit} onValueChange={setSelectedUnit}>
                      <SelectTrigger>
                        <SelectValue placeholder="Filter Unit" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="semua">Semua Unit</SelectItem>
                        <SelectItem value="Kompi A">Kompi A</SelectItem>
                        <SelectItem value="Kompi B">Kompi B</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="grid md:grid-cols-2 gap-4">
                  {filteredPrajurit.map(prajurit => {
                    const detail = prajuritDetails[prajurit.id];
                    return (
                      <Card key={prajurit.id}>
                        <CardContent className="pt-4">
                          <div className="flex items-center gap-4">
                            <Avatar className="h-16 w-16">
                              <AvatarImage src={prajurit.avatar} alt={prajurit.nama} />
                              <AvatarFallback>{prajurit.nama.split(' ').map(n => n[0]).join('')}</AvatarFallback>
                            </Avatar>
                            <div className="flex-1">
                              <div className="flex items-center justify-between mb-2">
                                <div>
                                  <h4 className="font-semibold text-lg">{detail.nama}</h4>
                                  <p className="text-sm text-gray-600">{detail.pangkat} • {detail.unit}</p>
                                </div>
                              </div>
                              <div className="flex items-center gap-2">
                                {detail.activeSessions && getActiveSessionBadge(detail.activeSessions)}
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => showPrajuritDetail(prajurit.id)}
                                  className="ml-auto"
                                >
                                  <FileText className="h-4 w-4 mr-2" />
                                  Lihat Detail
                                </Button>
                              </div>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Tab Sesi Latihan (sebelumnya History) */}
          <TabsContent value="sesi-latihan">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <div>
                  <CardTitle>Sesi Latihan</CardTitle>
                  <CardDescription>Kelola semua sesi latihan</CardDescription>
                </div>
                <Button onClick={() => router.push('/komandan/kelola_latihan')}>
                  <Plus className="h-4 w-4 mr-2" />
                  Buat Sesi Latihan
                </Button>
              </CardHeader>
              <CardContent>
                <div className="grid gap-4">
                  {[
                    {
                      id: 1,
                      nama: "Latihan Tembak Siang",
                      waktu: "2024-06-21 14:00",
                      lokasi: "Lapangan A",
                      status: "berlangsung",
                      komandan: "Mayor Suharto",
                      totalPrajurit: 15,
                      totalMedis: 2
                    },
                    {
                      id: 2,
                      nama: "Latihan Fisik Pagi",
                      waktu: "2024-06-22 06:00",
                      lokasi: "Lapangan B",
                      status: "terjadwal",
                      komandan: "Kapten Ahmad",
                      totalPrajurit: 20,
                      totalMedis: 3
                    },
                    {
                      id: 3,
                      nama: "Latihan Strategi",
                      waktu: "2024-06-20 09:00",
                      lokasi: "Ruang Briefing",
                      status: "selesai",
                      komandan: "Mayor Budi",
                      totalPrajurit: 12,
                      totalMedis: 1
                    }
                  ].map(sesi => (
                    <Card key={sesi.id} className={`
                      border-l-4 
                      ${sesi.status === 'berlangsung' ? 'border-l-green-500' : 
                        sesi.status === 'terjadwal' ? 'border-l-blue-500' : 
                        'border-l-gray-500'}
                    `}>
                      <CardContent className="pt-4">
                        <div className="flex items-center justify-between">
                          <div>
                            <h4 className="font-semibold">{sesi.nama}</h4>
                            <div className="flex items-center gap-2 text-sm text-gray-600">
                              <Clock className="h-4 w-4" /> {sesi.waktu}
                              <MapPin className="h-4 w-4" /> {sesi.lokasi}
                            </div>
                            <div className="flex items-center gap-2 mt-2">
                              <Badge variant={
                                sesi.status === 'berlangsung' ? 'default' :
                                sesi.status === 'terjadwal' ? 'outline' :
                                'secondary'
                              }>
                                {sesi.status === 'berlangsung' ? 'Sedang Berlangsung' :
                                 sesi.status === 'terjadwal' ? 'Terjadwal' :
                                 'Selesai'}
                              </Badge>
                              <Badge variant="outline">{sesi.totalPrajurit} Prajurit</Badge>
                              <Badge variant="outline">{sesi.totalMedis} Medis</Badge>
                            </div>
                            <p className="text-sm text-gray-600 mt-1">
                              Komandan: {sesi.komandan}
                            </p>
                          </div>
                          <Button 
                            variant="outline"
                            onClick={() => router.push(`/komandan/kelola_latihan?id=${sesi.id}`)}
                          >
                            Kelola
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>

      {/* Modal Detail Prajurit */}
      {showDetailModal && selectedPrajurit && (
        <Dialog open={showDetailModal} onOpenChange={setShowDetailModal}>
          <DialogContent className="max-w-3xl">
            <DialogHeader>
              <DialogTitle>Detail Prajurit</DialogTitle>
              <DialogDescription>
                Informasi lengkap dan riwayat kesehatan
              </DialogDescription>
            </DialogHeader>

            <ScrollArea className="max-h-[80vh]">
              <div className="space-y-6 p-6">
                {/* Profile Section */}
                <div className="flex items-center gap-4">
                  <Avatar className="h-20 w-20">
                    <AvatarImage src={selectedPrajurit.avatar} alt={selectedPrajurit.nama} />
                    <AvatarFallback>{selectedPrajurit.nama.split(' ').map(n => n[0]).join('')}</AvatarFallback>
                  </Avatar>
                  <div>
                    <h3 className="text-xl font-semibold">{selectedPrajurit.nama}</h3>
                    <p className="text-gray-600">{selectedPrajurit.pangkat}</p>
                    <p className="text-gray-600">{selectedPrajurit.unit}</p>
                  </div>
                </div>

                <Separator />

                {/* Basic Info */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label className="text-sm text-gray-500">Username</Label>
                    <p className="font-medium">{selectedPrajurit.username}</p>
                  </div>
                  <div>
                    <Label className="text-sm text-gray-500">Tanggal Bergabung</Label>
                    <p className="font-medium">{new Date(selectedPrajurit.joinDate).toLocaleDateString('id-ID')}</p>
                  </div>
                </div>

                {/* Active Sessions */}
                {selectedPrajurit.activeSessions && selectedPrajurit.activeSessions.length > 0 && (
                  <>
                    <Separator />
                    <div>
                      <h4 className="font-semibold mb-2 flex items-center gap-2">
                        <Activity className="h-4 w-4" />
                        Sesi Latihan Aktif
                      </h4>
                      <div className="space-y-2">
                        {selectedPrajurit.activeSessions.map((session, idx) => (
                          <Badge key={idx} variant="outline" className="mr-2">
                            {session}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  </>
                )}

                {/* Medical History */}
                <Separator />
                <div>
                  <h4 className="font-semibold mb-4 flex items-center gap-2">
                    <Heart className="h-4 w-4 text-red-500" />
                    Riwayat Kesehatan
                  </h4>
                  <div className="space-y-4">
                    {selectedPrajurit.medicalHistory.map((record) => (
                      <Card key={record.id} className="border-l-4 border-l-red-500">
                        <CardContent className="p-4">
                          <div className="flex justify-between items-start mb-2">
                            <div>
                              <h4 className="font-semibold">Pemeriksaan {new Date(record.checkupDate).toLocaleDateString('id-ID')}</h4>
                              <p className="text-sm text-gray-500">Oleh: {record.examiner}</p>
                            </div>
                            <Badge variant={record.generalCondition === 'Baik' ? 'default' : 'outline'} className={record.generalCondition === 'Baik' ? 'bg-green-500' : ''}>
                              {record.generalCondition}
                            </Badge>
                          </div>
                          <Separator className="my-2" />
                          <div className="grid grid-cols-2 gap-4 text-sm">
                            <div>
                              <Label className="text-gray-500">Berat/Tinggi</Label>
                              <p className="font-medium">{record.weight} kg / {record.height} cm</p>
                            </div>
                            <div>
                              <Label className="text-gray-500">IMT</Label>
                              <p className="font-medium">{record.bmi}</p>
                            </div>
                            <div>
                              <Label className="text-gray-500">Tekanan Darah</Label>
                              <p className="font-medium">{record.bloodPressure}</p>
                            </div>
                            <div>
                              <Label className="text-gray-500">Denyut Nadi</Label>
                              <p className="font-medium">{record.pulse} bpm</p>
                            </div>
                            <div>
                              <Label className="text-gray-500">Suhu Tubuh</Label>
                              <p className="font-medium">{record.temperature} °C</p>
                            </div>
                            <div>
                              <Label className="text-gray-500">Gula Darah</Label>
                              <p className="font-medium">{record.glucose} mg/dL</p>
                            </div>
                            <div>
                              <Label className="text-gray-500">Kolesterol</Label>
                              <p className="font-medium">{record.cholesterol} mg/dL</p>
                            </div>
                            <div>
                              <Label className="text-gray-500">Hemoglobin</Label>
                              <p className="font-medium">{record.hemoglobin} g/dL</p>
                            </div>
                          </div>
                          <Separator className="my-2" />
                          <div className="space-y-2">
                            <div>
                              <Label className="text-gray-500">Catatan Pemeriksaan</Label>
                              <p className="text-sm">{record.notes}</p>
                            </div>
                            <div>
                              <Label className="text-gray-500">Penyakit Lain</Label>
                              <p className="text-sm">{record.otherDiseases}</p>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </div>
              </div>
            </ScrollArea>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}

/**
 * Cara penggunaan:
 * - Semua fitur dan visualisasi menggunakan komponen Shadcn (Card, Button, Badge, Progress, Avatar, dsb)
 * - Progress bar menggantikan chart untuk visualisasi data prajurit
 * - Toggle grid/list peserta tetap pakai Button Shadcn
 * - Daftar prajurit di luar sesi untuk diundang
 *
 * Next steps:
 * - Integrasi API dan database
 * - Real-time update status prajurit
 */

// Semua komponen utama (Card, Button, Badge, Avatar, Tabs, Input, dsb) sudah menggunakan Shadcn
// Komentar tambahan untuk penjelasan penggunaan komponen Shadcn

// Contoh penggunaan komponen Shadcn:
// <Card> dan <CardContent> untuk layout box
// <Button> untuk aksi (toggle, undang, dsb)
// <Badge> untuk status
// <Avatar> untuk foto prajurit
// <Tabs> jika ingin menambah tab navigasi

// Pada bagian toggle grid/list:
// <Button variant={viewMode === 'grid' ? 'default' : 'outline'} size="sm" ...>
//   <Grid3X3 className="h-4 w-4" />
// </Button>
// <Button variant={viewMode === 'list' ? 'default' : 'outline'} size="sm" ...>
//   <List className="h-4 w-4" />
// </Button>

// Pada badge status:
// {getStatusBadge(prajurit.status)} // Sudah pakai <Badge> dari Shadcn

// Pada tombol undang:
// <Button variant="outline" size="sm" className="ml-auto">Undang</Button>

// Semua input dan form (jika ada) gunakan <Input>, <Select>, <Textarea> dari Shadcn