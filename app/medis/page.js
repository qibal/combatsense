'use client';

import { useState, useMemo } from 'react';
import { useTheme } from 'next-themes';
import { DUMMY_USERS, DUMMY_UNITS, DUMMY_RANKS, getFullUsersData } from '@/lib/admin-dummy-data';
import { Button } from '@/components/Shadcn/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/Shadcn/card';
import { Input } from '@/components/Shadcn/input';
import { Label } from '@/components/Shadcn/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/Shadcn/select';
import { Textarea } from '@/components/Shadcn/textarea';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/Shadcn/avatar';
import { Separator } from '@/components/Shadcn/separator';
import { toast } from 'sonner';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/Shadcn/dialog';
import { ScrollArea } from '@/components/Shadcn/scroll-area';
import { Stethoscope, User, BookHeart, PlusCircle, Sun, Moon, Search } from 'lucide-react';

// Mock data medis
const currentMedic = {
    name: "Dr. Rina",
    avatar: "/avatars/rina.jpg",
    unit: "Tim Medis Batalyon"
};

const initialFormData = {
    examiner: currentMedic.name,
    generalCondition: 'Baik',
    notes: '',
    weight: '',
    height: '',
    bloodPressure: '',
    pulse: '',
    temperature: '',
    glucose: '',
    cholesterol: '',
    hemoglobin: '',
    otherDiseases: 'Tidak ada'
};

