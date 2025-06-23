'use client'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/Shadcn/card';
import { Button } from '@/components/Shadcn/button';
import { Input } from '@/components/Shadcn/input';
import { Label } from '@/components/Shadcn/label';
import { Textarea } from '@/components/Shadcn/textarea';
import { Checkbox } from '@/components/Shadcn/checkbox';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/Shadcn/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/Shadcn/tabs';
import { Badge } from '@/components/Shadcn/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/Shadcn/avatar';
import { Progress } from '@/components/Shadcn/progress';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/Shadcn/select';
import { Calendar } from '@/components/Shadcn/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/Shadcn/popover';
import { 
  Activity, 
  MapPin, 
  Clock,
  Heart,
  Zap,
  Route,
  Grid3X3,
  List,
  User,
  Edit,
  Plus,
  Trash2,
  UserPlus,
  Search,
  Calendar as CalendarIcon,
  Users,
  X
} from 'lucide-react';
import { useState } from 'react';
import { format } from 'date-fns';

/**
 * Dashboard Komandan - Lengkap dengan semua fitur
 * - Monitor sesi latihan dan prajurit
 * - Profile komandan (lihat/edit)
 * - CRUD latihan (buat, edit, hapus)
 * - Filter dan undang prajurit berdasarkan unit
 */
