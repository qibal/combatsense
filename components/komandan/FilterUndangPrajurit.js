'use client'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { 
  UserPlus, 
  Search, 
  Filter,
  Check,
  X
} from 'lucide-react';
import { useState } from 'react';

/**
 * Komponen untuk Filter dan Undang Prajurit ke Sesi Latihan
 * Menggunakan Checkbox dan Dialog dari Shadcn untuk multi-select
 */
export default function FilterUndangPrajurit({ onInvitePrajurit }) {
  // Data dummy prajurit dengan unit yang lebih lengkap
  const [allPrajurit] = useState([
    {
      id: 1,
      name: "Budi Santoso",
      unit: "Kompi A",
      rank: "Sersan Dua",
      status: "sehat",
      avatar: "/avatars/budi.jpg",
      inSession: false
    },
    {
      id: 2,
      name: "Ahmad Yusuf",
      unit: "Kompi B",
      rank: "Kopral",
      status: "prima",
      avatar: "/avatars/ahmad.jpg",
      inSession: false
    },
    {
      id: 3,
      name: "Dewi Lestari",
      unit: "Kompi C",
      rank: "Letnan",
      status: "prima",
      avatar: "/avatars/dewi.jpg",
      inSession: false
    },
    {
      id: 4,
      name: "Eko Prasetyo",
      unit: "Tim Medis",
      rank: "Dokter",
      status: "sehat",
      avatar: "/avatars/eko.jpg",
      inSession: false
    },
    {
      id: 5,
      name: "Fitri Handayani",
      unit: "Tim Logistik",
      rank: "Sersan Satu",
      status: "prima",
      avatar: "/avatars/fitri.jpg",
      inSession: false
    },
    {
      id: 6,
      name: "Gani Kurniawan",
      unit: "Kompi A",
      rank: "Prajurit Dua",
      status: "lelah",
      avatar: "/avatars/gani.jpg",
      inSession: false
    },
    {
      id: 7,
      name: "Hani Sari",
      unit: "Tim Medis",
      rank: "Perawat",
      status: "sehat",
      avatar: "/avatars/hani.jpg",
      inSession: false
    },
    {
      id: 8,
      name: "Indra Gunawan",
      unit: "Kompi B",
      rank: "Kopral Kepala",
      status: "prima",
      avatar: "/avatars/indra.jpg",
      inSession: false
    }
  ]);

  // State untuk filter dan undangan
  const [isUndangOpen, setIsUndangOpen] = useState(false);
  const [selectedUnit, setSelectedUnit] = useState('semua');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedPrajurit, setSelectedPrajurit] = useState([]);
  const [pendingInvitations, setPendingInvitations] = useState([]);

  // Dapatkan daftar unit unik
  const availableUnits = ['semua', ...new Set(allPrajurit.map(p => p.unit))];

  // Filter prajurit berdasarkan unit dan search term
  const filteredPrajurit = allPrajurit.filter(prajurit => {
    const matchUnit = selectedUnit === 'semua' || prajurit.unit === selectedUnit;
    const matchSearch = prajurit.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                       prajurit.rank.toLowerCase().includes(searchTerm.toLowerCase());
    const notInSession = !prajurit.inSession;
    const notPending = !pendingInvitations.includes(prajurit.id);
    
    return matchUnit && matchSearch && notInSession && notPending;
  });

  // Handle checkbox selection
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
    
    // Tambah ke pending invitations
    setPendingInvitations(prev => [...prev, ...selectedPrajurit]);
    
    // Callback ke parent component jika ada
    if (onInvitePrajurit) {
      const invitedPrajurit = allPrajurit.filter(p => selectedPrajurit.includes(p.id));
      onInvitePrajurit(invitedPrajurit);
    }
    
    // Reset selections
    setSelectedPrajurit([]);
    setIsUndangOpen(false);
    
    // Show success message (bisa pakai toast nanti)
    console.log(`Undangan terkirim ke ${selectedPrajurit.length} prajurit`);
  };

  // Handle batal undangan pending
  const handleCancelInvitation = (prajuritId) => {
    setPendingInvitations(prev => prev.filter(id => id !== prajuritId));
  };

  // Helper untuk status badge
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

  // Hitung prajurit yang sudah dipilih untuk select all
  const allVisibleSelected = filteredPrajurit.length > 0 && 
    filteredPrajurit.every(p => selectedPrajurit.includes(p.id));

  return (
    <div>
      {/* Tombol Undang Prajurit */}
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
      
      {/* Status Undangan Pending */}
      {pendingInvitations.length > 0 && (
        <Card className="mt-4">
          <CardHeader>
            <CardTitle className="text-sm">Undangan Terkirim</CardTitle>
            <CardDescription>
              Prajurit yang sudah diundang ke sesi ini
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-2">
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
    </div>
  );
}

/**
 * Cara penggunaan:
 * import FilterUndangPrajurit from '@/components/komandan/FilterUndangPrajurit';
 * 
 * // Di dalam component:
 * <FilterUndangPrajurit 
 *   onInvitePrajurit={(prajurit) => {
 *     console.log('Prajurit yang diundang:', prajurit);
 *   }}
 * />
 * 
 * Fitur yang tersedia:
 * - Filter prajurit berdasarkan unit/pasukan
 * - Search prajurit berdasarkan nama/pangkat
 * - Multi-select dengan checkbox (termasuk select all)
 * - Status undangan pending dengan opsi batal
 * - Responsive grid layout untuk daftar prajurit
 */