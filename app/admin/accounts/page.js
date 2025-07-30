'use client';

import { useState, useEffect } from 'react';
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button } from '@/components/Shadcn/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/Shadcn/card';
import { Input } from '@/components/Shadcn/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/Shadcn/table';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/Shadcn/tabs';
import { Badge } from '@/components/Shadcn/badge';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/Shadcn/dialog';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/Shadcn/alert-dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/Shadcn/select';
import { Label } from '@/components/Shadcn/label';
import { Switch } from '@/components/Shadcn/switch';
import { UserPlus, Plus, Edit, Trash2 } from 'lucide-react';
import { toast } from "sonner";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/Shadcn/form";

// Import server actions
import { getFullUsersData, upsertUser, deleteUser } from '@/actions/admin/accounts/users_actions';
import { getRanks, addRank, updateRank, deleteRank } from '@/actions/admin/accounts/rank_actions';
import { getUnits, addUnit, updateUnit, deleteUnit } from '@/actions/admin/accounts/unit_actions';

// Skema validasi
const userFormSchema = z.object({
    full_name: z.string().min(3, "Nama lengkap minimal 3 karakter."),
    email: z.string().email("Format email tidak valid."),
    password: z.string().optional(),
    role: z.enum(["admin", "prajurit", "komandan", "medis"], { required_error: "Role harus dipilih." }),
    unit_id: z.coerce.number().positive({ message: "Unit harus dipilih." }),
    rank_id: z.coerce.number().positive({ message: "Pangkat harus dipilih." }),
    birth_date: z.string().optional(),
    is_active: z.boolean(),
});

// Skema validasi untuk Unit
const unitFormSchema = z.object({
    name: z.string().min(1, "Nama unit tidak boleh kosong."),
});

// Skema validasi untuk Rank
const rankFormSchema = z.object({
    name: z.string().min(1, "Nama pangkat tidak boleh kosong."),
});

