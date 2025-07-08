'use client'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/Shadcn/card';
import { Button } from '@/components/Shadcn/button';
import { Badge } from '@/components/Shadcn/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/Shadcn/avatar';
import { Progress } from '@/components/Shadcn/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/Shadcn/tabs';
import { Input } from '@/components/Shadcn/input';
import { setSessionActive } from "@/actions/komandan/sessions_actions";
import MiniMapbox from "@/components/komandan/MiniMapbox";
import { setSessionCancelled } from "@/actions/komandan/sessions_actions";
import { logoutAction } from "@/actions/auth/logout";

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
  Calendar,
  LogOut
} from 'lucide-react';
import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from "@/components/Shadcn/dialog";
import { ScrollArea } from "@/components/Shadcn/scroll-area";
import { Separator } from "@/components/Shadcn/separator";
import { Label } from "@/components/Shadcn/label";
import { getAllPrajurit, getPrajuritDetail } from "@/actions/komandan/prajurit_actions";
import {
  getAllSessions,
  getSessionById,
  getAvailableUsersByRole,
  getAllLocations,
  setSessionFinished
} from "@/actions/komandan/sessions_actions";
import CreateSessionForm from "@/components/komandan/CreateSessionForm";
export default function KomandanDashboard() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const sesiId = Number(searchParams.get('id'));
  const [komandan, setKomandan] = useState([]);
  const [prajurit, setPrajurit] = useState([]);
  const [medis, setMedis] = useState([]);
  const [locations, setLocations] = useState([]);
  const [activeSessionId, setActiveSessionId] = useState(null);
  const [monitoringData, setMonitoringData] = useState({});
  const [showStartConfirm, setShowStartConfirm] = useState(false);
  const [showStopConfirm, setShowStopConfirm] = useState(false);
  const [sessionToModify, setSessionToModify] = useState(null);
  const [selectedPrajurit, setSelectedPrajurit] = useState(null);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [loadingDetail, setLoadingDetail] = useState(false);
  const [allSessions, setAllSessions] = useState([]);
  const activeSession = allSessions.find(s => s.id === activeSessionId);
  const [isStarted, setIsStarted] = useState(false);
  const [selectedUnit, setSelectedUnit] = useState('semua');
  const [initialData, setInitialData] = useState(null);
  const [monitoringStats, setMonitoringStats] = useState({});
  const [isRecording, setIsRecording] = useState(false);
  const [lastPositions, setLastPositions] = useState({});
  // Simulasi statistik monitoring (langsung jalan saat status "berlangsung")
  useEffect(() => {
    let interval;
    if (activeSession && activeSession.status === "berlangsung") {
      interval = setInterval(() => {
        setMonitoringStats(prevStats => {
          const newStats = {};
          setLastPositions(lastPrev => {
            const updatedPositions = { ...lastPrev };
            (activeSession.participants || []).forEach(p => {
              // Ambil posisi terakhir, default di tengah Monas
              let prevLat = lastPrev[p.id]?.lat ?? -6.1754;
              let prevLng = lastPrev[p.id]?.lng ?? 106.8272;

              // Simulasi kecepatan lari (2-5 m/s)
              const speed = 7 + Math.random() * 11; // 7-18 km/jam
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

              updatedPositions[p.id] = { lat, lng };

              // Simulasi statistik lain
              const heartRate = 90 + Math.round(Math.random() * 30);
              let status = "sehat";
              if (heartRate > 110) status = "lelah";
              if (heartRate > 120) status = "bahaya";
              newStats[p.id] = { heartRate, speed, lat, lng, status };
            });
            return updatedPositions;
          });
          return newStats;
        });
      }, 1000);
    } else {
      setMonitoringStats({});
      setLastPositions({});
    }
    return () => clearInterval(interval);
  }, [activeSession]);

  useEffect(() => {
    let interval;
    if (
      isRecording &&
      activeSession &&
      activeSession.status === "berlangsung" &&
      activeSession.participants &&
      activeSession.participants.length > 0
    ) {
      interval = setInterval(() => {
        // Generate data statistik baru (detak jantung, speed, status, lat, lng)
        const newStats = {};
        const updatedPositions = {};

        (activeSession.participants || []).forEach(p => {
          // Simulasi posisi (atau ambil dari device jika ada)
          let lat = -6.1754 + (Math.random() - 0.5) * 0.001;
          let lng = 106.8272 + (Math.random() - 0.5) * 0.001;

          // Simulasi statistik lain
          const heartRate = 90 + Math.round(Math.random() * 30);
          let status = "sehat";
          if (heartRate > 110) status = "lelah";
          if (heartRate > 120) status = "bahaya";
          const speed = 7 + Math.random() * 11; // 7-18 km/jam

          newStats[p.id] = { heartRate, speed, lat, lng, status };
          updatedPositions[p.id] = { lat, lng };
        });

        setMonitoringStats(newStats);
        setLastPositions(updatedPositions);

        // Simpan ke localStorage
        const prev = JSON.parse(localStorage.getItem('sessionStats') || '[]');
        prev.push({
          timestamp: new Date().toISOString(),
          stats: { ...newStats }
        });
        localStorage.setItem('sessionStats', JSON.stringify(prev));
        // Debug
        console.log("sessionStats:", localStorage.getItem('sessionStats'));
      }, 1000);
    } else {
      setMonitoringStats({});
      setLastPositions({});
    }
    return () => clearInterval(interval);
  }, [isRecording, activeSession]);
  // console.log("Kirim ke API:", {
  //   sessionId: activeSession.id,
  //   timestamp: new Date().toISOString(),
  //   stats: monitoringStats
  // });
  useEffect(() => {
    async function fetchSessions() {
      const data = await getAllSessions();
      setAllSessions(data);
    }
    fetchSessions();
  }, []);

  useEffect(() => {
    async function fetchData() {
      setInitialData(await getSessionById(sesiId));
    }
    fetchData();
  }, [sesiId]);

  // Data prajurit dari database

  useEffect(() => {
    async function fetchPrajurit() {
      const data = await getAllPrajurit();
      setPrajurit(data);
    }
    fetchPrajurit();
  }, []);

  // Handler untuk klik baris prajurit
  const handleShowPrajuritDetail = async (p) => {
    setLoadingDetail(true);
    setShowDetailModal(true);
    // Fetch detail dari server
    const detail = await getPrajuritDetail(p.id);
    setSelectedPrajurit(detail);
    setLoadingDetail(false);
  };
  const [searchTerm, setSearchTerm] = useState("");
  const confirmStartSession = (session) => {
    setSessionToModify(session);
    setShowStartConfirm(true);
  };

  const confirmStopSession = (session) => {
    setSessionToModify(session);
    setShowStopConfirm(true);
  };
  const handleStartSession = (sessionId) => {
    setAllSessions(prev =>
      prev.map(s =>
        s.id === sessionId
          ? { ...s, isStarted: true, status: 'berlangsung' }
          : s
      )
    );
    setActiveSessionId(sessionId);
    setIsStarted(true);
  }
  const startSession = () => {
    if (!sessionToModify) return;
    setAllSessions(prev =>
      prev.map(s =>
        s.id === sessionToModify.id
          ? { ...s, isStarted: true, status: 'berlangsung' }
          : s
      )
    );
    setShowStartConfirm(false);
    setSessionToModify(null);
  };

  const endSession = () => {
    if (!sessionToModify) return;
    setAllSessions(prev =>
      prev.map(s =>
        s.id === sessionToModify.id
          ? { ...s, isStarted: false, status: 'selesai' }
          : s
      )
    );
    setActiveSessionId(null);
    setShowStopConfirm(false);
    setSessionToModify(null);
  };
  useEffect(() => {
    async function fetchUsersAndLocations() {
      setKomandan(await getAvailableUsersByRole("komandan"));
      setPrajurit(await getAvailableUsersByRole("prajurit"));
      setMedis(await getAvailableUsersByRole("medis"));
      setLocations(await getAllLocations());
    }
    fetchUsersAndLocations();
  }, []);




  // 1. Simpan statistik ke localStorage setiap detik
  // useEffect(() => {
  //   let interval;
  //   if (isRecording && activeSession) {
  //     interval = setInterval(() => {
  //       // Data dummy untuk testKey
  //       const testData = {
  //         timestamp: new Date().toISOString(),
  //         random: Math.random(),
  //         note: "ini testKey dari interval"
  //       };
  //       localStorage.setItem('testKey', JSON.stringify(testData));
  //       console.log("testKey (JSON):", localStorage.getItem('testKey'));

  //       // Coba juga sessionStats dengan data dummy
  //       const prev = JSON.parse(localStorage.getItem('sessionStats') || '[]');
  //       prev.push(testData);
  //       localStorage.setItem('sessionStats', JSON.stringify(prev));
  //       console.log("sessionStats:", localStorage.getItem('sessionStats'));
  //     }, 1000);
  //   }
  //   return () => clearInterval(interval);
  // }, [isRecording, activeSession]);
  useEffect(() => {
    let interval;
    if (isRecording && activeSession && activeSession.participants && activeSession.participants.length > 0) {
      interval = setInterval(() => {
        // Generate data monitoringStats baru
        const newStats = {};
        activeSession.participants.forEach(p => {
          newStats[p.id] = {
            heartRate: Math.floor(Math.random() * 40) + 80,
            speed: Math.random() * 10 + 5,
            lat: -6.17 + Math.random() * 0.001,
            lng: 106.82 + Math.random() * 0.001
          };
        });
        setMonitoringStats(newStats); // tetap update state jika ingin pakai di UI

        // Simpan langsung ke localStorage
        const prev = JSON.parse(localStorage.getItem('sessionStats') || '[]');
        prev.push({
          timestamp: new Date().toISOString(),
          stats: { ...newStats }
        });
        localStorage.setItem('sessionStats', JSON.stringify(prev));
        // Debug
        console.log("sessionStats:", localStorage.getItem('sessionStats'));
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isRecording, activeSession]);
  // 2. Handler mulai dan selesai sesi
  const handleStartRecording = () => {
    localStorage.setItem('sessionStats', JSON.stringify([])); // Reset data lama
    setIsRecording(true);
  };

  const handleStopRecording = async () => {
    setIsRecording(false);
    const allStats = JSON.parse(localStorage.getItem('sessionStats') || '[]');
    for (const stat of allStats) {
      await fetch('/api/komandan/statistik', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sessionId: activeSession.id,
          timestamp: stat.timestamp,
          stats: stat.stats,
        }),
      });
    }
    localStorage.removeItem('sessionStats');
    await setSessionFinished(activeSession.id);
    setAllSessions(await getAllSessions());
    setTabValue("riwayat");
    setActiveSessionId(null);
  };











  const handleSetActiveSession = async (session) => {
    const res = await setSessionActive(session.id);
    if (res.success) {
      setActiveSessionId(session.id);
      setTabValue("sesi-aktif");
      setAllSessions(await getAllSessions()); // refresh data
    } else {
      // tampilkan error jika perlu
    }
  };


  const getStatusBadge = (status) => {
    switch (status) {
      case 'sehat': return <Badge variant="default" className="bg-green-500">Sehat</Badge>;
      case 'lelah': return <Badge variant="outline" className="border-yellow-500 text-yellow-600">Lelah</Badge>;
      case 'bahaya': return <Badge variant="destructive">Bahaya</Badge>;
      default: return <Badge variant="secondary">{status}</Badge>;
    }
  };

  const getProgressValue = (value, max) => Math.min(Math.round((value / max) * 100), 100);

  const showPrajuritDetail = (prajuritId) => {
    const detail = prajuritDetails[prajuritId];
    setSelectedPrajurit(detail);
    setShowDetailModal(true);
  };
  const [tabValue, setTabValue] = useState("sesi-aktif"); // default tab

  const handleKelolaLatihan = () => {
    router.push('/komandan/kelola_latihan');
  };

  const filteredPrajurit = prajurit.filter(p =>
    p.full_name.toLowerCase().includes(searchTerm.toLowerCase())
  );

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

  return (
    <div className="flex flex-col min-h-screen bg-gray-50 dark:bg-gray-900">
      <header className="sticky top-0 z-30 flex items-center justify-between h-16 px-6 bg-white border-b border-gray-200 dark:bg-gray-950 dark:border-gray-800">
        <h1 className="text-xl font-semibold">Dashboard Komandan</h1>
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
          <Avatar>
            <AvatarImage src="/avatars/komandan.jpg" />
            <AvatarFallback>K</AvatarFallback>
          </Avatar>
        </div>
      </header>
      <main className="flex-1 p-6">
        <Tabs defaultValue="sesi-aktif" className="w-full" value={tabValue} onValueChange={setTabValue} >
          <div className='flex justify-between items-center mb-4'>
            <TabsList>
              <TabsTrigger value="prajurit">Prajurit</TabsTrigger>
              <TabsTrigger value="sesi-latihan">Sesi Latihan</TabsTrigger>
              <TabsTrigger value="sesi-aktif">Sesi Aktif</TabsTrigger>
              <TabsTrigger value="riwayat">Riwayat Sesi</TabsTrigger>
            </TabsList>
            <Button onClick={handleKelolaLatihan} className="flex items-center gap-2">
              <Plus size={16} />
              Kelola Sesi Latihan
            </Button>
          </div>
          <TabsContent value="sesi-latihan">
            <Card>
              <CardHeader>
                <CardTitle>Daftar Sesi Latihan</CardTitle>
                <CardDescription>Pilih sesi untuk diaktifkan atau kelola.</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {allSessions.filter(s => s.status !== 'selesai').map((session) => (
                    <div key={session.id} className="flex flex-col md:flex-row md:items-center md:justify-between gap-2 p-4 border rounded-lg">
                      <div>
                        <p className="font-semibold">{session.name}</p>
                        <p className="text-sm text-gray-500">
                          {session.location?.name || "-"} - {new Date(session.scheduled_at).toLocaleString("id-ID")}
                        </p>
                        <p className="text-xs text-gray-400">
                          Jadwal: {new Date(session.scheduled_at).toLocaleString("id-ID")}
                          {session.actual_started_at && (
                            <span className="ml-2 text-blue-600">
                              | Mulai Aktual: {new Date(session.actual_started_at).toLocaleString("id-ID")}
                            </span>
                          )}
                          {session.actual_ended_at && (
                            <span className="ml-2 text-green-600">
                              | Selesai Aktual: {new Date(session.actual_ended_at).toLocaleString("id-ID")}
                            </span>
                          )}
                        </p>
                        <p className="text-xs text-gray-400">Status: {session.status}</p>
                      </div>
                      <div className="flex gap-2">
                        <Button
                          onClick={() => handleSetActiveSession(session)}
                          size="sm"
                          disabled={activeSessionId === session.id}
                          variant="default"
                        >
                          {activeSessionId === session.id ? 'Aktif' : 'Jadikan Aktif'}
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => {
                            // Redirect ke halaman edit, misal /komandan/kelola_latihan?id=ID
                            window.location.href = `/komandan/kelola_latihan?id=${session.id}`;
                          }}
                        >
                          Edit
                        </Button>
                        <Button
                          size="sm"
                          variant="destructive"
                          onClick={() => {
                            // Hapus dari state, atau panggil server action hapus jika sudah ada
                            setAllSessions(prev => prev.filter(s => s.id !== session.id));
                            // TODO: Panggil server action hapus jika sudah ada
                          }}
                        >
                          Hapus
                        </Button>
                      </div>
                    </div>
                  ))}
                  {allSessions.filter(s => s.status !== 'selesai').length === 0 && (
                    <div className="text-center text-gray-500 py-8">Tidak ada sesi latihan aktif.</div>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
          <TabsContent value="sesi-aktif">
            {allSessions.some(s => s.status === 'berlangsung') ? (
              allSessions
                .filter(s => s.status === 'berlangsung')
                .map((session) => (
                  <Card key={session.id}>
                    <CardHeader>
                      <div className='flex justify-between items-start'>
                        <div>
                          <CardTitle>{session.name}</CardTitle>
                          <CardDescription>
                            <div className="flex items-center gap-4 mt-2 text-sm text-gray-500">
                              <span className="flex items-center gap-1"><MapPin size={14} /> {session.location?.name || "-"}</span>
                              <span className="flex items-center gap-1"><Clock size={14} /> {new Date(session.scheduled_at).toLocaleString("id-ID")}</span>
                            </div>
                          </CardDescription>
                        </div>
                        <div className="flex gap-2">
                          {!isRecording && (
                            <Button onClick={handleStartRecording} variant="success">
                              <Play className="mr-2 h-4 w-4" /> Mulai Sesi Latihan
                            </Button>
                          )}
                          {isRecording && (
                            <Button
                              onClick={handleStopRecording}
                              variant="destructive"
                            >
                              <Square className="mr-2 h-4 w-4" /> Selesai Sesi Latihan
                            </Button>
                          )}
                          {/* Tombol Batalkan Sesi */}
                          <Button
                            onClick={async () => {
                              setIsRecording(false);
                              await setSessionCancelled(session.id);
                              setActiveSessionId(null);
                              setTabValue("sesi-latihan");
                              setAllSessions(await getAllSessions());
                            }}
                            variant="outline"
                          >
                            Batalkan Sesi
                          </Button>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div>
                        <h3 className="mb-4 text-lg font-semibold">Peserta Sesi</h3>
                        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
                          {(session.participants || []).map((prajurit) => {
                            const stats = monitoringStats[prajurit.id] || {};
                            return (
                              <Card key={prajurit.id} className="cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-800">
                                <CardHeader className="flex flex-row items-center justify-between pb-2">
                                  <CardTitle className="text-sm font-medium flex items-center gap-2">
                                    <Avatar className="h-8 w-8">
                                      <AvatarImage src={prajurit.avatar} />
                                      <AvatarFallback>{prajurit.full_name?.charAt(0)}</AvatarFallback>
                                    </Avatar>
                                    {prajurit.full_name}
                                    {prajurit.deviceConnected && (
                                      <Wifi className="text-green-500 ml-2" size={16} title="Device Terhubung" />
                                    )}
                                  </CardTitle>
                                </CardHeader>
                                <CardContent>
                                  <div className="grid grid-cols-2 gap-2 text-xs mb-2">
                                    <div className="flex items-center gap-1">
                                      <Heart size={14} className="text-red-500" />
                                      <span>Detak Jantung:</span>
                                      <span className="font-bold">{stats.heartRate ? stats.heartRate : "-"} bpm</span>
                                    </div>
                                    <div className="flex items-center gap-1">
                                      <Zap size={14} className="text-blue-500" />
                                      <span>Kecepatan:</span>
                                      <span className="font-bold">{stats.speed ? stats.speed.toFixed(1) : "-"} km/jam</span>
                                    </div>
                                    <div className="flex items-center gap-1">
                                      <Activity size={14} className="text-green-500" />
                                      <span>Status:</span>
                                      <span className="font-bold">{stats.status || "-"}</span>
                                    </div>
                                    <div className="flex items-center gap-1">
                                      <MapPin size={14} className="text-purple-500" />
                                      <span>Lokasi:</span>
                                      <span className="font-bold">{stats.lat && stats.lng ? `${stats.lat.toFixed(5)}, ${stats.lng.toFixed(5)}` : "-"}</span>
                                    </div>
                                  </div>
                                  {/* Optional: Mini Map */}
                                  <div className="mt-2">
                                    <MiniMapbox lat={stats.lat} lng={stats.lng} />
                                  </div>
                                </CardContent>
                              </Card>
                            );
                          })}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))
            ) : (
              <div className="flex flex-col items-center justify-center h-64 border-2 border-dashed rounded-lg">
                <p className="text-gray-500">Tidak ada sesi latihan yang aktif.</p>
                <p className="mt-2 text-sm text-gray-400">{'Pilih sesi dari tab "Sesi Latihan" untuk diaktifkan.'}</p>
              </div>
            )}
          </TabsContent>

          <TabsContent value="prajurit">
            <Card>
              <CardHeader>
                <CardTitle>Daftar Prajurit</CardTitle>
              </CardHeader>
              <CardContent>
                <Dialog open={showDetailModal} onOpenChange={setShowDetailModal}>
                  <DialogContent className="sm:max-w-[500px]">
                    <DialogHeader>
                      <DialogTitle>Detail Prajurit</DialogTitle>
                    </DialogHeader>
                    {loadingDetail ? (
                      <div className="p-8 text-center text-gray-500">Memuat data...</div>
                    ) : selectedPrajurit ? (
                      <div className="grid gap-4 p-4">
                        <div className="flex items-center gap-4">
                          <Avatar className="w-16 h-16">
                            <AvatarImage src={selectedPrajurit.avatar} alt={selectedPrajurit.full_name} />
                            <AvatarFallback>
                              {selectedPrajurit.full_name ? selectedPrajurit.full_name.charAt(0) : ""}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <h2 className="text-xl font-bold">{selectedPrajurit.full_name}</h2>
                            <p className="text-sm text-gray-500">{selectedPrajurit.email}</p>
                            <Badge className="mt-1">{selectedPrajurit.is_active ? "Aktif" : "Non-aktif"}</Badge>
                          </div>
                        </div>
                        <Separator />
                        <div className="grid gap-2 text-sm">
                          <div><span className="font-semibold">Unit:</span> {selectedPrajurit.unit_name}</div>
                          <div><span className="font-semibold">Pangkat:</span> {selectedPrajurit.rank_name}</div>
                          {/* Tambahkan field lain jika ada */}
                        </div>
                        <Separator />
                        <div className="grid gap-2 text-sm">
                          <div className="font-semibold">Riwayat Kesehatan:</div>
                          {selectedPrajurit.medicalHistory && selectedPrajurit.medicalHistory.length > 0 ? (
                            selectedPrajurit.medicalHistory.map((record, idx) => {
                              // Hitung IMT
                              let bmi = 'N/A';
                              if (record.weight_kg && record.height_cm) {
                                const heightM = record.height_cm / 100;
                                bmi = (record.weight_kg / (heightM * heightM)).toFixed(1);
                              }
                              return (
                                <div key={idx} className="p-3 border rounded-md text-xs bg-white dark:bg-zinc-900 shadow-sm mb-2">
                                  {/* Data Pemeriksaan */}
                                  <div className="mb-2">
                                    <p className="font-semibold text-blue-700 dark:text-blue-300">
                                      Pemeriksaan: {new Date(record.checkup_date).toLocaleDateString('id-ID')}
                                    </p>
                                    <div className="flex flex-wrap gap-x-6 gap-y-1 mt-1">
                                      <span><strong>Pemeriksa:</strong> {record.examiner_id ?? '-'}</span>
                                      <span><strong>Kondisi:</strong> {record.general_condition ?? '-'}</span>
                                    </div>
                                    <div className="mt-1">
                                      <span><strong>Catatan:</strong> {record.notes ?? '-'}</span>
                                    </div>
                                  </div>
                                  <Separator className="my-2" />

                                  {/* Data Vital */}
                                  <div className="mb-2">
                                    <p className="font-semibold text-green-700 dark:text-green-300 mb-1">Data Vital</p>
                                    <div className="grid grid-cols-2 md:grid-cols-3 gap-x-4 gap-y-1">
                                      <span><strong>BB:</strong> {record.weight_kg ?? '-'} kg</span>
                                      <span><strong>TB:</strong> {record.height_cm ?? '-'} cm</span>
                                      <span><strong>IMT:</strong> {bmi}</span>
                                      <span><strong>Tensi:</strong> {record.blood_pressure ?? '-'}</span>
                                      <span><strong>Nadi:</strong> {record.pulse ?? '-'} bpm</span>
                                      <span><strong>Suhu:</strong> {record.temperature ?? '-'} °C</span>
                                    </div>
                                  </div>
                                  <Separator className="my-2" />

                                  {/* Data Lab */}
                                  <div className="mb-2">
                                    <p className="font-semibold text-purple-700 dark:text-purple-300 mb-1">Data Lab</p>
                                    <div className="grid grid-cols-2 md:grid-cols-3 gap-x-4 gap-y-1">
                                      <span><strong>Gula Darah:</strong> {record.glucose ?? '-'} mg/dL</span>
                                      <span><strong>Kolesterol:</strong> {record.cholesterol ?? '-'} mg/dL</span>
                                      <span><strong>Hemoglobin:</strong> {record.hemoglobin ?? '-'} g/dL</span>
                                    </div>
                                  </div>
                                  <Separator className="my-2" />

                                  {/* Riwayat Penyakit Lain */}
                                  <div>
                                    <p className="font-semibold text-red-700 dark:text-red-300 mb-1">Riwayat Penyakit Lain</p>
                                    <span>{record.other_diseases ?? '-'}</span>
                                  </div>
                                </div>
                              );
                            })
                          ) : (
                            <div className="text-gray-500">Belum ada riwayat kesehatan.</div>
                          )}
                        </div>
                      </div>
                    ) : (
                      <div className="p-8 text-center text-gray-500">Tidak ada data prajurit.</div>
                    )}
                  </DialogContent>
                </Dialog>
                <div className="flex items-center gap-4 mb-4">
                  <Input
                    placeholder="Cari nama prajurit..."
                    value={searchTerm}
                    onChange={e => setSearchTerm(e.target.value)}
                  />
                </div>
                <div className="border rounded-lg">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="bg-gray-100 dark:bg-gray-800">
                        <th className="p-3 text-left">Nama</th>
                        <th className="p-3 text-left">Email</th>
                        <th className="p-3 text-left">Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredPrajurit.map((p) => (
                        <tr
                          key={p.id}
                          className="border-b dark:border-gray-800 cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-800/50"
                          onClick={() => handleShowPrajuritDetail(p)}
                        >
                          <td className="p-3 font-medium flex items-center gap-3">
                            <Avatar className="h-8 w-8">
                              <AvatarImage src={p.avatar} />
                              <AvatarFallback>
                                {p.full_name ? p.full_name.charAt(0) : ""}
                              </AvatarFallback>
                            </Avatar>
                            {p.full_name}
                          </td>
                          <td className="p-3">{p.email}</td>
                          <td className="p-3">
                            <Badge variant={p.is_active ? "default" : "secondary"} className={p.is_active ? "bg-green-500" : ""}>
                              {p.is_active ? "Aktif" : "Non-aktif"}
                            </Badge>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                  {filteredPrajurit.length === 0 && (
                    <div className="text-center text-gray-500 py-8">Tidak ada prajurit ditemukan.</div>
                  )}
                </div>

              </CardContent>
            </Card>
          </TabsContent>
          <TabsContent value="riwayat">
            <Card>
              <CardHeader>
                <CardTitle>Riwayat Sesi Latihan</CardTitle>
                <CardDescription>Daftar sesi latihan yang telah selesai.</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {allSessions.filter(s => s.status === 'selesai').map((session) => (
                    <div key={session.id} className="flex items-center justify-between p-4 border rounded-lg">
                      <div>
                        <p className="font-semibold">{session.name}</p>
                        <p className="text-sm text-gray-500">
                          {session.location?.name || "-"} - {new Date(session.scheduled_at).toLocaleString("id-ID")}
                        </p>
                        <p className="text-xs text-gray-400">Status: {session.status}</p>
                      </div>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => router.push(`/komandan/riwayat/${session.id}`)}
                      >
                        Lihat Detail
                      </Button>
                    </div>
                  ))}
                  {allSessions.filter(s => s.status === 'selesai').length === 0 && (
                    <p className="text-sm text-center text-gray-500">Belum ada riwayat sesi.</p>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </main>

      {/* Modal Konfirmasi Mulai Sesi */}
      <Dialog open={showStartConfirm} onOpenChange={setShowStartConfirm}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Mulai Sesi Latihan?</DialogTitle>
            <DialogDescription>
              {`Apakah Anda yakin ingin memulai sesi "${sessionToModify?.nama}"? Tindakan ini akan mulai merekam data dari perangkat prajurit.`}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowStartConfirm(false)}>Batal</Button>
            <Button onClick={startSession}>Ya, Mulai Sesi</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Modal Konfirmasi Hentikan Sesi */}
      <Dialog open={showStopConfirm} onOpenChange={setShowStopConfirm}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Hentikan Sesi Latihan?</DialogTitle>
            <DialogDescription>
              {`Apakah Anda yakin ingin menghentikan sesi "${sessionToModify?.nama}"? Sesi akan diarsipkan dan tidak bisa dilanjutkan kembali.`}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowStopConfirm(false)}>Batal</Button>
            <Button variant="destructive" onClick={endSession}>Ya, Hentikan Sesi</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

    </div>
  );
}
