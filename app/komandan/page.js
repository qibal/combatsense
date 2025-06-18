'use client'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/Shadcn/card';
import { Button } from '@/components/Shadcn/button';
import { Input } from '@/components/Shadcn/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/Shadcn/tabs';
import { Badge } from '@/components/Shadcn/badge';
import { Calendar } from '@/components/Shadcn/calendar';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/Shadcn/select';
import { Label } from '@/components/Shadcn/label';
import { Textarea } from '@/components/Shadcn/textarea';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/Shadcn/dialog';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/Shadcn/avatar';
import { Switch } from '@/components/Shadcn/switch';
import { 
  Calendar as CalendarIcon,
  Plus, 
  Users, 
  Activity, 
  MapPin, 
  Clock,
  Heart,
  Zap,
  Route,
  Grid3X3,
  List,
  Play,
  Pause,
  Square
} from 'lucide-react';
import { useState } from 'react';

/**
 * Dashboard Komandan - Kelola Sesi Latihan dan Monitor Prajurit
 * Menu: Home, Sesi Latihan, Kalender
 */
export default function KomandanDashboard() {
  // Data dummy untuk development
  const dummyPrajurit = [
    {
      id: 1,
      name: "Budi Santoso",
      unit: "Kompi A",
      rank: "Sersan Dua",
      heartRate: 85,
      speed: 12.5,
      distance: 2.3,
      status: "sehat",
      avatar: "/avatars/budi.jpg"
    },
    {
      id: 2,
      name: "Siti Aminah",
      unit: "Tim Medis",
      rank: "Dokter",
      heartRate: 72,
      speed: 8.2,
      distance: 1.8,
      status: "prima",
      avatar: "/avatars/siti.jpg"
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
      avatar: "/avatars/ahmad.jpg"
    }
  ];

  const dummySesiHariIni = [
    {
      id: 1,
      name: "Latihan Tembak Siang",
      status: "berlangsung",
      startTime: "14:00",
      participants: 15,
      location: "Lapangan A"
    },
    {
      id: 2,
      name: "Patroli Malam",
      status: "terjadwal",
      startTime: "20:00",
      participants: 8,
      location: "Sector 3"
    }
  ];

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
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Dashboard Komandan</h1>
            <p className="text-gray-600">Kelola sesi latihan dan monitor prajurit</p>
          </div>
          <Badge variant="outline" className="px-3 py-1">
            <Clock className="h-4 w-4 mr-1" />
            {new Date().toLocaleDateString('id-ID')}
          </Badge>
        </div>

        <Tabs defaultValue="home" className="space-y-6">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="home" className="flex items-center gap-2">
              <Activity className="h-4 w-4" />
              Home
            </TabsTrigger>
            <TabsTrigger value="sessions" className="flex items-center gap-2">
              <Users className="h-4 w-4" />
              Sesi Latihan
            </TabsTrigger>
            <TabsTrigger value="calendar" className="flex items-center gap-2">
              <CalendarIcon className="h-4 w-4" />
              Kalender
            </TabsTrigger>
          </TabsList>

          {/* Home Tab */}
          <TabsContent value="home" className="space-y-6">
            {/* Sesi Latihan Hari Ini */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <CalendarIcon className="h-5 w-5" />
                  Sesi Latihan Hari Ini
                </CardTitle>
                <CardDescription>
                  Monitoring sesi latihan yang berlangsung dan terjadwal hari ini
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid gap-4 md:grid-cols-2">
                  {dummySesiHariIni.map((sesi) => (
                    <Card key={sesi.id} className="border-l-4 border-l-blue-500">
                      <CardContent className="pt-4">
                        <div className="flex items-center justify-between mb-2">
                          <h4 className="font-semibold">{sesi.name}</h4>
                          {getSesiStatusBadge(sesi.status)}
                        </div>
                        <div className="text-sm text-gray-600 space-y-1">
                          <p className="flex items-center gap-1">
                            <Clock className="h-4 w-4" />
                            {sesi.startTime}
                          </p>
                          <p className="flex items-center gap-1">
                            <Users className="h-4 w-4" />
                            {sesi.participants} peserta
                          </p>
                          <p className="flex items-center gap-1">
                            <MapPin className="h-4 w-4" />
                            {sesi.location}
                          </p>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Monitor Prajurit */}
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="flex items-center gap-2">
                      <Users className="h-5 w-5" />
                      Monitor Prajurit
                    </CardTitle>
                    <CardDescription>
                      Data real-time prajurit yang sedang berlatih
                    </CardDescription>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button variant="outline" size="sm">
                      <Grid3X3 className="h-4 w-4" />
                    </Button>
                    <Button variant="outline" size="sm">
                      <List className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                  {dummyPrajurit.map((prajurit) => (
                    <Card key={prajurit.id} className="hover:shadow-md transition-shadow">
                      <CardContent className="pt-4">
                        <div className="flex items-center gap-3 mb-3">
                          <Avatar>
                            <AvatarImage src={prajurit.avatar} alt={prajurit.name} />
                            <AvatarFallback>{prajurit.name.split(' ').map(n => n[0]).join('')}</AvatarFallback>
                          </Avatar>
                          <div>
                            <h4 className="font-semibold">{prajurit.name}</h4>
                            <p className="text-sm text-gray-600">{prajurit.rank} - {prajurit.unit}</p>
                          </div>
                        </div>
                        
                        <div className="space-y-2 mb-3">
                          <div className="flex items-center justify-between text-sm">
                            <span className="flex items-center gap-1">
                              <Heart className="h-4 w-4 text-red-500" />
                              Detak Jantung
                            </span>
                            <span className="font-medium">{prajurit.heartRate} bpm</span>
                          </div>
                          
                          <div className="flex items-center justify-between text-sm">
                            <span className="flex items-center gap-1">
                              <Zap className="h-4 w-4 text-yellow-500" />
                              Kecepatan
                            </span>
                            <span className="font-medium">{prajurit.speed} km/h</span>
                          </div>
                          
                          <div className="flex items-center justify-between text-sm">
                            <span className="flex items-center gap-1">
                              <Route className="h-4 w-4 text-blue-500" />
                              Jarak Tempuh
                            </span>
                            <span className="font-medium">{prajurit.distance} km</span>
                          </div>
                        </div>
                        
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-gray-600">Status Kebugaran:</span>
                          {getStatusBadge(prajurit.status)}
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Sessions Tab */}
          <TabsContent value="sessions" className="space-y-6">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>Kelola Sesi Latihan</CardTitle>
                    <CardDescription>Buat dan kelola sesi latihan untuk prajurit</CardDescription>
                  </div>
                  <Dialog>
                    <DialogTrigger asChild>
                      <Button className="flex items-center gap-2">
                        <Plus className="h-4 w-4" />
                        Buat Sesi Latihan
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="max-w-2xl">
                      <DialogHeader>
                        <DialogTitle>Buat Sesi Latihan Baru</DialogTitle>
                        <DialogDescription>
                          Isi form untuk membuat sesi latihan baru
                        </DialogDescription>
                      </DialogHeader>
                      
                      <form className="space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                          <div className="grid gap-2">
                            <Label htmlFor="session_name">Nama Sesi</Label>
                            <Input id="session_name" placeholder="Contoh: Latihan Tembak Pagi" />
                          </div>
                          
                          <div className="grid gap-2">
                            <Label htmlFor="session_status">Status</Label>
                            <Select>
                              <SelectTrigger>
                                <SelectValue placeholder="Pilih status" />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="draft">Draft</SelectItem>
                                <SelectItem value="terjadwal">Terjadwal</SelectItem>
                                <SelectItem value="aktif">Aktif</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                        </div>
                        
                        <div className="grid grid-cols-2 gap-4">
                          <div className="grid gap-2">
                            <Label htmlFor="session_date">Tanggal</Label>
                            <Input id="session_date" type="date" />
                          </div>
                          
                          <div className="grid gap-2">
                            <Label htmlFor="session_time">Jam</Label>
                            <Input id="session_time" type="time" />
                          </div>
                        </div>
                        
                        <div className="grid gap-2">
                          <Label htmlFor="session_description">Deskripsi</Label>
                          <Textarea id="session_description" placeholder="Deskripsi latihan..." />
                        </div>
                        
                        <div className="grid gap-2">
                          <Label>Peserta Latihan</Label>
                          <div className="border rounded-md p-3 max-h-32 overflow-y-auto">
                            {dummyPrajurit.map((prajurit) => (
                              <div key={prajurit.id} className="flex items-center space-x-2 py-1">
                                <input type="checkbox" id={`prajurit-${prajurit.id}`} />
                                <label htmlFor={`prajurit-${prajurit.id}`} className="text-sm">
                                  {prajurit.name} - {prajurit.unit}
                                </label>
                              </div>
                            ))}
                          </div>
                        </div>
                        
                        <DialogFooter>
                          <Button type="submit">Buat Sesi Latihan</Button>
                        </DialogFooter>
                      </form>
                    </DialogContent>
                  </Dialog>
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-center py-10">
                  <Users className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">Belum ada sesi latihan</h3>
                  <p className="text-gray-500 mb-4">Mulai dengan membuat sesi latihan pertama</p>
                  <Button variant="outline">Lihat Riwayat Sesi</Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Calendar Tab */}
          <TabsContent value="calendar" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Kalender Sesi Latihan</CardTitle>
                <CardDescription>Lihat jadwal sesi latihan dalam bentuk kalender</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <Calendar
                      mode="single"
                      className="rounded-md border"
                    />
                  </div>
                  <div>
                    <h4 className="font-semibold mb-3">Sesi Hari Ini</h4>
                    <div className="space-y-3">
                      {dummySesiHariIni.map((sesi) => (
                        <Card key={sesi.id} className="border-l-4 border-l-green-500">
                          <CardContent className="pt-3">
                            <div className="flex items-center justify-between mb-1">
                              <h5 className="font-medium text-sm">{sesi.name}</h5>
                              {getSesiStatusBadge(sesi.status)}
                            </div>
                            <p className="text-xs text-gray-600">{sesi.startTime} - {sesi.participants} peserta</p>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}

/**
 * Cara penggunaan:
 * 
 * 1. Dashboard 3 tab utama: Home, Sesi Latihan, Kalender
 * 2. Home: Monitor real-time prajurit dan sesi hari ini
 * 3. Sesi Latihan: Form buat sesi baru dengan multi-select peserta
 * 4. Kalender: Shadcn calendar untuk lihat jadwal
 * 
 * Features:
 * - Responsive design dengan Tailwind
 * - Badge status untuk kesehatan dan sesi
 * - Card layout untuk data prajurit
 * - Modal form untuk buat sesi latihan
 * - Grid/List toggle untuk tampilan prajurit
 * - Real-time data display (dummy data)
 * 
 * Next steps:
 * - Integrasikan dengan API data prajurit
 * - Tambah WebSocket untuk real-time updates
 * - Implementasi map visualization
 * - Connect dengan database sesi latihan
 */