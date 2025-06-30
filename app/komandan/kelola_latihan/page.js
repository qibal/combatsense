'use client';
import { useSearchParams } from 'next/navigation';
import { useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from '@/components/Shadcn/card';
import { Button } from '@/components/Shadcn/button';
import { Input } from '@/components/Shadcn/input';
import { Label } from '@/components/Shadcn/label';
import { Badge } from '@/components/Shadcn/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/Shadcn/avatar';
import { Plus, Trash2, Calendar, Clock, MapPin } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/Shadcn/tabs';
import { useRouter } from 'next/navigation';
// Data dummy global (bisa dipindah ke context/global state jika perlu)
const DUMMY_KOMANDAN = [
  { 
    id: 1, 
    nama: 'Mayor Suharto',
    pangkat: 'Mayor',
    unit: 'Kompi A',
    avatar: '/avatars/suharto.jpg',
    spesialisasi: 'Taktik Tempur'
  },
  { 
    id: 2, 
    nama: 'Kapten Ahmad',
    pangkat: 'Kapten',
    unit: 'Kompi B',
    avatar: '/avatars/ahmad.jpg',
    spesialisasi: 'Strategi Pertahanan'
  },
];

const DUMMY_PRAJURIT = [
  { 
    id: 1, 
    nama: 'Budi Santoso',
    pangkat: 'Sersan Dua',
    unit: 'Kompi A',
    avatar: '/avatars/budi.jpg',
    spesialisasi: 'Penembak Jitu'
  },
  { 
    id: 2, 
    nama: 'Siti Aminah',
    pangkat: 'Kopral',
    unit: 'Kompi B',
    avatar: '/avatars/siti.jpg',
    spesialisasi: 'Komunikasi'
  },
  // ... tambahkan data prajurit lainnya
];

const DUMMY_MEDIS = [
  { 
    id: 1, 
    nama: 'Dr. Rina',
    pangkat: 'Letnan',
    unit: 'Tim Medis',
    avatar: '/avatars/rina.jpg',
    spesialisasi: 'Dokter Umum'
  },
  { 
    id: 2, 
    nama: 'Sersan Medis Dedi',
    pangkat: 'Sersan',
    unit: 'Tim Medis',
    avatar: '/avatars/dedi.jpg',
    spesialisasi: 'Paramedis'
  },
];

export default function KelolaLatihanPage() {
  const searchParams = useSearchParams();
  const sesiId = Number(searchParams.get('id'));
  const router = useRouter();

  // State untuk form sesi baru
  const [formSesi, setFormSesi] = useState({
    nama: '',
    tanggal: '',
    waktu: '',
    lokasi: '',
    deskripsi: '',
  });

  // State untuk peserta yang dipilih
  const [selectedKomandan, setSelectedKomandan] = useState([]);
  const [selectedPrajurit, setSelectedPrajurit] = useState([]);
  const [selectedMedis, setSelectedMedis] = useState([]);

  // Handler untuk form
  const handleFormChange = (e) => {
    const { name, value } = e.target;
    setFormSesi(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // Handler untuk toggle peserta
  const toggleKomandan = (id) => {
    setSelectedKomandan(prev => 
      prev.includes(id) 
        ? prev.filter(x => x !== id)
        : [...prev, id]
    );
  };

  const togglePrajurit = (id) => {
    setSelectedPrajurit(prev => 
      prev.includes(id) 
        ? prev.filter(x => x !== id)
        : [...prev, id]
    );
  };

  const toggleMedis = (id) => {
    setSelectedMedis(prev => 
      prev.includes(id) 
        ? prev.filter(x => x !== id)
        : [...prev, id]
    );
  };

  // Handler submit form
  const handleSubmit = (e) => {
    e.preventDefault();
    console.log('Form submitted:', {
      ...formSesi,
      komandan: selectedKomandan,
      prajurit: selectedPrajurit,
      medis: selectedMedis
    });
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-4xl mx-auto space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>{sesiId ? 'Edit Sesi Latihan' : 'Buat Sesi Latihan Baru'}</CardTitle>
            <CardDescription>
              {sesiId ? 'Edit detail dan peserta sesi latihan' : 'Isi detail sesi dan pilih peserta latihan'}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Detail Sesi */}
              <div className="grid gap-4">
                <div>
                  <Label htmlFor="nama">Nama Sesi Latihan</Label>
                  <Input
                    id="nama"
                    name="nama"
                    value={formSesi.nama}
                    onChange={handleFormChange}
                    placeholder="Contoh: Latihan Tembak Siang"
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="tanggal">Tanggal</Label>
                    <div className="relative">
                      <Calendar className="absolute left-2 top-2.5 h-4 w-4 text-gray-500" />
                      <Input
                        id="tanggal"
                        name="tanggal"
                        type="date"
                        value={formSesi.tanggal}
                        onChange={handleFormChange}
                        className="pl-8"
                      />
                    </div>
                  </div>
                  <div>
                    <Label htmlFor="waktu">Waktu</Label>
                    <div className="relative">
                      <Clock className="absolute left-2 top-2.5 h-4 w-4 text-gray-500" />
                      <Input
                        id="waktu"
                        name="waktu"
                        type="time"
                        value={formSesi.waktu}
                        onChange={handleFormChange}
                        className="pl-8"
                      />
                    </div>
                  </div>
                </div>
                <div>
                  <Label htmlFor="lokasi">Lokasi</Label>
                  <div className="relative">
                    <MapPin className="absolute left-2 top-2.5 h-4 w-4 text-gray-500" />
                    <Input
                      id="lokasi"
                      name="lokasi"
                      value={formSesi.lokasi}
                      onChange={handleFormChange}
                      placeholder="Contoh: Lapangan A"
                      className="pl-8"
                    />
                  </div>
                </div>
              </div>

              {/* Tabs Peserta */}
              <Tabs defaultValue="komandan" className="w-full">
                <TabsList className="grid w-full grid-cols-3">
                  <TabsTrigger value="komandan">Komandan ({selectedKomandan.length})</TabsTrigger>
                  <TabsTrigger value="prajurit">Prajurit ({selectedPrajurit.length})</TabsTrigger>
                  <TabsTrigger value="medis">Tim Medis ({selectedMedis.length})</TabsTrigger>
                </TabsList>

                {/* Tab Komandan */}
                <TabsContent value="komandan">
                  <div className="grid md:grid-cols-2 gap-4">
                    {DUMMY_KOMANDAN.map(komandan => (
                      <Card 
                        key={komandan.id}
                        className={`cursor-pointer transition-colors ${
                          selectedKomandan.includes(komandan.id) ? 'border-blue-500 bg-blue-50' : ''
                        }`}
                        onClick={() => toggleKomandan(komandan.id)}
                      >
                        <CardContent className="pt-4">
                          <div className="flex items-center gap-3">
                            <Avatar className="h-12 w-12">
                              <AvatarImage src={komandan.avatar} alt={komandan.nama} />
                              <AvatarFallback>{komandan.nama.split(' ').map(n => n[0]).join('')}</AvatarFallback>
                            </Avatar>
                            <div>
                              <h4 className="font-semibold">{komandan.nama}</h4>
                              <p className="text-sm text-gray-600">{komandan.pangkat}</p>
                              <div className="flex gap-2 mt-1">
                                <Badge variant="outline">{komandan.unit}</Badge>
                                <Badge variant="secondary">{komandan.spesialisasi}</Badge>
                              </div>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </TabsContent>

                {/* Tab Prajurit */}
                <TabsContent value="prajurit">
                  <div className="grid md:grid-cols-2 gap-4">
                    {DUMMY_PRAJURIT.map(prajurit => (
                      <Card 
                        key={prajurit.id}
                        className={`cursor-pointer transition-colors ${
                          selectedPrajurit.includes(prajurit.id) ? 'border-blue-500 bg-blue-50' : ''
                        }`}
                        onClick={() => togglePrajurit(prajurit.id)}
                      >
                        <CardContent className="pt-4">
                          <div className="flex items-center gap-3">
                            <Avatar className="h-12 w-12">
                              <AvatarImage src={prajurit.avatar} alt={prajurit.nama} />
                              <AvatarFallback>{prajurit.nama.split(' ').map(n => n[0]).join('')}</AvatarFallback>
                            </Avatar>
                            <div>
                              <h4 className="font-semibold">{prajurit.nama}</h4>
                              <p className="text-sm text-gray-600">{prajurit.pangkat}</p>
                              <div className="flex gap-2 mt-1">
                                <Badge variant="outline">{prajurit.unit}</Badge>
                                <Badge variant="secondary">{prajurit.spesialisasi}</Badge>
                              </div>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </TabsContent>

                {/* Tab Tim Medis */}
                <TabsContent value="medis">
                  <div className="grid md:grid-cols-2 gap-4">
                    {DUMMY_MEDIS.map(medis => (
                      <Card 
                        key={medis.id}
                        className={`cursor-pointer transition-colors ${
                          selectedMedis.includes(medis.id) ? 'border-blue-500 bg-blue-50' : ''
                        }`}
                        onClick={() => toggleMedis(medis.id)}
                      >
                        <CardContent className="pt-4">
                          <div className="flex items-center gap-3">
                            <Avatar className="h-12 w-12">
                              <AvatarImage src={medis.avatar} alt={medis.nama} />
                              <AvatarFallback>{medis.nama.split(' ').map(n => n[0]).join('')}</AvatarFallback>
                            </Avatar>
                            <div>
                              <h4 className="font-semibold">{medis.nama}</h4>
                              <p className="text-sm text-gray-600">{medis.pangkat}</p>
                              <div className="flex gap-2 mt-1">
                                <Badge variant="outline">{medis.unit}</Badge>
                                <Badge variant="secondary">{medis.spesialisasi}</Badge>
                              </div>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </TabsContent>
              </Tabs>

              <div className="flex justify-end gap-2">
                <Button type="button" variant="outline"  onClick={() => router.push('/komandan')}>
                  Batal
                </Button>
                <Button type="submit">
                  {sesiId ? 'Simpan Perubahan' : 'Buat Sesi Latihan'}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
// Cara penggunaan:
// - Halaman ini hanya untuk kelola peserta (komandan, prajurit, medis) pada satu sesi latihan.
// - Tidak ada statistik performa prajurit di sini.
// - Semua data dummy, bisa diubah ke API/database jika sudah siap.
