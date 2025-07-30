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
  LogOut,
  Trash2
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
  DialogClose,
  DialogTrigger
} from "@/components/Shadcn/dialog";
import { ScrollArea } from "@/components/Shadcn/scroll-area";
import { Separator } from "@/components/Shadcn/separator";
import { Label } from "@/components/Shadcn/label";
import { getAllPrajurit, getPrajuritDetail, getAllUnits, getAllRanks } from "@/actions/komandan/prajurit_actions";
import {
  getAllSessions,
  getSessionById,
  getAvailableUsersByRole,
  getAllLocations,
  setSessionFinished,
  deleteSession
} from "@/actions/komandan/sessions_actions";
import CreateSessionForm from "@/components/komandan/CreateSessionForm";
import { Alert, AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/Shadcn/alert-dialog';
import { toast } from "sonner";

export default function KomandanDashboard() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const sesiId = Number(searchParams.get('id'));

  // State declarations
  const [komandan, setKomandan] = useState([]);
  const [prajurit, setPrajurit] = useState([]);
  const [medis, setMedis] = useState([]);
  const [locations, setLocations] = useState([]);
  const [activeSessionId, setActiveSessionId] = useState(null);
  const [monitoringData, setMonitoringData] = useState({});
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
  const [searchTerm, setSearchTerm] = useState("");
  const [unitFilter, setUnitFilter] = useState("semua");
  const [rankFilter, setRankFilter] = useState("semua");
  const [unitOptions, setUnitOptions] = useState(["semua"]);
  const [rankOptions, setRankOptions] = useState(["semua"]);
  const [tabValue, setTabValue] = useState("sesi-aktif"); // default tab

  // Helper functions (independent of state/handlers)
  const getStatusBadge = (status) => {
    switch (status) {
      case 'sehat': return <Badge variant="default" className="bg-green-500">Sehat</Badge>;
      case 'lelah': return <Badge variant="outline" className="border-yellow-500 text-yellow-600">Lelah</Badge>;
      case 'bahaya': return <Badge variant="destructive">Bahaya</Badge>;
      default: return <Badge variant="secondary">{status}</Badge>;
    }
  };

  const getProgressValue = (value, max) => Math.min(Math.round((value / max) * 100), 100);

  // Handler functions
  const handleSetActiveSession = async (session) => {
    const res = await setSessionActive(session.id);
    if (res.success) {
      setActiveSessionId(session.id);
      setTabValue("sesi-aktif");
      setAllSessions(await getAllSessions()); // refresh data
      console.log("handleSetActiveSession: Session set to active. activeSessionId:", session.id);
    } else {
      toast.error("Gagal mengaktifkan sesi: " + res.message);
    }
  };

  const handleStopRecording = async (sessionToStop) => {
    if (!sessionToStop || !sessionToStop.id) {
      toast.error("Sesi tidak valid. Tidak dapat menghentikan sesi.");
      console.error("Attempted to stop session with invalid session object:", sessionToStop);
      return;
    }
    const sessionId = sessionToStop.id;
    setIsRecording(false);
    const allStats = JSON.parse(localStorage.getItem('sessionStats') || '[]');
    for (const stat of allStats) {
      await fetch('/api/komandan/statistik', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sessionId: sessionId,
          timestamp: stat.timestamp,
          stats: stat.stats,
        }),
      });
    }
    localStorage.removeItem('sessionStats');
    await setSessionFinished(sessionId);
    setAllSessions(await getAllSessions());
    setTabValue("riwayat");
    setActiveSessionId(null);
  };

  const handleStartRecording = () => {
    if (!activeSession) {
      toast.error("Tidak ada sesi aktif untuk memulai perekaman.");
      return;
    }
    localStorage.setItem('sessionStats', JSON.stringify([])); // Reset data lama
    setIsRecording(true);
    toast.success("Perekaman sesi dimulai.");
    console.log("handleStartRecording: Recording started.");
  };

  const handleShowPrajuritDetail = async (p) => {
    setLoadingDetail(true);
    setShowDetailModal(true);
    const detail = await getPrajuritDetail(p.id);
    setSelectedPrajurit(detail);
    setLoadingDetail(false);
  };

  const handleKelolaLatihan = () => {
    router.push('/komandan/kelola_latihan');
  };

  const handleLogout = async () => {
    try {
      await logoutAction();
      router.push('/');
    } catch (error) {
      console.error('Error during logout:', error);
      router.push('/');
    }
  };

  // Effects
  useEffect(() => {
    async function fetchSessions() {
      const data = await getAllSessions();
      setAllSessions(data);
      console.log("useEffect: All sessions fetched:", data);
    }
    fetchSessions();
  }, []);

  useEffect(() => {
    async function fetchData() {
      const data = await getSessionById(sesiId);
      setInitialData(data);
      console.log("useEffect: Initial session data fetched for sesiId:", sesiId, data);
    }
    fetchData();
  }, [sesiId]);

  useEffect(() => {
    async function fetchUsersAndLocations() {
      setKomandan(await getAvailableUsersByRole("komandan"));
      setPrajurit(await getAvailableUsersByRole("prajurit"));
      setMedis(await getAvailableUsersByRole("medis"));
      setLocations(await getAllLocations());
      console.log("useEffect: Users and locations fetched.");
    }
    fetchUsersAndLocations();
  }, []);

  useEffect(() => {
    let intervalId;

    console.log("Monitoring useEffect triggered. activeSession:", activeSession, "participants length:", activeSession?.participants?.length);
    if (activeSession && activeSession?.participants?.length > 0) {
      setMonitoringStats(() => { // Use functional update for fresh state
        const initialStats = {};
        const initialPositions = {};
        activeSession.participants.forEach(p => {
          const lat = -6.1754 + (Math.random() - 0.5) * 0.001;
          const lng = 106.8272 + (Math.random() - 0.5) * 0.001;
          const heartRate = 90 + Math.round(Math.random() * 30);
          const speed = 7 + Math.random() * 11;
          let status = "sehat";
          if (heartRate > 110) status = "lelah";
          if (heartRate > 120) status = "bahaya";

          initialStats[p.id] = { heartRate, speed, lat, lng, status };
          initialPositions[p.id] = { lat, lng };
        });
        setLastPositions(initialPositions);
        console.log("Monitoring useEffect: Initial monitoringStats set:", initialStats);
        return initialStats;
      });

      intervalId = setInterval(() => {
        setMonitoringStats(currentStats => {
          const updatedStats = {};
          setLastPositions(lastPrev => {
            const updatedPositions = { ...lastPrev };
            activeSession.participants.forEach(p => {
              let prevLat = lastPrev[p.id]?.lat ?? -6.1754;
              let prevLng = lastPrev[p.id]?.lng ?? 106.8272;

              const speed = 7 + Math.random() * 11; // 7-18 km/jam
              const speedMs = speed / 3.6; // konversi ke m/s

              const meterToDegLat = 1 / 111320;
              const meterToDegLng = 1 / (111320 * Math.cos(prevLat * Math.PI / 180));

              const step = speedMs; // meter per detik
              const angle = Math.random() * 2 * Math.PI;
              let lat = prevLat + Math.sin(angle) * step * meterToDegLat;
              let lng = prevLng + Math.cos(angle) * step * meterToDegLng;

              const dist = Math.sqrt(Math.pow((lat + 6.1754) * 111320, 2) + Math.pow((lng - 106.8272) * 111320, 2));
              if (dist > 200) {
                lat = -6.1754 + (Math.random() - 0.5) * 0.001;
                lng = 106.8272 + (Math.random() - 0.5) * 0.001;
              }

              updatedPositions[p.id] = { lat, lng };

              const heartRate = 90 + Math.round(Math.random() * 30);
              let status = "sehat";
              if (heartRate > 110) status = "lelah";
              if (heartRate > 120) status = "bahaya";
              updatedStats[p.id] = { heartRate, speed, lat, lng, status };
            });
            return updatedPositions;
          });
          return updatedStats;
        });
      }, 1000);
    } else {
      console.log("Monitoring useEffect: No active session or no participants. Clearing stats.");
      setMonitoringStats({});
      setLastPositions({});
    }

    return () => {
      if (intervalId) {
        clearInterval(intervalId);
        console.log("Monitoring useEffect: Cleared interval.");
      }
    };
  }, [activeSession]);

  useEffect(() => {
    console.log("Saving to localStorage useEffect triggered. isRecording:", isRecording, "activeSession status:", activeSession?.status, "monitoringStats keys length:", Object.keys(monitoringStats).length);
    if (isRecording && activeSession?.status === "berlangsung" && Object.keys(monitoringStats).length > 0) {
      const prev = JSON.parse(localStorage.getItem('sessionStats') || '[]');
      prev.push({
        timestamp: new Date().toISOString(),
        stats: { ...monitoringStats }
      });
      localStorage.setItem('sessionStats', JSON.stringify(prev));
      console.log("Saving to localStorage:", monitoringStats);
    }
  }, [isRecording, monitoringStats, activeSession]);

  // Derived state
  const filteredPrajurit = prajurit.filter(p => {
    const matchSearch = p.full_name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchUnit = unitFilter === "semua" || p.unit_name === unitFilter;
    const matchRank = rankFilter === "semua" || p.rank_name === rankFilter;
    return matchSearch && matchUnit && matchRank;
  });

  console.log("KomandanDashboard Render: activeSessionId:", activeSessionId, "activeSession:", activeSession);
  if (activeSession) {
    console.log("KomandanDashboard Render: activeSession.participants:", activeSession.participants);
  }
  console.log("KomandanDashboard Render: monitoringStats at render:", monitoringStats);

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
                            window.location.href = `/komandan/kelola_latihan?id=${session.id}`;
                          }}
                        >
                          Edit
                        </Button>
                        <Button
                          size="sm"
                          variant="destructive"
                          asChild
                        >
                          <DeleteConfirmationDialog
                            itemToDelete="sesi latihan ini"
                            onConfirm={async () => {
                              const result = await deleteSession(session.id);
                              if (result.success) {
                                toast.success(result.message);
                                setAllSessions(await getAllSessions());
                              } else {
                                toast.error(result.message);
                              }
                            }}
                          />
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
            {activeSession ? (
              <Card key={activeSession.id}>
                <CardHeader>
                  <div className='flex justify-between items-start'>
                    <div>
                      <CardTitle>{activeSession.name}</CardTitle>
                      <CardDescription>
                        <div className="flex items-center gap-4 mt-2 text-sm text-gray-500">
                          <span className="flex items-center gap-1"><MapPin size={14} /> {activeSession.location?.name || "-"}</span>
                          <span className="flex items-center gap-1"><Clock size={14} /> {new Date(activeSession.scheduled_at).toLocaleString("id-ID")}
                          </span>
                        </div>
                      </CardDescription>
                    </div>
                    <div className="flex gap-2">
                      {!isRecording && (
                        <Dialog>
                          <DialogTrigger asChild>
                            <Button onClick={handleStartRecording} variant="success">
                              <Play className="mr-2 h-4 w-4" /> Mulai Sesi Latihan
                            </Button>
                          </DialogTrigger>
                          <DialogContent>
                            <DialogHeader>
                              <DialogTitle>Mulai Sesi Latihan?</DialogTitle>
                              <DialogDescription>
                                {`Apakah Anda yakin ingin memulai sesi "${activeSession.name}"? Tindakan ini akan mulai merekam data dari perangkat prajurit.`}
                              </DialogDescription>
                            </DialogHeader>
                            <DialogFooter>
                              <DialogClose asChild>
                                <Button variant="outline">Batal</Button>
                              </DialogClose>
                              <Button onClick={() => handleSetActiveSession(activeSession)}>Ya, Mulai Sesi</Button>
                            </DialogFooter>
                          </DialogContent>
                        </Dialog>
                      )}
                      {isRecording && (
                        <Dialog>
                          <DialogTrigger asChild>
                            <Button variant="destructive">
                              <Square className="mr-2 h-4 w-4" /> Selesai Sesi Latihan
                            </Button>
                          </DialogTrigger>
                          <DialogContent>
                            <DialogHeader>
                              <DialogTitle>Hentikan Sesi Latihan?</DialogTitle>
                              <DialogDescription>
                                {`Apakah Anda yakin ingin menghentikan sesi "${activeSession.name}"? Sesi akan diarsipkan dan tidak bisa dilanjutkan kembali.`}
                              </DialogDescription>
                            </DialogHeader>
                            <DialogFooter>
                              <DialogClose asChild>
                                <Button variant="outline">Batal</Button>
                              </DialogClose>
                              <Button variant="destructive" onClick={() => handleStopRecording(activeSession)}>Ya, Hentikan Sesi</Button>
                            </DialogFooter>
                          </DialogContent>
                        </Dialog>
                      )}
                      <Button
                        onClick={async () => {
                          setIsRecording(false);
                          await setSessionCancelled(activeSession.id);
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
                      {(activeSession.participants || []).map((prajurit) => {
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
                              <div className="mt-2">
                                {console.log(`MiniMapbox for ${prajurit.full_name} (${prajurit.id}) props: lat=${stats.lat}, lng=${stats.lng}`)}
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
                          {/* <div><span className="font-semibold">Unit:</span> {selectedPrajurit.unit_name}</div>
                          <div><span className="font-semibold">Pangkat:</span> {selectedPrajurit.rank_name}</div> */}
                          {/* Tambahkan field lain jika ada */}
                        </div>
                      </div>
                    ) : (
                      <div className="p-8 text-center text-gray-500">Tidak ada data prajurit.</div>
                    )}
                  </DialogContent>
                </Dialog>
                <div className="flex flex-wrap items-center gap-4 mb-4">
                  <Input
                    placeholder="Cari nama prajurit..."
                    value={searchTerm}
                    onChange={e => setSearchTerm(e.target.value)}
                    className="w-56"
                  />
                  <Select value={unitFilter} onValueChange={setUnitFilter}>
                    <SelectTrigger className="w-40">
                      <SelectValue>{unitFilter === "semua" ? "Semua Unit" : unitFilter}</SelectValue>
                    </SelectTrigger>
                    <SelectContent>
                      {unitOptions.map((unit) => (
                        <SelectItem key={unit} value={unit}>{unit === "semua" ? "Semua Unit" : unit}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <Select value={rankFilter} onValueChange={setRankFilter}>
                    <SelectTrigger className="w-40">
                      <SelectValue>{rankFilter === "semua" ? "Semua Pangkat" : rankFilter}</SelectValue>
                    </SelectTrigger>
                    <SelectContent>
                      {rankOptions.map((rank) => (
                        <SelectItem key={rank} value={rank}>{rank === "semua" ? "Semua Pangkat" : rank}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {(unitFilter !== "semua" || rankFilter !== "semua") && (
                    <Button variant="outline" size="sm" onClick={() => { setUnitFilter("semua"); setRankFilter("semua"); }}>
                      Reset Filter
                    </Button>
                  )}
                </div>
                <div className="border rounded-lg overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="bg-gray-100 dark:bg-gray-800">
                        <th className="p-3 text-left">Nama</th>
                        <th className="p-3 text-left">Email</th>
                        <th className="p-3 text-left">Unit</th>
                        <th className="p-3 text-left">Pangkat</th>
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
                          <td className="p-3">{p.unit_name || '-'}</td>
                          <td className="p-3">{p.rank_name || '-'}</td>
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

    </div>
  );
}

function DeleteConfirmationDialog({ itemToDelete, onConfirm }) {
  return (
    <AlertDialog>
      <AlertDialogTrigger asChild>
        <Button variant="destructive" size="icon"><Trash2 className="h-4 w-4" /></Button>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Apakah Anda yakin?</AlertDialogTitle>
          <AlertDialogDescription>
            Tindakan ini tidak dapat diurungkan. Ini akan menghapus {itemToDelete} secara permanen dari server.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Batal</AlertDialogCancel>
          <AlertDialogAction onClick={onConfirm}>Hapus</AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
