// components/medis/MedisForm.js
'use client';

import { useState, useMemo, useEffect } from 'react';
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
import { Stethoscope, User, BookHeart, PlusCircle, Search } from 'lucide-react';
import { saveMedicalRecord, getMedicalRecordsByUserId } from '@/actions/medis/medical_record';
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/Shadcn/form";

const medicalRecordSchema = z.object({
    generalCondition: z.string().nonempty("Kondisi umum harus diisi."),
    notes: z.string().optional(),
    weight: z.coerce.number().positive("Berat badan harus angka positif."),
    height: z.coerce.number().positive("Tinggi badan harus angka positif."),
    bloodPressure: z.string().regex(/^\d{2,3}\/\d{2,3}$/, "Format tekanan darah tidak valid (misal: 120/80)."),
    pulse: z.coerce.number().positive("Denyut nadi harus angka positif."),
    temperature: z.coerce.number().optional(),
    glucose: z.coerce.number().optional(),
    cholesterol: z.coerce.number().optional(),
    hemoglobin: z.coerce.number().optional(),
    otherDiseases: z.string().optional(),
});

const initialFormData = {
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

export default function MedisForm({ soldiers, currentMedic }) {
    const [medicalRecords, setMedicalRecords] = useState([]);
    const [selectedSoldier, setSelectedSoldier] = useState(null);
    const [isSoldierPickerOpen, setIsSoldierPickerOpen] = useState(false);

    const form = useForm({
        resolver: zodResolver(medicalRecordSchema),
        defaultValues: {
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
            otherDiseases: 'Tidak ada',
        },
    });

    // Fetch riwayat medis dari database setiap kali prajurit dipilih
    useEffect(() => {
        if (selectedSoldier) {
            (async () => {
                const res = await fetch(`/api/medical-records?userId=${selectedSoldier.id}`);
                const data = await res.json();
                setMedicalRecords(data.records || []);
            })();
        } else {
            setMedicalRecords([]);
        }
    }, [selectedSoldier]);

    const handleSoldierSelect = (soldier) => {
        setSelectedSoldier(soldier);
        form.reset();
        setIsSoldierPickerOpen(false);
        // Fetch otomatis di useEffect
    };

    const calculateBMI = () => {
        const weight = form.watch("weight");
        const height = form.watch("height");
        if (weight && height) {
            const heightInMeters = height / 100;
            return (weight / (heightInMeters * heightInMeters)).toFixed(1);
        }
        return 'N/A';
    };

    const onSubmit = async (values) => {
        if (!selectedSoldier) {
            toast.error("Silakan pilih prajurit terlebih dahulu.");
            return;
        }

        const result = await saveMedicalRecord({
            ...values,
            userId: selectedSoldier.id,
            examinerId: currentMedic.id,
        });

        if (result.success) {
            toast.success(`Rekam medis untuk ${selectedSoldier.full_name} berhasil disimpan.`);
            form.reset();
            // Fetch ulang riwayat medis setelah insert
            getMedicalRecordsByUserId(selectedSoldier.id).then(res => {
                if (res.success) setMedicalRecords(res.records);
            });
        } else {
            toast.error(result.message || "Gagal menyimpan rekam medis.");
        }
    };

    return (
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
                        <Form {...form}>
                            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                                <div>
                                    <Label className="text-base font-semibold">Prajurit yang Diperiksa</Label>
                                    <div className="flex items-center gap-4 mt-2">
                                        <Button type="button" variant="outline" onClick={() => setIsSoldierPickerOpen(true)} className="flex-1 justify-start text-left font-normal">
                                            {selectedSoldier ? (
                                                <div className="flex items-center gap-2">
                                                    <Avatar className="h-6 w-6">
                                                        <AvatarImage src={selectedSoldier.avatar} />
                                                        <AvatarFallback>{selectedSoldier.full_name.split(' ').map(n => n[0]).join('')}</AvatarFallback>
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
                                                <FormField control={form.control} name="weight" render={({ field }) => (
                                                    <FormItem>
                                                        <FormControl><Input id="weight" type="number" {...field} /></FormControl>
                                                        <FormMessage />
                                                    </FormItem>
                                                )} />
                                            </div>
                                            <div>
                                                <Label htmlFor="height">Tinggi (cm)</Label>
                                                <FormField control={form.control} name="height" render={({ field }) => (
                                                    <FormItem>
                                                        <FormControl><Input id="height" type="number" {...field} /></FormControl>
                                                        <FormMessage />
                                                    </FormItem>
                                                )} />
                                            </div>
                                        </div>
                                        <div>
                                            <Label>Indeks Massa Tubuh (IMT)</Label>
                                            <Input value={calculateBMI()} disabled className="mt-1 bg-gray-100" />
                                        </div>
                                        <div>
                                            <Label htmlFor="bloodPressure">Tekanan Darah (mmHg)</Label>
                                            <FormField control={form.control} name="bloodPressure" render={({ field }) => (
                                                <FormItem>
                                                    <FormControl><Input id="bloodPressure" {...field} placeholder="cth: 120/80" /></FormControl>
                                                    <FormMessage />
                                                </FormItem>
                                            )} />
                                        </div>
                                        <div>
                                            <Label htmlFor="pulse">Denyut Nadi (bpm)</Label>
                                            <FormField control={form.control} name="pulse" render={({ field }) => (
                                                <FormItem>
                                                    <FormControl><Input id="pulse" type="number" {...field} /></FormControl>
                                                    <FormMessage />
                                                </FormItem>
                                            )} />
                                        </div>
                                        <div>
                                            <Label htmlFor="temperature">Suhu (°C)</Label>
                                            <FormField control={form.control} name="temperature" render={({ field }) => (
                                                <FormItem>
                                                    <FormControl><Input id="temperature" type="number" step="0.1" {...field} /></FormControl>
                                                    <FormMessage />
                                                </FormItem>
                                            )} />
                                        </div>
                                    </div>
                                    <div className="space-y-4 p-4 border rounded-lg">
                                        <h3 className="font-semibold text-lg">Data Lab & Kondisi</h3>
                                        <div className="grid grid-cols-2 gap-4">
                                            <div>
                                                <Label htmlFor="glucose">Gula Darah (mg/dL)</Label>
                                                <FormField control={form.control} name="glucose" render={({ field }) => (
                                                    <FormItem>
                                                        <FormControl><Input id="glucose" type="number" {...field} /></FormControl>
                                                        <FormMessage />
                                                    </FormItem>
                                                )} />
                                            </div>
                                            <div>
                                                <Label htmlFor="cholesterol">Kolesterol (mg/dL)</Label>
                                                <FormField control={form.control} name="cholesterol" render={({ field }) => (
                                                    <FormItem>
                                                        <FormControl><Input id="cholesterol" type="number" {...field} /></FormControl>
                                                        <FormMessage />
                                                    </FormItem>
                                                )} />
                                            </div>
                                        </div>
                                        <div>
                                            <Label htmlFor="hemoglobin">Hemoglobin (g/dL)</Label>
                                            <FormField control={form.control} name="hemoglobin" render={({ field }) => (
                                                <FormItem>
                                                    <FormControl><Input id="hemoglobin" type="number" step="0.1" {...field} /></FormControl>
                                                    <FormMessage />
                                                </FormItem>
                                            )} />
                                        </div>
                                        <div>
                                            <Label htmlFor="generalCondition">Kondisi Umum</Label>
                                            <FormField control={form.control} name="generalCondition" render={({ field }) => (
                                                <FormItem>
                                                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                                                        <SelectTrigger id="generalCondition" className="mt-1">
                                                            <SelectValue placeholder="Pilih kondisi" />
                                                        </SelectTrigger>
                                                        <SelectContent>
                                                            <SelectItem value="Baik">Baik</SelectItem>
                                                            <SelectItem value="Cukup">Cukup</SelectItem>
                                                            <SelectItem value="Kurang">Kurang</SelectItem>
                                                        </SelectContent>
                                                    </Select>
                                                    <FormMessage />
                                                </FormItem>
                                            )} />
                                        </div>
                                        <div>
                                            <Label htmlFor="otherDiseases">Riwayat Penyakit Lain</Label>
                                            <FormField control={form.control} name="otherDiseases" render={({ field }) => (
                                                <FormItem>
                                                    <FormControl><Input id="otherDiseases" {...field} /></FormControl>
                                                    <FormMessage />
                                                </FormItem>
                                            )} />
                                        </div>
                                    </div>
                                    <div className="md:col-span-2">
                                        <Label htmlFor="notes">Catatan Pemeriksaan</Label>
                                        <FormField control={form.control} name="notes" render={({ field }) => (
                                            <FormItem>
                                                <FormControl><Textarea id="notes" {...field} rows={4} placeholder="Tulis catatan tambahan di sini..." /></FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )} />
                                    </div>
                                </div>
                                <div className="flex justify-end">
                                    <Button type="submit" size="lg" disabled={!selectedSoldier || form.formState.isSubmitting}>
                                        {form.formState.isSubmitting ? "Menyimpan..." : "Simpan Catatan"}
                                    </Button>
                                </div>
                            </form>
                        </Form>
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
                                    <AvatarFallback className="text-2xl">{selectedSoldier.full_name.split(' ').map(n => n[0]).join('')}</AvatarFallback>
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
                            {medicalRecords.length > 0 ? medicalRecords.map(record => {
                                // Hitung IMT jika data ada
                                let bmi = 'N/A';
                                if (record.weight_kg && record.height_cm) {
                                    const heightM = record.height_cm / 100;
                                    bmi = (record.weight_kg / (heightM * heightM)).toFixed(1);
                                }
                                return (
                                    <div key={record.id} className="p-3 border rounded-md text-sm bg-white dark:bg-zinc-900 shadow-sm">
                                        {/* Bagian Data Pemeriksaan */}
                                        <div className="mb-2">
                                            <p className="font-semibold text-base text-blue-700 dark:text-blue-300">
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

                                        {/* Bagian Data Vital */}
                                        <div className="mb-2">
                                            <p className="font-semibold text-sm text-green-700 dark:text-green-300 mb-1">Data Vital</p>
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

                                        {/* Bagian Data Lab */}
                                        <div className="mb-2">
                                            <p className="font-semibold text-sm text-purple-700 dark:text-purple-300 mb-1">Data Lab</p>
                                            <div className="grid grid-cols-2 md:grid-cols-3 gap-x-4 gap-y-1">
                                                <span><strong>Gula Darah:</strong> {record.glucose ?? '-'} mg/dL</span>
                                                <span><strong>Kolesterol:</strong> {record.cholesterol ?? '-'} mg/dL</span>
                                                <span><strong>Hemoglobin:</strong> {record.hemoglobin ?? '-'} g/dL</span>
                                            </div>
                                        </div>
                                        <Separator className="my-2" />

                                        {/* Bagian Riwayat Penyakit Lain */}
                                        <div>
                                            <p className="font-semibold text-sm text-red-700 dark:text-red-300 mb-1">Riwayat Penyakit Lain</p>
                                            <span>{record.other_diseases ?? '-'}</span>
                                        </div>
                                    </div>
                                );
                            }).reverse() : (
                                <p className="text-center text-gray-500 py-8">Belum ada riwayat pemeriksaan.</p>
                            )}
                        </div>
                    </CardContent>
                </Card>
            </aside>
        </main>
    );
}

// Komponen dialog pemilih prajurit
function SoldierPickerDialog({ isOpen, setIsOpen, onSoldierSelect, soldiers }) {
    const [filterUnit, setFilterUnit] = useState('');
    const [filterRank, setFilterRank] = useState('');
    const [searchTerm, setSearchTerm] = useState('');

    // Dummy data unit dan pangkat, bisa diambil dari props jika perlu
    const units = useMemo(() => [
        { id: '1', name: 'Unit A' },
        { id: '2', name: 'Unit B' }
    ], []);
    const ranks = useMemo(() => [
        { id: '1', name: 'Letda' },
        { id: '2', name: 'Serda' }
    ], []);

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
                                    <AvatarFallback>{soldier.full_name.split(' ').map(n => n[0]).join('')}</AvatarFallback>
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