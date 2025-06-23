'use client'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { 
  User, 
  Edit, 
  Plus, 
  Trash2, 
  Calendar as CalendarIcon,
  Clock,
  MapPin,
  Users
} from 'lucide-react';
import { useState } from 'react';
import { format } from 'date-fns';

/**
 * Komponen untuk Profile Komandan dan CRUD Latihan
 * Menggunakan Dialog dan Tabs dari Shadcn untuk UI yang clean
 */
export default function ProfileLatihanModal() {
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
      participants: 15
    },
    {
      id: 2,
      name: "Latihan Fisik Pagi",
      location: "Lapangan B",
      date: new Date(2024, 11, 26),
      time: "06:00",
      status: "terjadwal",
      description: "Latihan kondisi fisik rutin",
      participants: 8
    }
  ]);

  // State untuk form
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isLatihanOpen, setIsLatihanOpen] = useState(false);
  const [editingLatihan, setEditingLatihan] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    location: '',
    date: new Date(),
    time: '',
    description: '',
    status: 'terjadwal'
  });

  // Handle profile update
  const handleProfileUpdate = (e) => {
    e.preventDefault();
    // Logic update profile (nanti connect ke API)
    console.log('Profile updated:', profileData);
    setIsProfileOpen(false);
  };

  // Handle tambah/edit latihan
  const handleLatihanSubmit = (e) => {
    e.preventDefault();
    if (editingLatihan) {
      // Update latihan existing
      setLatihanList(prev => prev.map(item => 
        item.id === editingLatihan.id 
          ? { ...item, ...formData, participants: item.participants }
          : item
      ));
    } else {
      // Tambah latihan baru
      const newLatihan = {
        id: Date.now(),
        ...formData,
        participants: 0
      };
      setLatihanList(prev => [...prev, newLatihan]);
    }
    
    // Reset form
    setFormData({
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
    setFormData({
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

  // Helper untuk status badge
  const getStatusBadge = (status) => {
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
              <Button variant="outline" size="sm">
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
                            {getStatusBadge(latihan.status)}
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
                  setFormData({
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
                      value={formData.name}
                      onChange={(e) => setFormData(prev => ({...prev, name: e.target.value}))}
                      placeholder="Contoh: Latihan Tembak Siang"
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="location">Lokasi</Label>
                    <Input 
                      id="location"
                      value={formData.location}
                      onChange={(e) => setFormData(prev => ({...prev, location: e.target.value}))}
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
                          {format(formData.date, 'dd/MM/yyyy')}
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0">
                        <Calendar
                          mode="single"
                          selected={formData.date}
                          onSelect={(date) => setFormData(prev => ({...prev, date}))}
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
                      value={formData.time}
                      onChange={(e) => setFormData(prev => ({...prev, time: e.target.value}))}
                      required
                    />
                  </div>
                </div>
                
                <div>
                  <Label htmlFor="status">Status</Label>
                  <Select 
                    value={formData.status} 
                    onValueChange={(value) => setFormData(prev => ({...prev, status: value}))}
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
                    value={formData.description}
                    onChange={(e) => setFormData(prev => ({...prev, description: e.target.value}))}
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
    </div>
  );
}

/**
 * Cara penggunaan:
 * import ProfileLatihanModal from '@/components/komandan/ProfileLatihanModal';
 * 
 * // Di dalam component:
 * <ProfileLatihanModal />
 * 
 * Fitur yang tersedia:
 * - Profile komandan (lihat/edit data pribadi)
 * - CRUD latihan (buat, edit, hapus sesi latihan)
 * - Tabs untuk organisir UI yang clean
 * - Form validation dengan Shadcn components
 */