// Main component for account management
export default function AccountsPage() {
    const [users, setUsers] = useState([]);
    const [units, setUnits] = useState([]);
    const [ranks, setRanks] = useState([]);
    const [loading, setLoading] = useState(true);

    // States for dialogs
    const [isUserFormOpen, setIsUserFormOpen] = useState(false);
    const [isUnitFormOpen, setIsUnitFormOpen] = useState(false);
    const [isRankFormOpen, setIsRankFormOpen] = useState(false);

    // States for editing
    const [editingUser, setEditingUser] = useState(null);
    const [editingUnit, setEditingUnit] = useState(null);
    const [editingRank, setEditingRank] = useState(null);

    // State filter
    const [filterRank, setFilterRank] = useState('');
    const [filterUnit, setFilterUnit] = useState('');
    const [filterLetter, setFilterLetter] = useState('');
    const [showYoungest, setShowYoungest] = useState(false);
    const [showOldest, setShowOldest] = useState(false);

    // Tambahkan state untuk dropdown dummy role
    const [dummyRole, setDummyRole] = useState('prajurit');

    // Filtered users
    let filteredUsers = users;
    if (filterRank) filteredUsers = filteredUsers.filter(u => String(u.rank_id) === String(filterRank));
    if (filterUnit) filteredUsers = filteredUsers.filter(u => String(u.unit_id) === String(filterUnit));
    if (filterLetter) filteredUsers = filteredUsers.filter(u => (u.full_name || '').toUpperCase().startsWith(filterLetter));
    if (showYoungest) {
        const youngest = divideAndConquerAge(filteredUsers, 'youngest');
        filteredUsers = youngest ? [youngest] : [];
    }
    if (showOldest) {
        const oldest = divideAndConquerAge(filteredUsers, 'oldest');
        filteredUsers = oldest ? [oldest] : [];
    }

    // Fetch initial data
    async function fetchData() {
        setLoading(true);
        const [usersRes, unitsRes, ranksRes] = await Promise.all([
            getFullUsersData(),
            getUnits(),
            getRanks()
        ]);
        if (usersRes.success) setUsers(usersRes.data);
        else toast.error(usersRes.message);

        if (unitsRes.success) setUnits(unitsRes.data);
        else toast.error(unitsRes.message);

        if (ranksRes.success) setRanks(ranksRes.data);
        else toast.error(ranksRes.message);

        setLoading(false);
    }

    useEffect(() => {
        fetchData();
    }, []);

    // Handlers for User
    const handleEditUserClick = (user) => {
        setEditingUser(user);
        setIsUserFormOpen(true);
    };

    const handleDeleteUser = async (userId) => {
        const result = await deleteUser(userId);
        if (result.success) {
            toast.success(result.message);
            setUsers(prev => prev.filter(u => u.id !== userId));
        } else {
            toast.error(result.message);
        }
    };

    // Handlers for Unit
    const handleEditUnitClick = (unit) => {
        setEditingUnit(unit);
        setIsUnitFormOpen(true);
    };

    const handleDeleteUnit = async (unitId) => {
        const result = await deleteUnit(unitId);
        if (result.success) {
            toast.success(result.message);
            setUnits(prev => prev.filter(u => u.id !== unitId));
        } else {
            toast.error(result.message);
        }
    };

    // Handlers for Rank
    const handleEditRankClick = (rank) => {
        setEditingRank(rank);
        setIsRankFormOpen(true);
    };

    const handleDeleteRank = async (rankId) => {
        const result = await deleteRank(rankId);
        if (result.success) {
            toast.success(result.message);
            setRanks(prev => prev.filter(r => r.id !== rankId));
        } else {
            toast.error(result.message);
        }
    };

    const getRoleBadge = (role) => {
        switch (role) {
            case 'prajurit': return <Badge variant="default">Prajurit</Badge>;
            case 'komandan': return <Badge variant="destructive">Komandan</Badge>;
            case 'medis': return <Badge variant="outline">Medis</Badge>;
            case 'admin': return <Badge variant="secondary">Admin</Badge>;
            default: return <Badge variant="secondary">{role}</Badge>;
        }
    };

    const getStatusBadge = (isActive) => isActive ?
        <Badge variant="default" className="bg-green-500">Aktif</Badge> :
        <Badge variant="destructive">Non-aktif</Badge>;

    if (loading) {
        return <div>Memuat data...</div>;
    }

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-2xl md:text-3xl font-bold tracking-tight">Manajemen Akun</h1>
                <p className="text-gray-500 dark:text-gray-400">Kelola pengguna, unit, dan pangkat dalam sistem.</p>
            </div>

            {/* FILTER BAR */}
            <div className="flex flex-wrap gap-2 items-center mb-2">
                <span className="font-semibold">Filter:</span>
                {/* Filter huruf A-Z */}
                <div className="flex gap-1">
                    {[...Array(26)].map((_, i) => {
                        const letter = String.fromCharCode(65 + i);
                        return (
                            <Button key={letter} size="sm" variant={filterLetter === letter ? 'default' : 'outline'} onClick={() => setFilterLetter(filterLetter === letter ? '' : letter)}>{letter}</Button>
                        );
                    })}
                </div>
                {/* Filter pangkat */}
                <Select value={filterRank} onValueChange={v => setFilterRank(v === 'all' ? '' : v)}>
                    <SelectTrigger className="w-32"><SelectValue placeholder="Pangkat" /></SelectTrigger>
                    <SelectContent>
                        <SelectItem value="all">Semua Pangkat</SelectItem>
                        {ranks.map(r => <SelectItem key={r.id} value={String(r.id)}>{r.name}</SelectItem>)}
                    </SelectContent>
                </Select>
                {/* Filter unit */}
                <Select value={filterUnit} onValueChange={v => setFilterUnit(v === 'all' ? '' : v)}>
                    <SelectTrigger className="w-32"><SelectValue placeholder="Unit" /></SelectTrigger>
                    <SelectContent>
                        <SelectItem value="all">Semua Unit</SelectItem>
                        {units.map(u => <SelectItem key={u.id} value={String(u.id)}>{u.name}</SelectItem>)}
                    </SelectContent>
                </Select>
                {/* Filter usia termuda/tertua */}
                <Button size="sm" variant={showYoungest ? 'default' : 'outline'} onClick={() => { setShowYoungest(!showYoungest); setShowOldest(false); }}>Usia Termuda</Button>
                <Button size="sm" variant={showOldest ? 'default' : 'outline'} onClick={() => { setShowOldest(!showOldest); setShowYoungest(false); }}>Usia Tertua</Button>
                {/* Reset filter */}
                <Button size="sm" variant="ghost" onClick={() => { setFilterRank(''); setFilterUnit(''); setFilterLetter(''); setShowYoungest(false); setShowOldest(false); }}>Reset</Button>
                {/* Tombol tambah dummy user
                <Select value={dummyRole} onValueChange={setDummyRole}>
                    <SelectTrigger className="w-32"><SelectValue placeholder="Role Dummy" /></SelectTrigger>
                    <SelectContent>
                        <SelectItem value="prajurit">Prajurit</SelectItem>
                        <SelectItem value="komandan">Komandan</SelectItem>
                        <SelectItem value="medis">Medis</SelectItem>
                    </SelectContent>
                </Select>
                <Button size="sm" variant="default" onClick={async () => {
                    const res = await insertDummyUser(dummyRole);
                    toast[res.success ? 'success' : 'error'](res.message);
                    if (res.success) fetchData();
                }}>Tambah Dummy User</Button> */}
            </div>
            {/* END FILTER BAR */}

            <UserFormDialog
                isOpen={isUserFormOpen}
                setIsOpen={setIsUserFormOpen}
                editingUser={editingUser}
                setEditingUser={setEditingUser}
                units={units}
                ranks={ranks}
                onFinished={fetchData}
            />

            <UnitFormDialog
                isOpen={isUnitFormOpen}
                setIsOpen={setIsUnitFormOpen}
                editingUnit={editingUnit}
                setEditingUnit={setEditingUnit}
                onFinished={fetchData}
            />

            <RankFormDialog
                isOpen={isRankFormOpen}
                setIsOpen={setIsRankFormOpen}
                editingRank={editingRank}
                setEditingRank={setEditingRank}
                onFinished={fetchData}
            />

            <Tabs defaultValue="accounts" className="w-full">
                <TabsList className="grid w-full grid-cols-1 sm:grid-cols-3 h-auto sm:h-10">
                    <TabsTrigger value="accounts">Kelola Akun</TabsTrigger>
                    <TabsTrigger value="units">Kelola Unit</TabsTrigger>
                    <TabsTrigger value="ranks">Kelola Pangkat</TabsTrigger>
                </TabsList>

                <TabsContent value="accounts" className="mt-4">
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between">
                            <div>
                                <CardTitle>Daftar Pengguna</CardTitle>
                                <CardDescription>Tambah, hapus, atau cari pengguna.</CardDescription>
                            </div>
                            <Button onClick={() => { setEditingUser(null); setIsUserFormOpen(true); }}>
                                <UserPlus className="mr-2 h-4 w-4" /> Tambah Pengguna
                            </Button>
                        </CardHeader>
                        <CardContent>
                            <div className="overflow-x-auto">
                                <Table className="min-w-full">
                                    <TableHeader>
                                        <TableRow>
                                            <TableHead>Nama Lengkap</TableHead>
                                            <TableHead>Email</TableHead>
                                            <TableHead>Role</TableHead>
                                            <TableHead>Unit</TableHead>
                                            <TableHead>Pangkat</TableHead>
                                            <TableHead>Usia</TableHead>
                                            <TableHead>Status</TableHead>
                                            <TableHead className="text-right">Aksi</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {filteredUsers.map((user) => (
                                            <TableRow key={user.id}>
                                                <TableCell className="font-medium whitespace-nowrap">{user.full_name}</TableCell>
                                                <TableCell>{user.email}</TableCell>
                                                <TableCell>{getRoleBadge(user.role)}</TableCell>
                                                <TableCell className="whitespace-nowrap">{user.unit_name}</TableCell>
                                                <TableCell>{user.rank_name}</TableCell>
                                                <TableCell>{user.birth_date ? getAge(user.birth_date) + ' tahun' : '-'}</TableCell>
                                                <TableCell>{getStatusBadge(user.is_active)}</TableCell>
                                                <TableCell className="flex justify-end gap-2">
                                                    <Button variant="outline" size="icon" onClick={() => handleEditUserClick(user)}><Edit className="h-4 w-4" /></Button>
                                                    <DeleteConfirmationDialog onConfirm={() => handleDeleteUser(user.id)} />
                                                </TableCell>
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>

                <TabsContent value="units" className="mt-4">
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between">
                            <div>
                                <CardTitle>Daftar Unit</CardTitle>
                                <CardDescription>Tambah atau hapus unit.</CardDescription>
                            </div>
                            <Button onClick={() => { setEditingUnit(null); setIsUnitFormOpen(true); }}>
                                <Plus className="mr-2 h-4 w-4" /> Tambah Unit
                            </Button>
                        </CardHeader>
                        <CardContent>
                            <div className="overflow-x-auto">
                                <Table className="min-w-full">
                                    <TableHeader>
                                        <TableRow>
                                            <TableHead>ID</TableHead>
                                            <TableHead>Nama Unit</TableHead>
                                            <TableHead className="text-right">Aksi</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {units.map((unit) => (
                                            <TableRow key={unit.id}>
                                                <TableCell>{unit.id}</TableCell>
                                                <TableCell className="font-medium whitespace-nowrap">{unit.name}</TableCell>
                                                <TableCell className="flex justify-end gap-2">
                                                    <Button variant="outline" size="icon" onClick={() => handleEditUnitClick(unit)}><Edit className="h-4 w-4" /></Button>
                                                    <DeleteConfirmationDialog onConfirm={() => handleDeleteUnit(unit.id)} />
                                                </TableCell>
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>

                <TabsContent value="ranks" className="mt-4">
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between">
                            <div>
                                <CardTitle>Daftar Pangkat</CardTitle>
                                <CardDescription>Tambah atau hapus pangkat.</CardDescription>
                            </div>
                            <Button onClick={() => { setEditingRank(null); setIsRankFormOpen(true); }}>
                                <Plus className="mr-2 h-4 w-4" /> Tambah Pangkat
                            </Button>
                        </CardHeader>
                        <CardContent>
                            <div className="overflow-x-auto">
                                <Table className="min-w-full">
                                    <TableHeader>
                                        <TableRow>
                                            <TableHead>ID</TableHead>
                                            <TableHead>Nama Pangkat</TableHead>
                                            <TableHead className="text-right">Aksi</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {ranks.map((rank) => (
                                            <TableRow key={rank.id}>
                                                <TableCell>{rank.id}</TableCell>
                                                <TableCell className="font-medium whitespace-nowrap">{rank.name}</TableCell>
                                                <TableCell className="flex justify-end gap-2">
                                                    <Button variant="outline" size="icon" onClick={() => handleEditRankClick(rank)}><Edit className="h-4 w-4" /></Button>
                                                    <DeleteConfirmationDialog onConfirm={() => handleDeleteRank(rank.id)} />
                                                </TableCell>
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>
            </Tabs>
        </div>
    );
}

function DeleteConfirmationDialog({ onConfirm }) {
    return (
        <AlertDialog>
            <AlertDialogTrigger asChild>
                <Button variant="destructive" size="icon"><Trash2 className="h-4 w-4" /></Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
                <AlertDialogHeader>
                    <AlertDialogTitle>Apakah Anda yakin?</AlertDialogTitle>
                    <AlertDialogDescription>
                        Tindakan ini tidak dapat diurungkan. Ini akan menghapus data secara permanen dari server.
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

function UserFormDialog({ isOpen, setIsOpen, editingUser, setEditingUser, units, ranks, onFinished }) {
    const form = useForm({
        resolver: zodResolver(userFormSchema),
        defaultValues: {
            full_name: '',
            email: '',
            password: '',
            role: '',
            unit_id: '',
            rank_id: '',
            birth_date: '',
            is_active: true
        },
    });

    useEffect(() => {
        if (editingUser) {
            form.reset(editingUser);
        } else {
            form.reset({
                full_name: '', email: '', password: '', role: '',
                unit_id: '', rank_id: '', birth_date: '', is_active: true
            });
        }
    }, [editingUser, isOpen, form]);

    const handleOpenChange = (open) => {
        if (!open) {
            setEditingUser(null);
            form.reset();
        }
        setIsOpen(open);
    };

    const onSubmit = async (values) => {
        const result = await upsertUser(editingUser?.id, values);
        if (result.success) {
            toast.success(result.message);
            onFinished();
            handleOpenChange(false);
        } else {
            toast.error(result.message);
        }
    };

    return (
        <Dialog open={isOpen} onOpenChange={handleOpenChange}>
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle>{editingUser ? 'Edit Pengguna' : 'Tambah Pengguna Baru'}</DialogTitle>
                    <DialogDescription>
                        {editingUser ? 'Perbarui detail pengguna.' : 'Isi detail untuk pengguna baru.'}
                    </DialogDescription>
                </DialogHeader>
                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                        <FormField control={form.control} name="full_name" render={({ field }) => (
                            <FormItem><FormLabel>Nama</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>
                        )} />
                        <FormField control={form.control} name="email" render={({ field }) => (
                            <FormItem><FormLabel>Email</FormLabel><FormControl><Input type="email" {...field} /></FormControl><FormMessage /></FormItem>
                        )} />
                        <FormField control={form.control} name="password" render={({ field }) => (
                            <FormItem><FormLabel>Password</FormLabel><FormControl><Input type="password" placeholder={editingUser ? 'Kosongkan jika tidak ganti' : ''} {...field} /></FormControl><FormMessage /></FormItem>
                        )} />
                        <FormField control={form.control} name="role" render={({ field }) => (
                            <FormItem><FormLabel>Role</FormLabel><Select onValueChange={field.onChange} defaultValue={field.value}>
                                <FormControl><SelectTrigger><SelectValue placeholder="Pilih role" /></SelectTrigger></FormControl>
                                <SelectContent>
                                    <SelectItem value="admin">Admin</SelectItem>
                                    <SelectItem value="prajurit">Prajurit</SelectItem>
                                    <SelectItem value="komandan">Komandan</SelectItem>
                                    <SelectItem value="medis">Medis</SelectItem>
                                </SelectContent>
                            </Select><FormMessage /></FormItem>
                        )} />
                        <FormField control={form.control} name="unit_id" render={({ field }) => (
                            <FormItem><FormLabel>Unit</FormLabel><Select onValueChange={field.onChange} defaultValue={String(field.value)}>
                                <FormControl><SelectTrigger><SelectValue placeholder="Pilih unit" /></SelectTrigger></FormControl>
                                <SelectContent>
                                    {units.map(unit => <SelectItem key={unit.id} value={String(unit.id)}>{unit.name}</SelectItem>)}
                                </SelectContent>
                            </Select><FormMessage /></FormItem>
                        )} />
                        <FormField control={form.control} name="rank_id" render={({ field }) => (
                            <FormItem><FormLabel>Pangkat</FormLabel><Select onValueChange={field.onChange} defaultValue={String(field.value)}>
                                <FormControl><SelectTrigger><SelectValue placeholder="Pilih pangkat" /></SelectTrigger></FormControl>
                                <SelectContent>
                                    {ranks.map(rank => <SelectItem key={rank.id} value={String(rank.id)}>{rank.name}</SelectItem>)}
                                </SelectContent>
                            </Select><FormMessage /></FormItem>
                        )} />
                        <FormField control={form.control} name="birth_date" render={({ field }) => (
                            <FormItem><FormLabel>Tanggal Lahir</FormLabel><FormControl><Input type="date" {...field} /></FormControl><FormMessage /></FormItem>
                        )} />
                        <FormField control={form.control} name="is_active" render={({ field }) => (
                            <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3 shadow-sm">
                                <FormLabel>Status Aktif</FormLabel>
                                <FormControl><Switch checked={field.value} onCheckedChange={field.onChange} /></FormControl>
                            </FormItem>
                        )} />
                        <DialogFooter>
                            <Button type="submit" disabled={form.formState.isSubmitting}>
                                {form.formState.isSubmitting ? 'Menyimpan...' : 'Simpan'}
                            </Button>
                        </DialogFooter>
                    </form>
                </Form>
            </DialogContent>
        </Dialog>
    );
}

function UnitFormDialog({ isOpen, setIsOpen, editingUnit, setEditingUnit, onFinished }) {
    const form = useForm({
        resolver: zodResolver(unitFormSchema),
        defaultValues: { name: '' },
    });

    useEffect(() => {
        if (editingUnit) form.setValue('name', editingUnit.name);
        else form.reset({ name: '' });
    }, [editingUnit, isOpen, form]);

    const handleOpenChange = (open) => {
        if (!open) {
            setEditingUnit(null);
            form.reset();
        }
        setIsOpen(open);
    };

    const onSubmit = async (values) => {
        const result = editingUnit
            ? await updateUnit(editingUnit.id, values.name)
            : await addUnit(values.name);

        if (result.success) {
            toast.success(result.message);
            onFinished();
            handleOpenChange(false);
        } else {
            toast.error(result.message);
        }
    };

    return (
        <Dialog open={isOpen} onOpenChange={handleOpenChange}>
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle>{editingUnit ? 'Edit Unit' : 'Tambah Unit Baru'}</DialogTitle>
                </DialogHeader>
                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                        <FormField control={form.control} name="name" render={({ field }) => (
                            <FormItem>
                                <FormLabel>Nama Unit</FormLabel>
                                <FormControl><Input {...field} /></FormControl>
                                <FormMessage />
                            </FormItem>
                        )} />
                        <DialogFooter>
                            <Button type="submit" disabled={form.formState.isSubmitting}>
                                {form.formState.isSubmitting ? 'Menyimpan...' : 'Simpan'}
                            </Button>
                        </DialogFooter>
                    </form>
                </Form>
            </DialogContent>
        </Dialog>
    );
}

function RankFormDialog({ isOpen, setIsOpen, editingRank, setEditingRank, onFinished }) {
    const form = useForm({
        resolver: zodResolver(rankFormSchema),
        defaultValues: { name: '' },
    });

    useEffect(() => {
        if (editingRank) form.setValue('name', editingRank.name);
        else form.reset({ name: '' });
    }, [editingRank, isOpen, form]);

    const handleOpenChange = (open) => {
        if (!open) {
            setEditingRank(null);
            form.reset();
        }
        setIsOpen(open);
    };

    const onSubmit = async (values) => {
        const result = editingRank
            ? await updateRank(editingRank.id, values.name)
            : await addRank(values.name);

        if (result.success) {
            toast.success(result.message);
            onFinished();
            handleOpenChange(false);
        } else {
            toast.error(result.message);
        }
    };

    return (
        <Dialog open={isOpen} onOpenChange={handleOpenChange}>
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle>{editingRank ? 'Edit Pangkat' : 'Tambah Pangkat Baru'}</DialogTitle>
                </DialogHeader>
                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                        <FormField control={form.control} name="name" render={({ field }) => (
                            <FormItem>
                                <FormLabel>Nama Pangkat</FormLabel>
                                <FormControl><Input {...field} /></FormControl>
                                <FormMessage />
                            </FormItem>
                        )} />
                        <DialogFooter>
                            <Button type="submit" disabled={form.formState.isSubmitting}>
                                {form.formState.isSubmitting ? 'Menyimpan...' : 'Simpan'}
                            </Button>
                        </DialogFooter>
                    </form>
                </Form>
            </DialogContent>
        </Dialog>
    );
}

function getAge(birthDateStr) {
    if (!birthDateStr) return '-';
    const today = new Date();
    const birthDate = new Date(birthDateStr);
    let age = today.getFullYear() - birthDate.getFullYear();
    const m = today.getMonth() - birthDate.getMonth();
    if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
        age--;
    }
    return age;
}

// Divide and conquer untuk mencari user termuda/tertua
function divideAndConquerAge(users, mode = 'youngest') {
    if (!users || users.length === 0) return null;
    if (users.length === 1) return users[0];
    const mid = Math.floor(users.length / 2);
    const left = divideAndConquerAge(users.slice(0, mid), mode);
    const right = divideAndConquerAge(users.slice(mid), mode);
    if (!left) return right;
    if (!right) return left;
    if (!left.birth_date) return right;
    if (!right.birth_date) return left;
    const leftDate = new Date(left.birth_date);
    const rightDate = new Date(right.birth_date);
    if (mode === 'youngest') {
        // Termuda = tanggal lahir paling akhir
        return leftDate > rightDate ? left : right;
    } else {
        // Tertua = tanggal lahir paling awal
        return leftDate < rightDate ? left : right;
    }
} 