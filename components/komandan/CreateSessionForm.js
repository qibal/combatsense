'use client';
import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
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
import { getAvailableUsersByRole } from "@/actions/komandan/sessions_actions";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/Shadcn/popover";
import { Calendar } from "@/components/Shadcn/calendar";
import { Label } from "@/components/Shadcn/label";
import { ChevronDownIcon } from "lucide-react";
import { useRouter } from 'next/navigation';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/Shadcn/form";

const formSchema = z.object({
    name: z.string().min(3, { message: "Nama sesi minimal 3 karakter." }),
    description: z.string().min(1, { message: "Deskripsi minimal 10 karakter." }),
    scheduled_at: z.string().nonempty({ message: "Tanggal dan waktu harus diisi." }),
    location_id: z.string().nonempty({ message: "Lokasi latihan harus dipilih." }),
    commanders: z.array(z.number()).min(0, { message: "Pilih minimal nol komandan." }),
    participants: z.array(z.number()).min(0, { message: "Pilih minimal nol prajurit." }),
    medics: z.array(z.number()).min(0, { message: "Pilih minimal nol medis." }),
});


export default function CreateSessionForm({ komandan, prajurit, medis, locations, initialData }) {
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    const [showLocationModal, setShowLocationModal] = useState(false);
    const [selectedLocation, setSelectedLocation] = useState(null);
    const [date, setDate] = useState(null);
    const [time, setTime] = useState("");
    const [open, setOpen] = useState(false);
    const [availableKomandan, setAvailableKomandan] = useState([]);
    const [availablePrajurit, setAvailablePrajurit] = useState([]);
    const [availableMedis, setAvailableMedis] = useState([]);

    const form = useForm({
        resolver: zodResolver(formSchema),
        defaultValues: {
            name: "",
            description: "",
            scheduled_at: "",
            location_id: "",
            commanders: [],
            participants: [],
            medics: [],
        },
    });

    useEffect(() => {
        if (initialData) {
            form.reset({
                name: initialData.name || "",
                description: initialData.description || "",
                scheduled_at: initialData.scheduled_at || "",
                location_id: initialData.location?.id ? String(initialData.location.id) : "",
                commanders: (initialData.commanders || []).map(u => u.id),
                participants: (initialData.participants || []).map(u => u.id),
                medics: (initialData.medics || []).map(u => u.id),
            });
            setSelectedLocation(initialData.location || null);
            if (initialData.scheduled_at) {
                const dt = new Date(initialData.scheduled_at);
                setDate(dt);
                setTime(dt.toISOString().slice(11, 16));
            }
        }
    }, [initialData, form]);

    useEffect(() => {
        if (date && time) {
            const [hours, minutes] = time.split(":");
            const scheduled = new Date(date);
            scheduled.setHours(Number(hours));
            scheduled.setMinutes(Number(minutes));
            scheduled.setSeconds(0);
            const scheduledAt = scheduled.toISOString();
            form.setValue("scheduled_at", scheduledAt);
            fetchAvailableUsers(scheduledAt, initialData?.id); // Teruskan initialData.id di sini
        }
    }, [date, time, form, initialData?.id]); // Tambahkan initialData.id ke dependency array

    const fetchAvailableUsers = async (scheduledAt, excludeSessionId = null) => {
        try {
            const [komandanData, prajuritData, medisData] = await Promise.all([
                getAvailableUsersByRole("komandan", scheduledAt, excludeSessionId),
                getAvailableUsersByRole("prajurit", scheduledAt, excludeSessionId),
                getAvailableUsersByRole("medis", scheduledAt, excludeSessionId)
            ]);
            setAvailableKomandan(komandanData);
            setAvailablePrajurit(prajuritData);
            setAvailableMedis(medisData);
        } catch (error) {
            console.error('Error fetching available users:', error);
        }
    };

    const handleMultiSelect = (role, id) => {
        const currentValues = form.getValues(role);
        const newValues = currentValues.includes(id)
            ? currentValues.filter(x => x !== id)
            : [...currentValues, id];
        form.setValue(role, newValues, { shouldValidate: true });
    };

    const handleSelectLocation = (loc) => {
        setSelectedLocation(loc);
        setShowLocationModal(false);
        form.setValue("location_id", String(loc.id), { shouldValidate: true });
    };

    const onSubmit = async (values) => {
        setLoading(true);
        let res;
        if (initialData && initialData.id) {
            res = await updateSessionAction(initialData.id, values);
        } else {
            res = await createSessionAction(values);
        }
        if (res.success) {
            toast.success(initialData && initialData.id ? "Sesi latihan berhasil diupdate!" : "Sesi latihan berhasil dibuat!");
            form.reset();
            setSelectedLocation(null);
            setDate(null);
            setTime("");
            // Pastikan selalu redirect ke /komandan setelah sukses, baik insert maupun update
            router.push('/komandan');
        } else {
            if (res.message && res.message.includes('sudah memiliki sesi latihan')) {
                toast.error(res.message + " Silakan pilih waktu yang berbeda atau hapus sesi yang konflik.");
            } else {
                toast.error(res.message || "Gagal menyimpan sesi latihan");
            }
        }
        setLoading(false);
    };

    return (
        <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <FormField
                    control={form.control}
                    name="name"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Nama Sesi</FormLabel>
                            <FormControl>
                                <Input placeholder="Nama Sesi" {...field} />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />
                <FormField
                    control={form.control}
                    name="description"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Deskripsi</FormLabel>
                            <FormControl>
                                <Textarea placeholder="Deskripsi" {...field} />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />

                <FormField
                    control={form.control}
                    name="scheduled_at"
                    render={({ field }) => (
                        <FormItem>
                            <div className="flex gap-4">
                                <div className="flex flex-col gap-3">
                                    <Label htmlFor="date-picker" className="px-1">Tanggal</Label>
                                    <Popover open={open} onOpenChange={setOpen}>
                                        <PopoverTrigger asChild>
                                            <Button variant="outline" id="date-picker" className="w-32 justify-between font-normal">
                                                {date ? date.toLocaleDateString() : "Pilih tanggal"}
                                                <ChevronDownIcon />
                                            </Button>
                                        </PopoverTrigger>
                                        <PopoverContent className="w-auto overflow-hidden p-0" align="start">
                                            <Calendar mode="single" selected={date} captionLayout="dropdown" onSelect={(d) => { setDate(d); setOpen(false); }} />
                                        </PopoverContent>
                                    </Popover>
                                </div>
                                <div className="flex flex-col gap-3">
                                    <Label htmlFor="time-picker" className="px-1">Waktu</Label>
                                    <Input type="time" id="time-picker" step="1" value={time} onChange={e => setTime(e.target.value)} className="bg-background appearance-none [&::-webkit-calendar-picker-indicator]:hidden [&::-webkit-calendar-picker-indicator]:appearance-none" />
                                </div>
                            </div>
                            <FormMessage />
                        </FormItem>
                    )}
                />

                <FormField
                    control={form.control}
                    name="location_id"
                    render={({ field }) => (
                        <FormItem>
                            <label className="font-semibold">Lokasi Latihan</label>
                            <div className="border rounded-lg p-2 flex items-center gap-4 cursor-pointer hover:border-blue-500 bg-white" onClick={() => setShowLocationModal(true)} style={{ minHeight: 80 }}>
                                {selectedLocation ? (
                                    <>
                                        <Image src={selectedLocation.map_image_url} width={80} height={80} alt={selectedLocation.name} className="rounded object-cover w-20 h-20" />
                                        <div>
                                            <div className="font-semibold">{selectedLocation.name}</div>
                                            <div className="text-xs text-gray-500">{selectedLocation.description}</div>
                                            <div className="text-xs text-gray-400">Lat: {selectedLocation.latitude}, Lng: {selectedLocation.longitude}</div>
                                        </div>
                                    </>
                                ) : (<span className="text-gray-400">Klik untuk pilih lokasi latihan...</span>)}
                            </div>
                            <FormMessage />
                        </FormItem>
                    )}
                />

                <Dialog open={showLocationModal} onOpenChange={setShowLocationModal}>
                    <DialogContent>
                        <DialogHeader><DialogTitle>Pilih Lokasi Latihan</DialogTitle></DialogHeader>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {locations.map(loc => (<Card key={loc.id} className="cursor-pointer hover:border-blue-500" onClick={() => handleSelectLocation(loc)}>
                                <CardHeader>
                                    <CardTitle>{loc.name}</CardTitle>
                                    <CardDescription>{loc.description}</CardDescription>
                                </CardHeader>
                                <CardContent>
                                    <Image src={loc.map_image_url} width={500} height={500} alt={loc.name} className="w-full h-32 object-cover rounded mb-2" />
                                    <div className="text-xs text-gray-500">Lat: {loc.latitude}, Lng: {loc.longitude}</div>
                                </CardContent>
                            </Card>))}
                        </div>
                    </DialogContent>
                </Dialog>

                <div>
                    <label className="font-semibold">Pilih Peserta Sesi</label>
                    {date && time && (<p className="text-sm text-blue-600 mb-2">Menampilkan user yang senggang pada {new Date(form.getValues("scheduled_at")).toLocaleString("id-ID")}</p>)}
                    <Tabs defaultValue="komandan" className="w-full mt-2">
                        <TabsList>
                            <TabsTrigger value="komandan">Komandan</TabsTrigger>
                            <TabsTrigger value="prajurit">Prajurit</TabsTrigger>
                            <TabsTrigger value="medis">Medis</TabsTrigger>
                        </TabsList>
                        <TabsContent value="komandan">
                            <FormField control={form.control} name="commanders" render={() => (<FormItem>
                                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 mt-2">
                                    {availableKomandan.map(u => (<Card key={u.id} className={`cursor-pointer border-2 ${form.getValues("commanders").includes(u.id) ? "border-blue-500" : "border-transparent"}`} onClick={() => handleMultiSelect("commanders", u.id)}>
                                        <CardContent className="flex flex-col items-center p-4">
                                            <Avatar className="w-16 h-16 mb-2">
                                                <AvatarImage src={u.avatar} alt={u.full_name} />
                                                <AvatarFallback>{u.full_name?.charAt(0)}</AvatarFallback>
                                            </Avatar>
                                            <div className="font-bold">{u.full_name}</div>
                                            <div className="text-xs text-gray-500">{u.email}</div>
                                        </CardContent>
                                    </Card>))}
                                    {availableKomandan.length === 0 && <span className="text-gray-400">Tidak ada komandan senggang di waktu ini</span>}
                                </div>
                                <FormMessage />
                            </FormItem>)} />
                        </TabsContent>
                        <TabsContent value="prajurit">
                            <FormField control={form.control} name="participants" render={() => (<FormItem>
                                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 mt-2">
                                    {availablePrajurit.map(u => (<Card key={u.id} className={`cursor-pointer border-2 ${form.getValues("participants").includes(u.id) ? "border-blue-500" : "border-transparent"}`} onClick={() => handleMultiSelect("participants", u.id)}>
                                        <CardContent className="flex flex-col items-center p-4">
                                            <Avatar className="w-16 h-16 mb-2">
                                                <AvatarImage src={u.avatar} alt={u.full_name} />
                                                <AvatarFallback>{u.full_name?.charAt(0)}</AvatarFallback>
                                            </Avatar>
                                            <div className="font-bold">{u.full_name}</div>
                                            <div className="text-xs text-gray-500">{u.email}</div>
                                        </CardContent>
                                    </Card>))}
                                    {availablePrajurit.length === 0 && <span className="text-gray-400">Tidak ada prajurit senggang di waktu ini</span>}
                                </div>
                                <FormMessage />
                            </FormItem>)} />
                        </TabsContent>
                        <TabsContent value="medis">
                            <FormField control={form.control} name="medics" render={() => (<FormItem>
                                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 mt-2">
                                    {availableMedis.map(u => (<Card key={u.id} className={`cursor-pointer border-2 ${form.getValues("medics").includes(u.id) ? "border-blue-500" : "border-transparent"}`} onClick={() => handleMultiSelect("medics", u.id)}>
                                        <CardContent className="flex flex-col items-center p-4">
                                            <Avatar className="w-16 h-16 mb-2">
                                                <AvatarImage src={u.avatar} alt={u.full_name} />
                                                <AvatarFallback>{u.full_name?.charAt(0)}</AvatarFallback>
                                            </Avatar>
                                            <div className="font-bold">{u.full_name}</div>
                                            <div className="text-xs text-gray-500">{u.email}</div>
                                        </CardContent>
                                    </Card>))}
                                    {availableMedis.length === 0 && <span className="text-gray-400">Tidak ada medis senggang di waktu ini</span>}
                                </div>
                                <FormMessage />
                            </FormItem>)} />
                        </TabsContent>
                    </Tabs>
                </div>

                <Button type="submit" disabled={loading}>
                    {loading ? "Menyimpan..." : (initialData && initialData.id ? "Update Data Latihan" : "Buat Sesi Latihan")}
                </Button>
            </form>
        </Form>
    );
}