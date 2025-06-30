'use client';

import { useState } from 'react';
import { DUMMY_USERS, DUMMY_UNITS, DUMMY_RANKS, getFullUsersData } from '@/lib/admin-dummy-data';
import { Button } from '@/components/Shadcn/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/Shadcn/card';
import { Input } from '@/components/Shadcn/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/Shadcn/table';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/Shadcn/tabs';
import { Badge } from '@/components/Shadcn/badge';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/Shadcn/dialog';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/Shadcn/alert-dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/Shadcn/select';
import { Label } from '@/components/Shadcn/label';
import { Switch } from '@/components/Shadcn/switch';
import { UserPlus, Plus, Edit, Trash2 } from 'lucide-react';
import { toast } from "sonner";

// Main component for account management
export default function AccountsPage() {
    const [users, setUsers] = useState(getFullUsersData());
    const [units, setUnits] = useState(DUMMY_UNITS);
    const [ranks, setRanks] = useState(DUMMY_RANKS);
    
    // States for dialogs
    const [isUserFormOpen, setIsUserFormOpen] = useState(false);
    const [isUnitFormOpen, setIsUnitFormOpen] = useState(false);
    const [isRankFormOpen, setIsRankFormOpen] = useState(false);
    
    // States for editing
    const [editingUser, setEditingUser] = useState(null);
    const [editingUnit, setEditingUnit] = useState(null);
    const [editingRank, setEditingRank] = useState(null);

    // Handlers for User
    const handleEditUserClick = (user) => {
        setEditingUser(user);
        setIsUserFormOpen(true);
    };

    const handleDeleteUser = (userId) => {
        setUsers(users.filter(u => u.id !== userId));
        toast.success("Pengguna berhasil dihapus.");
    };

    // Handlers for Unit
    const handleEditUnitClick = (unit) => {
        setEditingUnit(unit);
        setIsUnitFormOpen(true);
    };

    const handleDeleteUnit = (unitId) => {
        // Add check if unit is in use
        const isUnitInUse = users.some(user => user.unit_id === unitId);
        if (isUnitInUse) {
            toast.error("Unit tidak dapat dihapus karena masih digunakan oleh pengguna.");
            return;
        }
        setUnits(units.filter(u => u.id !== unitId));
        toast.success("Unit berhasil dihapus.");
    };
    
    // Handlers for Rank
    const handleEditRankClick = (rank) => {
        setEditingRank(rank);
        setIsRankFormOpen(true);
    };

    const handleDeleteRank = (rankId) => {
         // Add check if rank is in use
        const isRankInUse = users.some(user => user.rank_id === rankId);
        if (isRankInUse) {
            toast.error("Pangkat tidak dapat dihapus karena masih digunakan oleh pengguna.");
            return;
        }
        setRanks(ranks.filter(r => r.id !== rankId));
        toast.success("Pangkat berhasil dihapus.");
    };

    const getRoleBadge = (role) => {
        switch (role) {
            case 'prajurit': return <Badge variant="default">Prajurit</Badge>;
            case 'komandan': return <Badge variant="destructive">Komandan</Badge>;
            case 'medis': return <Badge variant="outline">Medis</Badge>;
            default: return <Badge variant="secondary">{role}</Badge>;
        }
    };

    const getStatusBadge = (isActive) => isActive ?
        <Badge variant="default" className="bg-green-500">Aktif</Badge> :
        <Badge variant="destructive">Non-aktif</Badge>;

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-2xl md:text-3xl font-bold tracking-tight">Manajemen Akun</h1>
                <p className="text-gray-500 dark:text-gray-400">Kelola pengguna, unit, dan pangkat dalam sistem.</p>
            </div>
            
            {/* User Form Dialog */}
            <UserFormDialog 
                isOpen={isUserFormOpen} 
                setIsOpen={setIsUserFormOpen}
                editingUser={editingUser}
                setEditingUser={setEditingUser}
                users={users}
                setUsers={setUsers}
                units={units}
                ranks={ranks}
            />

            {/* Unit Form Dialog */}
            <UnitFormDialog 
                isOpen={isUnitFormOpen}
                setIsOpen={setIsUnitFormOpen}
                editingUnit={editingUnit}
                setEditingUnit={setEditingUnit}
                units={units}
                setUnits={setUnits}
            />

             {/* Rank Form Dialog */}
            <RankFormDialog
                isOpen={isRankFormOpen}
                setIsOpen={setIsRankFormOpen}
                editingRank={editingRank}
                setEditingRank={setEditingRank}
                ranks={ranks}
                setRanks={setRanks}
            />

            <Tabs defaultValue="accounts" className="w-full">
                <TabsList className="grid w-full grid-cols-1 sm:grid-cols-3 h-auto sm:h-10">
                    <TabsTrigger value="accounts">Kelola Akun</TabsTrigger>
                    <TabsTrigger value="units">Kelola Unit</TabsTrigger>
                    <TabsTrigger value="ranks">Kelola Pangkat</TabsTrigger>
                </TabsList>
                
                {/* Accounts Tab */}
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
                
                {/* Units Tab */}
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
                                            <TableHead>Tanggal Dibuat</TableHead>
                                            <TableHead className="text-right">Aksi</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {units.map((unit) => (
                                            <TableRow key={unit.id}>
                                                <TableCell>{unit.id}</TableCell>
                                                <TableCell className="font-medium whitespace-nowrap">{unit.name}</TableCell>
                                                <TableCell>{unit.created_at}</TableCell>
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

                {/* Ranks Tab */}
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
                                            <TableHead>Tanggal Dibuat</TableHead>
                                            <TableHead className="text-right">Aksi</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {ranks.map((rank) => (
                                            <TableRow key={rank.id}>
                                                <TableCell>{rank.id}</TableCell>
                                                <TableCell className="font-medium whitespace-nowrap">{rank.name}</TableCell>
                                                <TableCell>{rank.created_at}</TableCell>
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

// Reusable Delete Confirmation Dialog
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

// User Form Component
function UserFormDialog({ isOpen, setIsOpen, editingUser, setEditingUser, users, setUsers, units, ranks }) {
    const [formData, setFormData] = useState({});

    useState(() => {
        if (editingUser) {
            setFormData(editingUser);
        } else {
            setFormData({ full_name: '', role: '', unit_id: '', rank_id: '', is_active: true });
        }
    }, [editingUser]);

    const handleOpenChange = (open) => {
        if (!open) {
            setEditingUser(null);
            setFormData({ full_name: '', role: '', unit_id: '', rank_id: '', is_active: true });
        }
        setIsOpen(open);
    };
    
    const handleSubmit = (e) => {
        e.preventDefault();
        // Validation
        if (!formData.full_name || !formData.role || !formData.unit_id || !formData.rank_id) {
            toast.error("Harap isi semua kolom yang diperlukan.");
            return;
        }

        if (editingUser) {
            // Edit user
            const updatedUsers = users.map(u => u.id === editingUser.id ? { ...u, ...formData } : u);
            setUsers(updatedUsers);
            toast.success("Pengguna berhasil diperbarui.");
        } else {
            // Add new user
            const newUser = {
                id: `USR${Math.floor(Math.random() * 900) + 100}`,
                ...formData,
                avatar: `https://i.pravatar.cc/150?u=a042581f4e29026704d`
            };
            setUsers([...users, newUser]);
            toast.success("Pengguna baru berhasil ditambahkan.");
        }
        handleOpenChange(false);
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
                        <Input id="name" value={formData.full_name || ''} onChange={(e) => setFormData({...formData, full_name: e.target.value})} className="col-span-3" />
                    </div>
                     <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="role" className="text-right">Role</Label>
                        <Select value={formData.role || ''} onValueChange={(value) => setFormData({...formData, role: value})}>
                             <SelectTrigger className="col-span-3">
                                <SelectValue placeholder="Pilih role" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="prajurit">Prajurit</SelectItem>
                                <SelectItem value="komandan">Komandan</SelectItem>
                                <SelectItem value="medis">Medis</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                    <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="unit" className="text-right">Unit</Label>
                        <Select value={String(formData.unit_id || '')} onValueChange={(value) => setFormData({...formData, unit_id: parseInt(value)})}>
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
                        <Select value={String(formData.rank_id || '')} onValueChange={(value) => setFormData({...formData, rank_id: parseInt(value)})}>
                             <SelectTrigger className="col-span-3">
                                <SelectValue placeholder="Pilih pangkat" />
                            </SelectTrigger>
                            <SelectContent>
                                {ranks.map(rank => <SelectItem key={rank.id} value={String(rank.id)}>{rank.name}</SelectItem>)}
                            </SelectContent>
                        </Select>
                    </div>
                    <div className="flex items-center space-x-2">
                        <Switch id="is_active" checked={formData.is_active} onCheckedChange={(checked) => setFormData({...formData, is_active: checked})} />
                        <Label htmlFor="is_active">Aktif</Label>
                    </div>
                </div>
                <DialogFooter>
                    <Button type="submit">Simpan</Button>
                </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}


// Unit Form Component
function UnitFormDialog({ isOpen, setIsOpen, editingUnit, setEditingUnit, units, setUnits }) {
    const [name, setName] = useState('');

    useState(() => {
        setName(editingUnit ? editingUnit.name : '');
    }, [editingUnit]);
    
    const handleOpenChange = (open) => {
        if (!open) {
            setEditingUnit(null);
            setName('');
        }
        setIsOpen(open);
    };
    
    const handleSubmit = (e) => {
        e.preventDefault();
        if (!name.trim()) {
            toast.error("Nama unit tidak boleh kosong.");
            return;
        }

        if (editingUnit) {
            const updatedUnits = units.map(u => u.id === editingUnit.id ? { ...u, name } : u);
            setUnits(updatedUnits);
            toast.success("Unit berhasil diperbarui.");
        } else {
            const newUnit = { id: Math.max(...units.map(u => u.id)) + 1, name, created_at: new Date().toLocaleDateString('id-ID') };
            setUnits([...units, newUnit]);
            toast.success("Unit baru berhasil ditambahkan.");
        }
        handleOpenChange(false);
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
                        <Button type="submit">Simpan</Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}

// Rank Form Component
function RankFormDialog({ isOpen, setIsOpen, editingRank, setEditingRank, ranks, setRanks }) {
    const [name, setName] = useState('');

    useState(() => {
        setName(editingRank ? editingRank.name : '');
    }, [editingRank]);

    const handleOpenChange = (open) => {
        if (!open) {
            setEditingRank(null);
            setName('');
        }
        setIsOpen(open);
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        if (!name.trim()) {
            toast.error("Nama pangkat tidak boleh kosong.");
            return;
        }

        if (editingRank) {
            const updatedRanks = ranks.map(r => r.id === editingRank.id ? { ...r, name } : r);
            setRanks(updatedRanks);
            toast.success("Pangkat berhasil diperbarui.");
        } else {
            const newRank = { id: Math.max(...ranks.map(r => r.id)) + 1, name, created_at: new Date().toLocaleDateString('id-ID') };
            setRanks([...ranks, newRank]);
            toast.success("Pangkat baru berhasil ditambahkan.");
        }
        handleOpenChange(false);
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
                        <Button type="submit">Simpan</Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
} 