export default function MedisDashboard() {
    const [medicalRecords, setMedicalRecords] = useState({});
    const [selectedSoldier, setSelectedSoldier] = useState(null);
    const [formData, setFormData] = useState(initialFormData);
    const [isSoldierPickerOpen, setIsSoldierPickerOpen] = useState(false);
    
    const soldiers = useMemo(() => getFullUsersData().filter(user => user.role === 'prajurit'), []);

    const handleSoldierSelect = (soldier) => {
        setSelectedSoldier(soldier);
        setFormData(initialFormData); 
        setIsSoldierPickerOpen(false);
    };
    
    const handleInputChange = (e) => {
        const { id, value } = e.target;
        setFormData(prev => ({...prev, [id]: value}));
    };

    const handleSelectChange = (id, value) => {
         setFormData(prev => ({...prev, [id]: value}));
    };

    const calculateBMI = () => {
        if (formData.weight && formData.height) {
            const heightInMeters = formData.height / 100;
            const bmi = (formData.weight / (heightInMeters * heightInMeters)).toFixed(1);
            return bmi;
        }
        return 'N/A';
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        if (!selectedSoldier) {
            toast.error("Silakan pilih prajurit terlebih dahulu.");
            return;
        }
        if (!formData.weight || !formData.height || !formData.bloodPressure || !formData.pulse) {
            toast.error("Harap isi kolom Berat, Tinggi, Tekanan Darah, dan Denyut Nadi.");
            return;
        }

        const newRecord = {
            id: Date.now(),
            checkupDate: new Date().toISOString().split('T')[0],
            ...formData,
            bmi: calculateBMI(),
        };

        setMedicalRecords(prevRecords => ({
            ...prevRecords,
            [selectedSoldier.id]: [...(prevRecords[selectedSoldier.id] || []), newRecord]
        }));

        toast.success(`Rekam medis untuk ${selectedSoldier.full_name} berhasil disimpan.`);
        setFormData(initialFormData);
    };

    const selectedSoldierRecords = selectedSoldier ? medicalRecords[selectedSoldier.id] || [] : [];

    return (
        <div className="min-h-screen bg-gray-100 dark:bg-zinc-950 p-4 sm:p-6 lg:p-8">
            <div className="max-w-7xl mx-auto">
                <DashboardHeader medic={currentMedic} />

                <main className="grid grid-cols-1 lg:grid-cols-3 gap-8 mt-8">
                    <div className="lg:col-span-2">
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2 text-xl">
                                     <PlusCircle className="h-6 w-6" />
                                     Form Pemeriksaan Medis
                                </CardTitle>
                                <CardDescription>Pilih prajurit dan isi detail pemeriksaan di bawah ini.</CardDescription>
                            </CardHeader>
                            <CardContent>
                                <form onSubmit={handleSubmit} className="space-y-6">
                                    <div>
                                        <Label className="text-base font-semibold">Prajurit yang Diperiksa</Label>
                                        <div className="flex items-center gap-4 mt-2">
                                            <Button type="button" variant="outline" onClick={() => setIsSoldierPickerOpen(true)} className="flex-1 justify-start text-left font-normal">
                                                {selectedSoldier ? (
                                                     <div className="flex items-center gap-2">
                                                        <Avatar className="h-6 w-6">
                                                            <AvatarImage src={selectedSoldier.avatar} />
                                                            <AvatarFallback>{selectedSoldier.full_name.split(' ').map(n=>n[0]).join('')}</AvatarFallback>
                                                        </Avatar>
                                                        <span>{selectedSoldier.full_name}</span>
                                                    </div>
                                                ) : "Pilih prajurit..."}
                                            </Button>
                                            <SoldierPickerDialog 
                                                isOpen={isSoldierPickerOpen} 
                                                setIsOpen={setIsSoldierPickerOpen}
                                                onSoldierSelect={handleSoldierSelect} 
                                                soldiers={soldiers}
                                            />
                                        </div>
                                    </div>
                                    
                                    <Separator />
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4">
                                        <div className="space-y-4 p-4 border rounded-lg">
                                            <h3 className="font-semibold text-lg">Data Vital</h3>
                                            <div className="grid grid-cols-2 gap-4">
                                                <div>
                                                    <Label htmlFor="weight">Berat (kg)</Label>
                                                    <Input id="weight" type="number" value={formData.weight} onChange={handleInputChange} className="mt-1" />
                                                </div>
                                                <div>
                                                    <Label htmlFor="height">Tinggi (cm)</Label>
                                                    <Input id="height" type="number" value={formData.height} onChange={handleInputChange} className="mt-1" />
                                                </div>
                                            </div>
                                            <div>
                                                <Label>Indeks Massa Tubuh (IMT)</Label>
                                                <Input value={calculateBMI()} disabled className="mt-1 bg-gray-100" />
                                            </div>
                                            <div>
                                                <Label htmlFor="bloodPressure">Tekanan Darah (mmHg)</Label>
                                                <Input id="bloodPressure" value={formData.bloodPressure} onChange={handleInputChange} placeholder="cth: 120/80" className="mt-1" />
                                            </div>
                                            <div>
                                                <Label htmlFor="pulse">Denyut Nadi (bpm)</Label>
                                                <Input id="pulse" type="number" value={formData.pulse} onChange={handleInputChange} className="mt-1" />
                                            </div>
                                             <div>
                                                <Label htmlFor="temperature">Suhu (°C)</Label>
                                                <Input id="temperature" type="number" step="0.1" value={formData.temperature} onChange={handleInputChange} className="mt-1" />
                                            </div>
                                        </div>
                                        <div className="space-y-4 p-4 border rounded-lg">
                                            <h3 className="font-semibold text-lg">Data Lab & Kondisi</h3>
                                             <div className="grid grid-cols-2 gap-4">
                                                <div>
                                                    <Label htmlFor="glucose">Gula Darah (mg/dL)</Label>
                                                    <Input id="glucose" type="number" value={formData.glucose} onChange={handleInputChange} className="mt-1" />
                                                </div>
                                                <div>
                                                    <Label htmlFor="cholesterol">Kolesterol (mg/dL)</Label>
                                                    <Input id="cholesterol" type="number" value={formData.cholesterol} onChange={handleInputChange} className="mt-1" />
                                                </div>
                                            </div>
                                            <div>
                                                <Label htmlFor="hemoglobin">Hemoglobin (g/dL)</Label>
                                                <Input id="hemoglobin" type="number" step="0.1" value={formData.hemoglobin} onChange={handleInputChange} className="mt-1" />
                                            </div>
                                             <div>
                                                <Label htmlFor="generalCondition">Kondisi Umum</Label>
                                                <Select value={formData.generalCondition} onValueChange={(v) => handleSelectChange('generalCondition', v)}>
                                                    <SelectTrigger id="generalCondition" className="mt-1">
                                                        <SelectValue />
                                                    </SelectTrigger>
                                                    <SelectContent>
                                                        <SelectItem value="Baik">Baik</SelectItem>
                                                        <SelectItem value="Cukup">Cukup</SelectItem>
                                                        <SelectItem value="Kurang">Kurang</SelectItem>
                                                    </SelectContent>
                                                </Select>
                                            </div>
                                            <div>
                                                <Label htmlFor="otherDiseases">Riwayat Penyakit Lain</Label>
                                                <Input id="otherDiseases" value={formData.otherDiseases} onChange={handleInputChange} className="mt-1" />
                                            </div>
                                        </div>
                                        <div className="md:col-span-2">
                                            <Label htmlFor="notes">Catatan Pemeriksaan</Label>
                                            <Textarea id="notes" value={formData.notes} onChange={handleInputChange} rows={4} placeholder="Tulis catatan tambahan di sini..." className="mt-1"/>
                                        </div>
                                    </div>
                                    <div className="flex justify-end">
                                        <Button type="submit" size="lg" disabled={!selectedSoldier}>Simpan Catatan</Button>
                                    </div>
                                </form>
                            </CardContent>
                        </Card>
                    </div>

                    <aside className="lg:col-span-1 space-y-8">
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <User className="h-5 w-5" />
                                    Info Prajurit
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                {selectedSoldier ? (
                                    <div className="flex items-center gap-4">
                                        <Avatar className="h-20 w-20">
                                            <AvatarImage src={selectedSoldier.avatar} alt={selectedSoldier.full_name} />
                                            <AvatarFallback className="text-2xl">{selectedSoldier.full_name.split(' ').map(n=>n[0]).join('')}</AvatarFallback>
                                        </Avatar>
                                        <div>
                                            <h3 className="text-lg font-bold">{selectedSoldier.full_name}</h3>
                                            <p className="text-gray-600 dark:text-gray-300">{selectedSoldier.rank_name}</p>
                                            <p className="text-sm text-gray-500 dark:text-gray-400">{selectedSoldier.unit_name}</p>
                                        </div>
                                    </div>
                                ) : (
                                    <p className="text-center text-gray-500 py-8">Pilih prajurit untuk melihat info.</p>
                                )}
                            </CardContent>
                        </Card>
                        
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <BookHeart className="h-5 w-5" />
                                    Riwayat Pemeriksaan
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                 <div className="space-y-4 max-h-[600px] overflow-y-auto pr-2">
                                    {selectedSoldierRecords.length > 0 ? selectedSoldierRecords.map(record => (
                                         <div key={record.id} className="p-3 border rounded-md text-sm">
                                            <p className="font-semibold mb-1">Pemeriksaan: {new Date(record.checkupDate).toLocaleDateString('id-ID')}</p>
                                            <p><strong className="font-medium">Oleh:</strong> {record.examiner}</p>
                                            <p><strong className="font-medium">Kondisi:</strong> {record.generalCondition}</p>
                                            <p><strong className="font-medium">Catatan:</strong> {record.notes}</p>
                                            <Separator className="my-2" />
                                            <div className="grid grid-cols-2 gap-1 text-xs">
                                                <span><strong className="font-medium">BB/TB:</strong> {record.weight}kg / {record.height}cm</span>
                                                <span><strong className="font-medium">IMT:</strong> {record.bmi}</span>
                                                <span><strong className="font-medium">Tensi:</strong> {record.bloodPressure}</span>
                                                <span><strong className="font-medium">Nadi:</strong> {record.pulse}bpm</span>
                                            </div>
                                         </div>
                                    )).reverse() : (
                                        <p className="text-center text-gray-500 py-8">Belum ada riwayat pemeriksaan.</p>
                                    )}
                                 </div>
                            </CardContent>
                        </Card>
                    </aside>
                </main>
            </div>
        </div>
    );
}