export default function KomandanDashboard() {
  // Data dummy untuk development
  const [allPrajurit] = useState([
    {
      id: 1,
      name: "Budi Santoso",
      unit: "Kompi A",
      rank: "Sersan Dua",
      heartRate: 85,
      speed: 12.5,
      distance: 2.3,
      status: "sehat",
      avatar: "/avatars/budi.jpg",
      inSession: true
    },
    {
      id: 2,
      name: "Siti Aminah",
      unit: "Tim Medis",
      rank: "Dokter",
      heartRate: 120,
      speed: 8.2,
      distance: 1.8,
      status: "kritis",
      avatar: "/avatars/siti.jpg",
      inSession: true
    },
    {
      id: 3,
      name: "Ahmad Yusuf",
      unit: "Kompi B",
      rank: "Kopral",
      heartRate: 95,
      speed: 15.1,
      distance: 3.1,
      status: "lelah",
      avatar: "/avatars/ahmad.jpg",
      inSession: true
    },
    {
      id: 4,
      name: "Dewi Lestari",
      unit: "Kompi C",
      rank: "Letnan",
      heartRate: 70,
      speed: 7.5,
      distance: 0.5,
      status: "prima",
      avatar: "/avatars/dewi.jpg",
      inSession: false
    },
    {
      id: 5,
      name: "Eko Prasetyo",
      unit: "Tim Medis",
      rank: "Dokter",
      heartRate: 75,
      speed: 10.0,
      distance: 1.2,
      status: "sehat",
      avatar: "/avatars/eko.jpg",
      inSession: false
    },
    {
      id: 6,
      name: "Fitri Handayani",
      unit: "Tim Logistik",
      rank: "Sersan Satu",
      heartRate: 80,
      speed: 9.5,
      distance: 1.0,
      status: "prima",
      avatar: "/avatars/fitri.jpg",
      inSession: false
    }
  ]);

  // Data dummy profile komandan
  const [profileData, setProfileData] = useState({
    id: 1,
    name: "Mayor Rizki Pratama",
    rank: "Mayor",
    unit: "Komando Distrik Militer 0503",
    email: "mayor.rizki@tni.mil.id",
    phone: "081234567890",
    avatar: "/avatars/komandan.jpg"
  });

  // Data dummy latihan
  const [latihanList, setLatihanList] = useState([
    {
      id: 1,
      name: "Latihan Tembak Siang",
      location: "Lapangan A",
      date: new Date(2024, 11, 25),
      time: "14:00",
      status: "berlangsung",
      description: "Latihan menembak untuk meningkatkan akurasi",
      participants: 3
    },
    {
      id: 2,
      name: "Latihan Fisik Pagi",
      location: "Lapangan B",
      date: new Date(2024, 11, 26),
      time: "06:00",
      status: "terjadwal",
      description: "Latihan kondisi fisik rutin",
      participants: 0
    }
  ]);

  // State untuk Shadcn
  const [viewMode, setViewMode] = useState('grid');
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isLatihanOpen, setIsLatihanOpen] = useState(false);
  const [isUndangOpen, setIsUndangOpen] = useState(false);
  
  // State untuk form latihan
  const [editingLatihan, setEditingLatihan] = useState(null);
  const [latihanFormData, setLatihanFormData] = useState({
    name: '',
    location: '',
    date: new Date(),
    time: '',
    description: '',
    status: 'terjadwal'
  });

  // State untuk undang prajurit
  const [selectedUnit, setSelectedUnit] = useState('semua');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedPrajurit, setSelectedPrajurit] = useState([]);
  const [pendingInvitations, setPendingInvitations] = useState([]);

  // Sesi aktif saat ini
  const sesiAktif = latihanList.find(l => l.status === 'berlangsung') || {
    id: 1,
    name: "Belum ada sesi aktif",
    status: "tidak_ada",
    startTime: "-",
    participants: 0,
    location: "-"
  };  // Filter prajurit ikut sesi & urutkan kritis dulu
  const prajuritSesi = allPrajurit
    .filter(p => p.inSession)
    .sort((a, b) => (b.status === 'kritis' ? 1 : 0) - (a.status === 'kritis' ? 1 : 0));
  
  // Prajurit di luar sesi
  const prajuritLain = allPrajurit.filter(p => !p.inSession);

  // Helper function untuk progress value dari Shadcn
  const getProgressValue = (value, max) => Math.min(Math.round((value / max) * 100), 100);

  // Dapatkan daftar unit unik untuk filter
  const availableUnits = ['semua', ...new Set(allPrajurit.map(p => p.unit))];

  // Filter prajurit untuk undangan
  const filteredPrajurit = allPrajurit.filter(prajurit => {
    const matchUnit = selectedUnit === 'semua' || prajurit.unit === selectedUnit;
    const matchSearch = prajurit.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                       prajurit.rank.toLowerCase().includes(searchTerm.toLowerCase());
    const notInSession = !prajurit.inSession;
    const notPending = !pendingInvitations.includes(prajurit.id);
    
    return matchUnit && matchSearch && notInSession && notPending;
  });

  // Handle profile update
  const handleProfileUpdate = (e) => {
    e.preventDefault();
    console.log('Profile updated:', profileData);
    setIsProfileOpen(false);
  };

  // Handle tambah/edit latihan
  const handleLatihanSubmit = (e) => {
    e.preventDefault();
    if (editingLatihan) {
      setLatihanList(prev => prev.map(item => 
        item.id === editingLatihan.id 
          ? { ...item, ...latihanFormData, participants: item.participants }
          : item
      ));
    } else {
      const newLatihan = {
        id: Date.now(),
        ...latihanFormData,
        participants: 0
      };
      setLatihanList(prev => [...prev, newLatihan]);
    }
    
    setLatihanFormData({
      name: '',
      location: '',
      date: new Date(),
      time: '',
      description: '',
      status: 'terjadwal'
    });
    setEditingLatihan(null);
    setIsLatihanOpen(false);
  };

  // Handle edit latihan
  const handleEditLatihan = (latihan) => {
    setEditingLatihan(latihan);
    setLatihanFormData({
      name: latihan.name,
      location: latihan.location,
      date: latihan.date,
      time: latihan.time,
      description: latihan.description,
      status: latihan.status
    });
    setIsLatihanOpen(true);
  };

  // Handle hapus latihan
  const handleDeleteLatihan = (id) => {
    setLatihanList(prev => prev.filter(item => item.id !== id));
  };

  // Handle checkbox selection prajurit
  const handleSelectPrajurit = (prajuritId, checked) => {
    if (checked) {
      setSelectedPrajurit(prev => [...prev, prajuritId]);
    } else {
      setSelectedPrajurit(prev => prev.filter(id => id !== prajuritId));
    }
  };

  // Handle select all untuk unit yang sedang ditampilkan
  const handleSelectAllVisible = (checked) => {
    if (checked) {
      const visibleIds = filteredPrajurit.map(p => p.id);
      setSelectedPrajurit(prev => [...new Set([...prev, ...visibleIds])]);
    } else {
      const visibleIds = filteredPrajurit.map(p => p.id);
      setSelectedPrajurit(prev => prev.filter(id => !visibleIds.includes(id)));
    }
  };

  // Handle kirim undangan
  const handleSendInvitations = () => {
    if (selectedPrajurit.length === 0) return;
    
    setPendingInvitations(prev => [...prev, ...selectedPrajurit]);
    setSelectedPrajurit([]);
    setIsUndangOpen(false);
    
    console.log(`Undangan terkirim ke ${selectedPrajurit.length} prajurit`);
  };

  // Handle batal undangan pending
  const handleCancelInvitation = (prajuritId) => {
    setPendingInvitations(prev => prev.filter(id => id !== prajuritId));
  };

  // Hitung prajurit yang sudah dipilih untuk select all
  const allVisibleSelected = filteredPrajurit.length > 0 && 
    filteredPrajurit.every(p => selectedPrajurit.includes(p.id));

  // Helper functions
  const getStatusBadge = (status) => {
    switch(status) {
      case 'sehat':
        return <Badge variant="default" className="bg-green-500">Sehat</Badge>;
      case 'prima':
        return <Badge variant="default" className="bg-blue-500">Prima</Badge>;
      case 'lelah':
        return <Badge variant="outline" className="border-yellow-500 text-yellow-600">Lelah</Badge>;
      case 'sakit':
        return <Badge variant="destructive">Sakit</Badge>;
      default:
        return <Badge variant="secondary">{status}</Badge>;
    }
  };
  const getSesiStatusBadge = (status) => {
    switch(status) {
      case 'berlangsung':
        return <Badge variant="default" className="bg-green-500">Berlangsung</Badge>;
      case 'terjadwal':
        return <Badge variant="outline">Terjadwal</Badge>;
      case 'selesai':
        return <Badge variant="secondary">Selesai</Badge>;
      default:
        return <Badge variant="secondary">{status}</Badge>;
    }
  };
  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header dengan tombol Profile dan Kelola Latihan */}
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-3xl font-bold">Dashboard Komandan</h1>
          <div className="flex gap-2">
            {/* Dialog Profile Komandan */}
            <Dialog open={isProfileOpen} onOpenChange={setIsProfileOpen}>
              <DialogTrigger asChild>
                <Button variant="outline" size="sm">
                  <User className="h-4 w-4 mr-2" />
                  Profile
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-md">
                <DialogHeader>
                  <DialogTitle>Profile Komandan</DialogTitle>
                  <DialogDescription>
                    Lihat dan edit informasi profile Anda
                  </DialogDescription>
                </DialogHeader>
                
                <form onSubmit={handleProfileUpdate} className="space-y-4">
                  <div className="flex items-center gap-4">
                    <Avatar className="h-16 w-16">
                      <AvatarImage src={profileData.avatar} alt={profileData.name} />
                      <AvatarFallback>{profileData.name.split(' ').map(n => n[0]).join('')}</AvatarFallback>
                    </Avatar>
                    <Button type="button" variant="outline" size="sm">
                      <Edit className="h-4 w-4 mr-2" />
                      Ganti Foto
                    </Button>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="name">Nama Lengkap</Label>
                      <Input 
                        id="name"
                        value={profileData.name}
                        onChange={(e) => setProfileData(prev => ({...prev, name: e.target.value}))}
                      />
                    </div>
                    <div>
                      <Label htmlFor="rank">Pangkat</Label>
                      <Input 
                        id="rank"
                        value={profileData.rank}
                        onChange={(e) => setProfileData(prev => ({...prev, rank: e.target.value}))}
                      />
                    </div>
                  </div>
                  
                  <div>
                    <Label htmlFor="unit">Unit/Kesatuan</Label>
                    <Input 
                      id="unit"
                      value={profileData.unit}
                      onChange={(e) => setProfileData(prev => ({...prev, unit: e.target.value}))}
                    />
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="email">Email</Label>
                      <Input 
                        id="email"
                        type="email"
                        value={profileData.email}
                        onChange={(e) => setProfileData(prev => ({...prev, email: e.target.value}))}
                      />
                    </div>
                    <div>
                      <Label htmlFor="phone">No. Telepon</Label>
                      <Input 
                        id="phone"
                        value={profileData.phone}
                        onChange={(e) => setProfileData(prev => ({...prev, phone: e.target.value}))}
                      />
                    </div>
                  </div>
                  
                  <DialogFooter>
                    <Button type="button" variant="outline" onClick={() => setIsProfileOpen(false)}>
                      Batal
                    </Button>
                    <Button type="submit">Simpan</Button>
                  </DialogFooter>
                </form>
              </DialogContent>
            </Dialog>

            {/* Dialog CRUD Latihan */}
            <Dialog open={isLatihanOpen} onOpenChange={setIsLatihanOpen}>
              <DialogTrigger asChild>
                <Button variant="default" size="sm">
                  <Plus className="h-4 w-4 mr-2" />
                  Kelola Latihan
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle>Kelola Sesi Latihan</DialogTitle>
                  <DialogDescription>
                    Buat, edit, atau hapus sesi latihan
                  </DialogDescription>
                </DialogHeader>
                
                <Tabs defaultValue="list" className="w-full">
                  <TabsList className="grid w-full grid-cols-2">
                    <TabsTrigger value="list">Daftar Latihan</TabsTrigger>
                    <TabsTrigger value="form">
                      {editingLatihan ? 'Edit Latihan' : 'Buat Latihan'}
                    </TabsTrigger>
                  </TabsList>
                  
                  {/* Tab Daftar Latihan */}
                  <TabsContent value="list" className="space-y-4">
                    <div className="grid gap-4">
                      {latihanList.map((latihan) => (
                        <Card key={latihan.id}>
                          <CardContent className="pt-4">
                            <div className="flex items-center justify-between">
                              <div className="space-y-1">
                                <h4 className="font-semibold">{latihan.name}</h4>
                                <div className="flex items-center gap-4 text-sm text-gray-600">
                                  <span className="flex items-center gap-1">
                                    <CalendarIcon className="h-3 w-3" />
                                    {format(latihan.date, 'dd/MM/yyyy')}
                                  </span>
                                  <span className="flex items-center gap-1">
                                    <Clock className="h-3 w-3" />
                                    {latihan.time}
                                  </span>
                                  <span className="flex items-center gap-1">
                                    <MapPin className="h-3 w-3" />
                                    {latihan.location}
                                  </span>
                                  <span className="flex items-center gap-1">
                                    <Users className="h-3 w-3" />
                                    {latihan.participants} peserta
                                  </span>
                                </div>
                                <div className="flex items-center gap-2">
                                  {getSesiStatusBadge(latihan.status)}
                                </div>
                              </div>
                              <div className="flex gap-2">
                                <Button 
                                  variant="outline" 
                                  size="sm"
                                  onClick={() => handleEditLatihan(latihan)}
                                >
                                  <Edit className="h-4 w-4" />
                                </Button>
                                <Button 
                                  variant="outline" 
                                  size="sm"
                                  onClick={() => handleDeleteLatihan(latihan.id)}
                                >
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                    
                    <Button 
                      onClick={() => {
                        setEditingLatihan(null);
                        setLatihanFormData({
                          name: '',
                          location: '',
                          date: new Date(),
                          time: '',
                          description: '',
                          status: 'terjadwal'
                        });
                      }}
                      className="w-full"
                    >
                      <Plus className="h-4 w-4 mr-2" />
                      Tambah Latihan Baru
                    </Button>
                  </TabsContent>
                  
                  {/* Tab Form Latihan */}
                  <TabsContent value="form">
                    <form onSubmit={handleLatihanSubmit} className="space-y-4">
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <Label htmlFor="latihan-name">Nama Latihan</Label>
                          <Input 
                            id="latihan-name"
                            value={latihanFormData.name}
                            onChange={(e) => setLatihanFormData(prev => ({...prev, name: e.target.value}))}
                            placeholder="Contoh: Latihan Tembak Siang"
                            required
                          />
                        </div>
                        <div>
                          <Label htmlFor="location">Lokasi</Label>
                          <Input 
                            id="location"
                            value={latihanFormData.location}
                            onChange={(e) => setLatihanFormData(prev => ({...prev, location: e.target.value}))}
                            placeholder="Contoh: Lapangan A"
                            required
                          />
                        </div>
                      </div>
                      
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <Label>Tanggal</Label>
                          <Popover>
                            <PopoverTrigger asChild>
                              <Button variant="outline" className="w-full justify-start">
                                <CalendarIcon className="mr-2 h-4 w-4" />
                                {format(latihanFormData.date, 'dd/MM/yyyy')}
                              </Button>
                            </PopoverTrigger>
                            <PopoverContent className="w-auto p-0">
                              <Calendar
                                mode="single"
                                selected={latihanFormData.date}
                                onSelect={(date) => setLatihanFormData(prev => ({...prev, date}))}
                                initialFocus
                              />
                            </PopoverContent>
                          </Popover>
                        </div>
                        <div>
                          <Label htmlFor="time">Waktu</Label>
                          <Input 
                            id="time"
                            type="time"
                            value={latihanFormData.time}
                            onChange={(e) => setLatihanFormData(prev => ({...prev, time: e.target.value}))}
                            required
                          />
                        </div>
                      </div>
                      
                      <div>
                        <Label htmlFor="status">Status</Label>
                        <Select 
                          value={latihanFormData.status} 
                          onValueChange={(value) => setLatihanFormData(prev => ({...prev, status: value}))}
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="terjadwal">Terjadwal</SelectItem>
                            <SelectItem value="berlangsung">Berlangsung</SelectItem>
                            <SelectItem value="selesai">Selesai</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      
                      <div>
                        <Label htmlFor="description">Deskripsi</Label>
                        <Textarea 
                          id="description"
                          value={latihanFormData.description}
                          onChange={(e) => setLatihanFormData(prev => ({...prev, description: e.target.value}))}
                          placeholder="Deskripsi detail latihan..."
                          rows={3}
                        />
                      </div>
                      
                      <div className="flex gap-2">
                        <Button 
                          type="button" 
                          variant="outline" 
                          onClick={() => {
                            setIsLatihanOpen(false);
                            setEditingLatihan(null);
                          }}
                        >
                          Batal
                        </Button>
                        <Button type="submit">
                          {editingLatihan ? 'Update Latihan' : 'Buat Latihan'}
                        </Button>
                      </div>
                    </form>
                  </TabsContent>
                </Tabs>
              </DialogContent>
            </Dialog>

            {/* Dialog Undang Prajurit */}
            <Dialog open={isUndangOpen} onOpenChange={setIsUndangOpen}>
              <DialogTrigger asChild>
                <Button variant="default" size="sm">
                  <UserPlus className="h-4 w-4 mr-2" />
                  Undang Prajurit
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle>Undang Prajurit ke Sesi Latihan</DialogTitle>
                  <DialogDescription>
                    Pilih prajurit yang akan diundang berdasarkan unit dan kriteria
                  </DialogDescription>
                </DialogHeader>
                
                {/* Filter Controls */}
                <div className="space-y-4">
                  <div className="flex gap-4">
                    <div className="flex-1">
                      <Label htmlFor="search">Cari Prajurit</Label>
                      <div className="relative">
                        <Search className="absolute left-2 top-2.5 h-4 w-4 text-gray-500" />
                        <Input 
                          id="search"
                          placeholder="Nama atau pangkat..."
                          value={searchTerm}
                          onChange={(e) => setSearchTerm(e.target.value)}
                          className="pl-8"
                        />
                      </div>
                    </div>
                    <div className="w-48">
                      <Label htmlFor="unit-filter">Filter Unit</Label>
                      <Select value={selectedUnit} onValueChange={setSelectedUnit}>
                        <SelectTrigger id="unit-filter">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {availableUnits.map(unit => (
                            <SelectItem key={unit} value={unit}>
                              {unit === 'semua' ? 'Semua Unit' : unit}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  
                  {/* Info dan Select All */}
                  <div className="flex items-center justify-between py-2 border-b">
                    <span className="text-sm text-gray-600">
                      Menampilkan {filteredPrajurit.length} prajurit
                      {selectedPrajurit.length > 0 && ` • ${selectedPrajurit.length} dipilih`}
                    </span>
                    {filteredPrajurit.length > 0 && (
                      <div className="flex items-center space-x-2">
                        <Checkbox 
                          id="select-all"
                          checked={allVisibleSelected}
                          onCheckedChange={handleSelectAllVisible}
                        />
                        <Label htmlFor="select-all" className="text-sm">
                          Pilih semua yang tampil
                        </Label>
                      </div>
                    )}
                  </div>
                </div>
                
                {/* Daftar Prajurit */}
                <div className="space-y-2 max-h-96 overflow-y-auto">
                  {filteredPrajurit.length === 0 ? (
                    <p className="text-center text-gray-500 py-8">
                      {searchTerm || selectedUnit !== 'semua' 
                        ? 'Tidak ada prajurit yang sesuai filter'
                        : 'Semua prajurit sudah dalam sesi atau sudah diundang'
                      }
                    </p>
                  ) : (
                    filteredPrajurit.map((prajurit) => (
                      <Card key={prajurit.id} className="p-4">
                        <div className="flex items-center space-x-3">
                          <Checkbox 
                            checked={selectedPrajurit.includes(prajurit.id)}
                            onCheckedChange={(checked) => handleSelectPrajurit(prajurit.id, checked)}
                          />
                          <Avatar>
                            <AvatarImage src={prajurit.avatar} alt={prajurit.name} />
                            <AvatarFallback>{prajurit.name.split(' ').map(n => n[0]).join('')}</AvatarFallback>
                          </Avatar>
                          <div className="flex-1">
                            <h4 className="font-semibold">{prajurit.name}</h4>
                            <p className="text-sm text-gray-600">{prajurit.rank} - {prajurit.unit}</p>
                          </div>
                          {getStatusBadge(prajurit.status)}
                        </div>
                      </Card>
                    ))
                  )}
                </div>
                
                <DialogFooter>
                  <Button 
                    type="button" 
                    variant="outline" 
                    onClick={() => setIsUndangOpen(false)}
                  >
                    Batal
                  </Button>
                  <Button 
                    onClick={handleSendInvitations}
                    disabled={selectedPrajurit.length === 0}
                  >
                    Kirim Undangan ({selectedPrajurit.length})
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>
        </div>

        {/* Status Undangan Pending */}
        {pendingInvitations.length > 0 && (
          <Card className="mb-6">
            <CardHeader>
              <CardTitle className="text-sm">Undangan Terkirim</CardTitle>
              <CardDescription>
                Prajurit yang sudah diundang ke sesi ini
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-2">
                {pendingInvitations.map(prajuritId => {
                  const prajurit = allPrajurit.find(p => p.id === prajuritId);
                  if (!prajurit) return null;
                  
                  return (
                    <div key={prajurit.id} className="flex items-center justify-between p-2 bg-yellow-50 rounded border border-yellow-200">
                      <div className="flex items-center gap-2">
                        <Avatar className="h-6 w-6">
                          <AvatarImage src={prajurit.avatar} alt={prajurit.name} />
                          <AvatarFallback className="text-xs">{prajurit.name.split(' ').map(n => n[0]).join('')}</AvatarFallback>
                        </Avatar>
                        <span className="text-sm font-medium">{prajurit.name}</span>
                        <Badge variant="outline" className="text-xs">Pending</Badge>
                      </div>
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        onClick={() => handleCancelInvitation(prajurit.id)}
                        className="h-6 w-6 p-0"
                      >
                        <X className="h-3 w-3" />
                      </Button>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Sesi Latihan Berlangsung */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Activity className="h-5 w-5" />
              {sesiAktif.name}
            </CardTitle>
            <CardDescription>
              <span className="flex items-center gap-2">
                <Clock className="h-4 w-4" /> {sesiAktif.time || sesiAktif.startTime}
                <MapPin className="h-4 w-4" /> {sesiAktif.location}
                {getSesiStatusBadge(sesiAktif.status)}
              </span>
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-semibold text-lg">Peserta Sesi ({prajuritSesi.length})</h2>
              <div className="flex gap-2">
                <Button variant={viewMode === 'grid' ? 'default' : 'outline'} size="sm" onClick={() => setViewMode('grid')}>
                  <Grid3X3 className="h-4 w-4" />
                </Button>
                <Button variant={viewMode === 'list' ? 'default' : 'outline'} size="sm" onClick={() => setViewMode('list')}>
                  <List className="h-4 w-4" />
                </Button>
              </div>
            </div>
            {/* Grid/List peserta dengan progress bar Shadcn dan urut kritis */}
            <div className={viewMode === 'grid' ? 'grid gap-4 md:grid-cols-2 lg:grid-cols-3' : 'flex flex-col gap-4'}>
              {prajuritSesi.map((prajurit) => (
                <Card key={prajurit.id} className={prajurit.status === 'kritis' ? 'border-l-4 border-l-red-500' : ''}>
                  <CardContent className="pt-4">
                    <div className="flex items-center gap-3 mb-3">
                      <Avatar>
                        <AvatarImage src={prajurit.avatar} alt={prajurit.name} />
                        <AvatarFallback>{prajurit.name.split(' ').map(n => n[0]).join('')}</AvatarFallback>
                      </Avatar>
                      <div>
                        <h4 className="font-semibold">{prajurit.name}</h4>
                        <p className="text-sm text-gray-600">{prajurit.rank} - {prajurit.unit}</p>
                        {getStatusBadge(prajurit.status)}
                      </div>
                    </div>
                    {/* Progress bar Shadcn untuk detak jantung, kecepatan, jarak */}
                    <div className="mb-2 space-y-2">
                      <div>
                        <div className="flex justify-between text-xs mb-1">
                          <span className="flex items-center gap-1"><Heart className="h-3 w-3 text-red-500" />Detak Jantung</span>
                          <span>{prajurit.heartRate} bpm</span>
                        </div>
                        <Progress value={getProgressValue(prajurit.heartRate, 200)} />
                      </div>
                      <div>
                        <div className="flex justify-between text-xs mb-1">
                          <span className="flex items-center gap-1"><Zap className="h-3 w-3 text-yellow-500" />Kecepatan</span>
                          <span>{prajurit.speed} km/h</span>
                        </div>
                        <Progress value={getProgressValue(prajurit.speed, 30)} />
                      </div>
                      <div>
                        <div className="flex justify-between text-xs mb-1">
                          <span className="flex items-center gap-1"><Route className="h-3 w-3 text-blue-500" />Jarak Tempuh</span>
                          <span>{prajurit.distance} km</span>
                        </div>
                        <Progress value={getProgressValue(prajurit.distance, 10)} />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Daftar prajurit lain untuk undangan */}
        <Card>
          <CardHeader>
            <CardTitle>Prajurit Lain</CardTitle>
            <CardDescription>Prajurit di luar sesi latihan</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
              {prajuritLain.length === 0 && <p className="text-gray-500">Semua prajurit sudah ikut sesi.</p>}
              {prajuritLain.map((prajurit) => (
                <Card key={prajurit.id} className="border-dashed border-2">
                  <CardContent className="pt-4 flex items-center gap-3">
                    <Avatar>
                      <AvatarImage src={prajurit.avatar} alt={prajurit.name} />
                      <AvatarFallback>{prajurit.name.split(' ').map(n => n[0]).join('')}</AvatarFallback>
                    </Avatar>
                    <div>
                      <h4 className="font-semibold">{prajurit.name}</h4>
                      <p className="text-sm text-gray-600">{prajurit.rank} - {prajurit.unit}</p>
                      {getStatusBadge(prajurit.status)}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
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