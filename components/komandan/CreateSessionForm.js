'use client';
import { useState, useEffect } from "react";
import { Button } from "@/components/Shadcn/button";
import { Input } from "@/components/Shadcn/input";
import { Textarea } from "@/components/Shadcn/textarea";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/Shadcn/tabs";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/Shadcn/card";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/Shadcn/avatar";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/Shadcn/dialog';
import Image from 'next/image';
import { toast } from "sonner";
import { createSessionAction, updateSessionAction } from "@/actions/komandan/sessions_actions";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/Shadcn/popover";
import { Calendar } from "@/components/Shadcn/calendar";
import { Label } from "@/components/Shadcn/label";
import { ChevronDownIcon } from "lucide-react";

export default function CreateSessionForm({ komandan, prajurit, medis, locations, initialData }) {
    const [form, setForm] = useState({
        name: "",
        description: "",
        scheduled_at: "",
        location_id: "",
        commanders: [],
        participants: [],
        medics: [],
    });
    const [loading, setLoading] = useState(false);
    const [showLocationModal, setShowLocationModal] = useState(false);
    const [selectedLocation, setSelectedLocation] = useState(null);
    const [date, setDate] = useState(null);
    const [time, setTime] = useState("");
    const [open, setOpen] = useState(false);

    useEffect(() => {
        if (initialData) {
            setForm({
                name: initialData.name || "",
                description: initialData.description || "",
                scheduled_at: initialData.scheduled_at || "",
                location_id: initialData.location?.id ? String(initialData.location.id) : "",
                commanders: (initialData.commanders || []).map(u => u.id),
                participants: (initialData.participants || []).map(u => u.id),
                medics: (initialData.medics || []).map(u => u.id),
            });
            setSelectedLocation(initialData.location || null);

            // Set date & time untuk input Shadcn
            if (initialData.scheduled_at) {
                const dt = new Date(initialData.scheduled_at);
                setDate(dt);
                setTime(dt.toISOString().slice(11, 16)); // "HH:mm"
            }
        }
    }, [initialData]);

    useEffect(() => {
        if (date && time) {
            const [hours, minutes] = time.split(":");
            const scheduled = new Date(date);
            scheduled.setHours(Number(hours));
            scheduled.setMinutes(Number(minutes));
            scheduled.setSeconds(0);
            setForm(f => ({
                ...f,
                scheduled_at: scheduled.toISOString(),
            }));
        }
    }, [date, time]);

    // Handler multi-select
    const handleMultiSelect = (role, id) => {
        setForm(f => {
            const arr = f[role];
            return {
                ...f,
                [role]: arr.includes(id) ? arr.filter(x => x !== id) : [...arr, id]
            };
        });
    };

    // Handler pilih lokasi
    const handleSelectLocation = (loc) => {
        setSelectedLocation(loc);
        setShowLocationModal(false);
        setForm(f => ({
            ...f,
            location_id: String(loc.id),
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        let res;
        if (initialData && initialData.id) {
            // Mode edit
            res = await updateSessionAction(initialData.id, form);
        } else {
            // Mode insert
            res = await createSessionAction(form);
        }
        if (res.success) {
            toast.success(initialData && initialData.id ? "Sesi latihan berhasil diupdate!" : "Sesi latihan berhasil dibuat!");
            setForm({
                name: "",
                description: "",
                scheduled_at: "",
                location_id: "",
                commanders: [],
                participants: [],
                medics: [],
            });
            setSelectedLocation(null);
        } else {
            toast.error(res.message || "Gagal menyimpan sesi latihan");
        }
        setLoading(false);
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-4">
            <Input
                placeholder="Nama Sesi"
                value={form.name}
                onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                required
            />
            <Textarea
                placeholder="Deskripsi"
                value={form.description}
                onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
                required
            />
            <div className="flex gap-4">
                <div className="flex flex-col gap-3">
                    <Label htmlFor="date-picker" className="px-1">
                        Tanggal
                    </Label>
                    <Popover open={open} onOpenChange={setOpen}>
                        <PopoverTrigger asChild>
                            <Button
                                variant="outline"
                                id="date-picker"
                                className="w-32 justify-between font-normal"
                            >
                                {date ? date.toLocaleDateString() : "Pilih tanggal"}
                                <ChevronDownIcon />
                            </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto overflow-hidden p-0" align="start">
                            <Calendar
                                mode="single"
                                selected={date}
                                captionLayout="dropdown"
                                onSelect={(d) => {
                                    setDate(d);
                                    setOpen(false);
                                }}
                            />
                        </PopoverContent>
                    </Popover>
                </div>
                <div className="flex flex-col gap-3">
                    <Label htmlFor="time-picker" className="px-1">
                        Waktu
                    </Label>
                    <Input
                        type="time"
                        id="time-picker"
                        step="1"
                        value={time}
                        onChange={e => setTime(e.target.value)}
                        className="bg-background appearance-none [&::-webkit-calendar-picker-indicator]:hidden [&::-webkit-calendar-picker-indicator]:appearance-none"
                        required
                    />
                </div>
            </div>
            {/* Pilih Lokasi */}
            <div>
                <label className="font-semibold">Lokasi Latihan</label>
                <div
                    className="border rounded-lg p-2 flex items-center gap-4 cursor-pointer hover:border-blue-500 bg-white"
                    onClick={() => setShowLocationModal(true)}
                    style={{ minHeight: 80 }}
                >
                    {selectedLocation ? (
                        <>
                            <Image
                                src={selectedLocation.map_image_url}
                                width={80}
                                height={80}
                                alt={selectedLocation.name}
                                className="rounded object-cover w-20 h-20"
                            />
                            <div>
                                <div className="font-semibold">{selectedLocation.name}</div>
                                <div className="text-xs text-gray-500">{selectedLocation.description}</div>
                                <div className="text-xs text-gray-400">
                                    Lat: {selectedLocation.latitude}, Lng: {selectedLocation.longitude}
                                </div>
                            </div>
                        </>
                    ) : (
                        <span className="text-gray-400">Klik untuk pilih lokasi latihan...</span>
                    )}
                </div>
            </div>
            {/* Modal Pilih Lokasi */}
            <Dialog open={showLocationModal} onOpenChange={setShowLocationModal}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Pilih Lokasi Latihan</DialogTitle>
                    </DialogHeader>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {locations.map(loc => (
                            <Card
                                key={loc.id}
                                className="cursor-pointer hover:border-blue-500"
                                onClick={() => handleSelectLocation(loc)}
                            >
                                <CardHeader>
                                    <CardTitle>{loc.name}</CardTitle>
                                    <CardDescription>{loc.description}</CardDescription>
                                </CardHeader>
                                <CardContent>
                                    <Image src={loc.map_image_url} width={500} height={500} alt={loc.name} className="w-full h-32 object-cover rounded mb-2" />
                                    <div className="text-xs text-gray-500">Lat: {loc.latitude}, Lng: {loc.longitude}</div>
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                </DialogContent>
            </Dialog>
            {/* Pilih Peserta */}
            <div>
                <label className="font-semibold">Pilih Peserta Sesi</label>
                <Tabs defaultValue="komandan" className="w-full mt-2">
                    <TabsList>
                        <TabsTrigger value="komandan">Komandan</TabsTrigger>
                        <TabsTrigger value="prajurit">Prajurit</TabsTrigger>
                        <TabsTrigger value="medis">Medis</TabsTrigger>
                    </TabsList>
                    <TabsContent value="komandan">
                        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 mt-2">
                            {komandan.map(u => (
                                <Card
                                    key={u.id}
                                    className={`cursor-pointer border-2 ${form.commanders.includes(u.id) ? "border-blue-500" : "border-transparent"}`}
                                    onClick={() => handleMultiSelect("commanders", u.id)}
                                >
                                    <CardContent className="flex flex-col items-center p-4">
                                        <Avatar className="w-16 h-16 mb-2">
                                            <AvatarImage src={u.avatar} alt={u.full_name} />
                                            <AvatarFallback>{u.full_name?.charAt(0)}</AvatarFallback>
                                        </Avatar>
                                        <div className="font-bold">{u.full_name}</div>
                                        <div className="text-xs text-gray-500">{u.email}</div>
                                        <div className="text-xs mt-1">Tinggi: {u.height_cm ?? "-"} cm | Berat: {u.weight_kg ?? "-"} kg</div>
                                        <div className="text-xs">Pangkat: {u.rank_name ?? "-"}</div>
                                        <div className="text-xs">Unit: {u.unit_name ?? "-"}</div>
                                    </CardContent>
                                </Card>
                            ))}
                            {komandan.length === 0 && <span className="text-gray-400">Tidak ada komandan luang</span>}
                        </div>
                    </TabsContent>
                    <TabsContent value="prajurit">
                        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 mt-2">
                            {prajurit.map(u => (
                                <Card
                                    key={u.id}
                                    className={`cursor-pointer border-2 ${form.participants.includes(u.id) ? "border-blue-500" : "border-transparent"}`}
                                    onClick={() => handleMultiSelect("participants", u.id)}
                                >
                                    <CardContent className="flex flex-col items-center p-4">
                                        <Avatar className="w-16 h-16 mb-2">
                                            <AvatarImage src={u.avatar} alt={u.full_name} />
                                            <AvatarFallback>{u.full_name?.charAt(0)}</AvatarFallback>
                                        </Avatar>
                                        <div className="font-bold">{u.full_name}</div>
                                        <div className="text-xs text-gray-500">{u.email}</div>
                                        <div className="text-xs mt-1">Tinggi: {u.height_cm ?? "-"} cm | Berat: {u.weight_kg ?? "-"} kg</div>
                                        <div className="text-xs">Pangkat: {u.rank_name ?? "-"}</div>
                                        <div className="text-xs">Unit: {u.unit_name ?? "-"}</div>
                                    </CardContent>
                                </Card>
                            ))}
                            {prajurit.length === 0 && <span className="text-gray-400">Tidak ada prajurit luang</span>}
                        </div>
                    </TabsContent>
                    <TabsContent value="medis">
                        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 mt-2">
                            {medis.map(u => (
                                <Card
                                    key={u.id}
                                    className={`cursor-pointer border-2 ${form.medics.includes(u.id) ? "border-blue-500" : "border-transparent"}`}
                                    onClick={() => handleMultiSelect("medics", u.id)}
                                >
                                    <CardContent className="flex flex-col items-center p-4">
                                        <Avatar className="w-16 h-16 mb-2">
                                            <AvatarImage src={u.avatar} alt={u.full_name} />
                                            <AvatarFallback>{u.full_name?.charAt(0)}</AvatarFallback>
                                        </Avatar>
                                        <div className="font-bold">{u.full_name}</div>
                                        <div className="text-xs text-gray-500">{u.email}</div>
                                        <div className="text-xs mt-1">Tinggi: {u.height_cm ?? "-"} cm | Berat: {u.weight_kg ?? "-"} kg</div>
                                        <div className="text-xs">Pangkat: {u.rank_name ?? "-"}</div>
                                        <div className="text-xs">Unit: {u.unit_name ?? "-"}</div>
                                    </CardContent>
                                </Card>
                            ))}
                            {medis.length === 0 && <span className="text-gray-400">Tidak ada medis luang</span>}
                        </div>
                    </TabsContent>
                </Tabs>
            </div>
            <Button type="submit" disabled={loading}>
                {loading
                    ? "Menyimpan..."
                    : (initialData && initialData.id ? "Update Data Latihan" : "Buat Sesi Latihan")
                }
            </Button>
        </form>
    );
}