// Header Component
function DashboardHeader({ medic }) {
    const { theme, setTheme } = useTheme();

    return (
        <header className="flex items-center justify-between">
            <div>
                <h1 className="text-3xl font-bold text-gray-900 dark:text-white flex items-center gap-3">
                    <Stethoscope className="h-8 w-8 text-red-600" />
                    Dashboard Medis
                </h1>
                <p className="text-gray-600 dark:text-gray-400 mt-1">Buat dan kelola rekam medis prajurit.</p>
            </div>
            <div className="flex items-center gap-4">
                <div className="flex items-center gap-3">
                     <Avatar>
                        <AvatarImage src={medic.avatar} />
                        <AvatarFallback>{medic.name.split(' ').map(n=>n[0]).join('')}</AvatarFallback>
                    </Avatar>
                    <div>
                        <p className="font-semibold">{medic.name}</p>
                        <p className="text-sm text-gray-500">{medic.unit}</p>
                    </div>
                </div>
                <Button variant="outline" size="icon" onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}>
                    <Sun className="h-[1.2rem] w-[1.2rem] rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
                    <Moon className="absolute h-[1.2rem] w-[1.2rem] rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
                    <span className="sr-only">Toggle theme</span>
                </Button>
            </div>
        </header>
    );
}

// Soldier Picker Dialog Component
function SoldierPickerDialog({ isOpen, setIsOpen, onSoldierSelect, soldiers }) {
    const [filterUnit, setFilterUnit] = useState('');
    const [filterRank, setFilterRank] = useState('');
    const [searchTerm, setSearchTerm] = useState('');
    
    const units = useMemo(() => DUMMY_UNITS, []);
    const ranks = useMemo(() => DUMMY_RANKS, []);

    const filteredSoldiers = useMemo(() => {
        return soldiers
            .filter(s => !filterUnit || s.unit_id === filterUnit)
            .filter(s => !filterRank || s.rank_id === filterRank)
            .filter(s => s.full_name.toLowerCase().includes(searchTerm.toLowerCase()));
    }, [soldiers, filterUnit, filterRank, searchTerm]);

    return (
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
            <DialogContent className="max-w-3xl">
                <DialogHeader>
                    <DialogTitle>Pilih Prajurit</DialogTitle>
                </DialogHeader>
                <div className="flex flex-col md:flex-row gap-4 my-4">
                    <Select value={filterUnit} onValueChange={(value) => setFilterUnit(value === 'all-units' ? '' : value)}>
                        <SelectTrigger><SelectValue placeholder="Filter unit" /></SelectTrigger>
                        <SelectContent>
                             <SelectItem value="all-units">Semua Unit</SelectItem>
                            {units.map(u => <SelectItem key={u.id} value={u.id}>{u.name}</SelectItem>)}
                        </SelectContent>
                    </Select>
                     <Select value={filterRank} onValueChange={(value) => setFilterRank(value === 'all-ranks' ? '' : value)}>
                        <SelectTrigger><SelectValue placeholder="Filter pangkat" /></SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all-ranks">Semua Pangkat</SelectItem>
                            {ranks.map(r => <SelectItem key={r.id} value={r.id}>{r.name}</SelectItem>)}
                        </SelectContent>
                    </Select>
                    <div className="relative flex-1">
                        <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500" />
                        <Input 
                            placeholder="Cari nama prajurit..." 
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="pl-8"
                        />
                    </div>
                </div>
                <ScrollArea className="h-[400px] border rounded-md">
                    <div className="p-4 space-y-2">
                        {filteredSoldiers.length > 0 ? filteredSoldiers.map(soldier => (
                            <div 
                                key={soldier.id}
                                onClick={() => onSoldierSelect(soldier)}
                                className="flex items-center gap-4 p-2 rounded-md hover:bg-gray-100 dark:hover:bg-zinc-800 cursor-pointer"
                            >
                                <Avatar>
                                    <AvatarImage src={soldier.avatar} />
                                    <AvatarFallback>{soldier.full_name.split(' ').map(n=>n[0]).join('')}</AvatarFallback>
                                </Avatar>
                                <div>
                                    <p className="font-semibold">{soldier.full_name}</p>
                                    <p className="text-sm text-gray-500">{soldier.rank_name} - {soldier.unit_name}</p>
                                </div>
                            </div>
                        )) : (
                            <p className="text-center text-gray-500 py-10">Prajurit tidak ditemukan.</p>
                        )}
                    </div>
                </ScrollArea>
            </DialogContent>
        </Dialog>
    );
}
