'use client';

import { useState, useEffect } from 'react';
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

// Import server actions
import { getFullUsersData, upsertUser, deleteUser } from '@/actions/admin/accounts/users_actions';
import { getRanks, addRank, updateRank, deleteRank } from '@/actions/admin/accounts/rank_actions';
import { getUnits, addUnit, updateUnit, deleteUnit } from '@/actions/admin/accounts/unit_actions';

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
                                            <TableHead>Status</TableHead>
                                            <TableHead className="text-right">Aksi</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {users.map((user) => (
                                            <TableRow key={user.id}>
                                                <TableCell className="font-medium whitespace-nowrap">{user.full_name}</TableCell>
                                                <TableCell>{user.email}</TableCell>
                                                <TableCell>{getRoleBadge(user.role)}</TableCell>
                                                <TableCell className="whitespace-nowrap">{user.unit_name}</TableCell>
                                                <TableCell>{user.rank_name}</TableCell>
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
    const [formData, setFormData] = useState({});
    const [isSubmitting, setIsSubmitting] = useState(false);

    useEffect(() => {
        if (editingUser) {
            setFormData(editingUser);
        } else {
            setFormData({ full_name: '', email: '', password: '', role: '', unit_id: '', rank_id: '', is_active: true });
        }
    }, [editingUser, isOpen]);

    const handleOpenChange = (open) => {
        if (!open) {
            setEditingUser(null);
            setFormData({ full_name: '', email: '', password: '', role: '', unit_id: '', rank_id: '', is_active: true });
        }
        setIsOpen(open);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsSubmitting(true);

        const result = await upsertUser(editingUser?.id, formData);

        if (result.success) {
            toast.success(result.message);
            onFinished(); // Re-fetch data on parent
            handleOpenChange(false);
        } else {
            toast.error(result.message);
        }
        setIsSubmitting(false);
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
                <form onSubmit={handleSubmit}>
                    <div className="grid gap-4 py-4">
                        <div className="grid grid-cols-4 items-center gap-4">
                            <Label htmlFor="name" className="text-right">Nama</Label>
                            <Input id="name" value={formData.full_name || ''} onChange={(e) => setFormData({ ...formData, full_name: e.target.value })} className="col-span-3" />
                        </div>
                        <div className="grid grid-cols-4 items-center gap-4">
                            <Label htmlFor="email" className="text-right">Email</Label>
                            <Input id="email" type="email" value={formData.email || ''} onChange={(e) => setFormData({ ...formData, email: e.target.value })} className="col-span-3" />
                        </div>
                        <div className="grid grid-cols-4 items-center gap-4">
                            <Label htmlFor="password" className="text-right">Password</Label>
                            <Input id="password" type="password" placeholder={editingUser ? 'Kosongkan jika tidak ganti' : ''} onChange={(e) => setFormData({ ...formData, password: e.target.value })} className="col-span-3" />
                        </div>
                        <div className="grid grid-cols-4 items-center gap-4">
                            <Label htmlFor="role" className="text-right">Role</Label>
                            <Select value={formData.role || ''} onValueChange={(value) => setFormData({ ...formData, role: value })}>
                                <SelectTrigger className="col-span-3">
                                    <SelectValue placeholder="Pilih role" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="admin">Admin</SelectItem>
                                    <SelectItem value="prajurit">Prajurit</SelectItem>
                                    <SelectItem value="komandan">Komandan</SelectItem>
                                    <SelectItem value="medis">Medis</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="grid grid-cols-4 items-center gap-4">
                            <Label htmlFor="unit" className="text-right">Unit</Label>
                            <Select value={String(formData.unit_id || '')} onValueChange={(value) => setFormData({ ...formData, unit_id: parseInt(value) })}>
                                <SelectTrigger className="col-span-3">
                                    <SelectValue placeholder="Pilih unit" />
                                </SelectTrigger>
                                <SelectContent>
                                    {units.map(unit => <SelectItem key={unit.id} value={String(unit.id)}>{unit.name}</SelectItem>)}
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="grid grid-cols-4 items-center gap-4">
                            <Label htmlFor="rank" className="text-right">Pangkat</Label>
                            <Select value={String(formData.rank_id || '')} onValueChange={(value) => setFormData({ ...formData, rank_id: parseInt(value) })}>
                                <SelectTrigger className="col-span-3">
                                    <SelectValue placeholder="Pilih pangkat" />
                                </SelectTrigger>
                                <SelectContent>
                                    {ranks.map(rank => <SelectItem key={rank.id} value={String(rank.id)}>{rank.name}</SelectItem>)}
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="flex items-center space-x-2">
                            <Switch id="is_active" checked={formData.is_active} onCheckedChange={(checked) => setFormData({ ...formData, is_active: checked })} />
                            <Label htmlFor="is_active">Aktif</Label>
                        </div>
                    </div>
                    <DialogFooter>
                        <Button type="submit" disabled={isSubmitting}>
                            {isSubmitting ? 'Menyimpan...' : 'Simpan'}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}

function UnitFormDialog({ isOpen, setIsOpen, editingUnit, setEditingUnit, onFinished }) {
    const [name, setName] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);

    useEffect(() => {
        setName(editingUnit ? editingUnit.name : '');
    }, [editingUnit, isOpen]);

    const handleOpenChange = (open) => {
        if (!open) {
            setEditingUnit(null);
            setName('');
        }
        setIsOpen(open);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsSubmitting(true);

        const result = editingUnit
            ? await updateUnit(editingUnit.id, name)
            : await addUnit(name);

        if (result.success) {
            toast.success(result.message);
            onFinished();
            handleOpenChange(false);
        } else {
            toast.error(result.message);
        }
        setIsSubmitting(false);
    };

    return (
        <Dialog open={isOpen} onOpenChange={handleOpenChange}>
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle>{editingUnit ? 'Edit Unit' : 'Tambah Unit Baru'}</DialogTitle>
                </DialogHeader>
                <form onSubmit={handleSubmit}>
                    <div className="grid gap-4 py-4">
                        <div className="grid grid-cols-4 items-center gap-4">
                            <Label htmlFor="unit-name" className="text-right">Nama Unit</Label>
                            <Input id="unit-name" value={name} onChange={(e) => setName(e.target.value)} className="col-span-3" />
                        </div>
                    </div>
                    <DialogFooter>
                        <Button type="submit" disabled={isSubmitting}>{isSubmitting ? 'Menyimpan...' : 'Simpan'}</Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}

function RankFormDialog({ isOpen, setIsOpen, editingRank, setEditingRank, onFinished }) {
    const [name, setName] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);

    useEffect(() => {
        setName(editingRank ? editingRank.name : '');
    }, [editingRank, isOpen]);

    const handleOpenChange = (open) => {
        if (!open) {
            setEditingRank(null);
            setName('');
        }
        setIsOpen(open);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsSubmitting(true);

        const result = editingRank
            ? await updateRank(editingRank.id, name)
            : await addRank(name);

        if (result.success) {
            toast.success(result.message);
            onFinished();
            handleOpenChange(false);
        } else {
            toast.error(result.message);
        }
        setIsSubmitting(false);
    };

    return (
        <Dialog open={isOpen} onOpenChange={handleOpenChange}>
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle>{editingRank ? 'Edit Pangkat' : 'Tambah Pangkat Baru'}</DialogTitle>
                </DialogHeader>
                <form onSubmit={handleSubmit}>
                    <div className="grid gap-4 py-4">
                        <div className="grid grid-cols-4 items-center gap-4">
                            <Label htmlFor="rank-name" className="text-right">Nama Pangkat</Label>
                            <Input id="rank-name" value={name} onChange={(e) => setName(e.target.value)} className="col-span-3" />
                        </div>
                    </div>
                    <DialogFooter>
                        <Button type="submit" disabled={isSubmitting}>{isSubmitting ? 'Menyimpan...' : 'Simpan'}</Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
} 