import { getAllUsers, createUser, deleteUser, searchUsers } from '@/actions/admin/users_actions';
import { getAllUnits, createUnit, deleteUnit } from '@/actions/admin/unit_actions';
import { getAllRanks, createRank, deleteRank } from '@/actions/admin/rank_actions';
import { Button } from '@/components/Shadcn/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/Shadcn/card';
import { Input } from '@/components/Shadcn/input';
import { Table, TableBody, TableCaption, TableCell, TableHead, TableHeader, TableRow } from '@/components/Shadcn/table';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/Shadcn/tabs';
import { Badge } from '@/components/Shadcn/badge';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/Shadcn/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/Shadcn/select';
import { SidebarProvider, Sidebar, SidebarHeader, SidebarContent, SidebarMenu, SidebarMenuItem, SidebarMenuButton, SidebarFooter, SidebarSeparator, SidebarTrigger } from '@/components/Shadcn/sidebar';
import { Pagination, PaginationContent, PaginationEllipsis, PaginationItem, PaginationLink, PaginationNext, PaginationPrevious } from '@/components/Shadcn/pagination';
import { Label } from '@/components/Shadcn/label';
import { Textarea } from '@/components/Shadcn/textarea';
import {
    Users,
    UserPlus,
    Home,
    CalendarDays,
    ActivitySquare,
    MapPin,
    Settings,
    LogOut,
    Shield,
    AlertTriangle,
    Plus
} from 'lucide-react';
// Perbaikan import pada line 2-3
// Perbaikan import pada line 2-3

import { DynamicUnitSelect, DynamicRankSelect } from '@/components/admin/DynamicSelect';
/**
 * Dashboard Admin Page dengan Dynamic Select untuk Unit dan Pangkat
 */
export default async function AdminDashboardPage({ searchParams }) {
    // Await searchParams untuk Next.js 15+
    const params = await searchParams;
    const query = params?.query || '';
    const page = parseInt(params?.page) || 1;
    const pageSize = 10;

    // Fetch semua data yang diperlukan
    const usersResult = query ? await searchUsers(query) : await getAllUsers();
    const unitsResult = await getAllUnits();
    const ranksResult = await getAllRanks();

    const users = usersResult.success ? usersResult.data : [];
    const units = unitsResult.success ? unitsResult.data : [];
    const ranks = ranksResult.success ? ranksResult.data : [];

    // Pagination logic
    const totalUsers = users.length;
    const totalPages = Math.ceil(totalUsers / pageSize);
    const paginatedUsers = users.slice((page - 1) * pageSize, page * pageSize);

    // Helper functions untuk badge
    const getRoleBadge = (role) => {
        switch (role) {
            case 'prajurit':
                return <Badge variant="default">Prajurit</Badge>;
            case 'komandan':
                return <Badge variant="destructive">Komandan</Badge>;
            case 'medis':
                return <Badge variant="outline">Medis</Badge>;
            default:
                return <Badge variant="secondary">{role}</Badge>;
        }
    };

    const getStatusBadge = (isActive) => {
        return isActive ?
            <Badge variant="success" className="bg-green-500">Aktif</Badge> :
            <Badge variant="destructive">Non-aktif</Badge>;
    };

    return (
        <SidebarProvider>
            <div className="flex h-screen">
                {/* Sidebar - existing code tetap sama */}
                <Sidebar>
                    <SidebarHeader>
                        <div className="flex items-center gap-2 px-2">
                            <Shield className="h-6 w-6" />
                            <h2 className="text-lg font-bold tracking-tight">CombatSense</h2>
                        </div>
                        <SidebarTrigger className="absolute right-2 top-2 md:hidden" />
                    </SidebarHeader>

                    <SidebarContent>
                        <SidebarMenu>
                            <SidebarMenuItem>
                                <SidebarMenuButton isActive={false} tooltip="Dashboard">
                                    <Home className="mr-2" />
                                    <span>Dashboard</span>
                                </SidebarMenuButton>
                            </SidebarMenuItem>

                            <SidebarMenuItem>
                                <SidebarMenuButton isActive={true} tooltip="Kelola Account">
                                    <Users className="mr-2" />
                                    <span>Kelola Account</span>
                                </SidebarMenuButton>
                            </SidebarMenuItem>

                            <SidebarMenuItem>
                                <SidebarMenuButton isActive={false} tooltip="Sesi Pelatihan">
                                    <CalendarDays className="mr-2" />
                                    <span>Sesi Pelatihan</span>
                                </SidebarMenuButton>
                            </SidebarMenuItem>

                            <SidebarMenuItem>
                                <SidebarMenuButton isActive={false} tooltip="Monitoring">
                                    <ActivitySquare className="mr-2" />
                                    <span>Monitoring</span>
                                </SidebarMenuButton>
                            </SidebarMenuItem>

                            <SidebarMenuItem>
                                <SidebarMenuButton isActive={false} tooltip="Peta Gerakan">
                                    <MapPin className="mr-2" />
                                    <span>Peta Gerakan</span>
                                </SidebarMenuButton>
                            </SidebarMenuItem>
                        </SidebarMenu>
                    </SidebarContent>

                    <SidebarSeparator />

                    <SidebarFooter>
                        <SidebarMenu>
                            <SidebarMenuItem>
                                <SidebarMenuButton tooltip="Settings">
                                    <Settings className="mr-2" />
                                    <span>Settings</span>
                                </SidebarMenuButton>
                            </SidebarMenuItem>

                            <SidebarMenuItem>
                                <SidebarMenuButton tooltip="Logout">
                                    <LogOut className="mr-2" />
                                    <span>Logout</span>
                                </SidebarMenuButton>
                            </SidebarMenuItem>
                        </SidebarMenu>
                    </SidebarFooter>
                </Sidebar>

                {/* Main Content */}
                <main className="flex-1 overflow-auto p-6">
                    <div className="flex items-center justify-between mb-6">
                        <h1 className="text-3xl font-bold">Dashboard Admin</h1>
                    </div>

                    <Tabs defaultValue="accounts" className="mb-6">
                        <TabsList>
                            <TabsTrigger value="accounts">Kelola Account</TabsTrigger>
                            <TabsTrigger value="units">Kelola Unit</TabsTrigger>
                            <TabsTrigger value="ranks">Kelola Pangkat</TabsTrigger>
                            <TabsTrigger value="overview">Overview</TabsTrigger>
                        </TabsList>

                        {/* Tab Account Management */}
                        <TabsContent value="accounts">
                            <Card>
                                <CardHeader>
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <CardTitle>Daftar Account</CardTitle>
                                            <CardDescription>Kelola semua account pengguna CombatSense.</CardDescription>
                                        </div>
                                        <Dialog>
                                            <DialogTrigger asChild>
                                                <Button className="flex items-center gap-1">
                                                    <UserPlus className="h-4 w-4" />
                                                    Tambah User
                                                </Button>
                                            </DialogTrigger>
                                            <DialogContent className="max-w-2xl">
                                                <DialogHeader>
                                                    <DialogTitle>Tambah User Baru</DialogTitle>
                                                    <DialogDescription>
                                                        Isi form berikut untuk membuat akun baru. Pilih unit dan pangkat yang tersedia atau buat yang baru.
                                                    </DialogDescription>
                                                </DialogHeader>

                                                {/* Form tambah user dengan dynamic select */}
                                                <form action={createUser} className="space-y-4">
                                                    <div className="grid grid-cols-2 gap-4">
                                                        <div className="grid gap-2">
                                                            <Label htmlFor="username">Username</Label>
                                                            <Input id="username" name="username" placeholder="Masukan username" required />
                                                        </div>

                                                        <div className="grid gap-2">
                                                            <Label htmlFor="password">Password</Label>
                                                            <Input id="password" name="password" type="password" placeholder="Masukan password" required />
                                                        </div>
                                                    </div>

                                                    <div className="grid gap-2">
                                                        <Label htmlFor="full_name">Nama Lengkap</Label>
                                                        <Input id="full_name" name="full_name" placeholder="Masukan nama lengkap" required />
                                                    </div>

                                                    <div className="grid gap-2">
                                                        <Label htmlFor="role">Role</Label>
                                                        <Select name="role" defaultValue="prajurit">
                                                            <SelectTrigger>
                                                                <SelectValue placeholder="Pilih role" />
                                                            </SelectTrigger>
                                                            <SelectContent>
                                                                <SelectItem value="prajurit">Prajurit</SelectItem>
                                                                <SelectItem value="komandan">Komandan</SelectItem>
                                                                <SelectItem value="medis">Tim Medis</SelectItem>
                                                            </SelectContent>
                                                        </Select>
                                                    </div>
                                                    <DynamicUnitSelect units={units} name="unit_id" />
                                                    <DynamicRankSelect ranks={ranks} name="rank_id" />

                                                    <DialogFooter>
                                                        <Button type="submit">Simpan User</Button>
                                                    </DialogFooter>
                                                </form>
                                            </DialogContent>
                                        </Dialog>
                                    </div>
                                </CardHeader>

                                <CardContent>
                                    {/* Search Form - existing code tetap sama */}
                                    <div className="mb-4 flex items-center gap-2">
                                        <form className="flex w-full max-w-sm items-center gap-2" action="">
                                            <Input
                                                name="query"
                                                placeholder="Cari username, nama, atau unit..."
                                                defaultValue={query}
                                            />
                                            <Button type="submit">Cari</Button>
                                        </form>
                                        {query && (
                                            <Button variant="outline" onClick={() => window.location.href = "/admin"}>
                                                Reset
                                            </Button>
                                        )}
                                    </div>

                                    {/* Users Table - existing code tetap sama */}
                                    {users.length > 0 ? (
                                        <Table>
                                            <TableCaption>Total {totalUsers} akun pengguna</TableCaption>
                                            <TableHeader>
                                                <TableRow>
                                                    <TableHead>ID</TableHead>
                                                    <TableHead>Username</TableHead>
                                                    <TableHead>Nama Lengkap</TableHead>
                                                    <TableHead>Role</TableHead>
                                                    <TableHead>Unit</TableHead>
                                                    <TableHead>Pangkat</TableHead>
                                                    <TableHead>Status</TableHead>
                                                    <TableHead className="text-right">Aksi</TableHead>
                                                </TableRow>
                                            </TableHeader>
                                            <TableBody>
                                                {paginatedUsers.map((user) => (
                                                    <TableRow key={user.user_id}>
                                                        <TableCell>{user.user_id}</TableCell>
                                                        <TableCell>{user.username}</TableCell>
                                                        <TableCell>{user.full_name}</TableCell>
                                                        <TableCell>{getRoleBadge(user.role)}</TableCell>
                                                        <TableCell>{user.unit_name || '-'}</TableCell>
                                                        <TableCell>{user.rank_name || '-'}</TableCell>
                                                        <TableCell>{getStatusBadge(user.is_active)}</TableCell>
                                                        <TableCell className="flex justify-end gap-2">
                                                            <Button variant="outline" size="sm">
                                                                Edit
                                                            </Button>
                                                            <form action={deleteUser}>
                                                                <input type="hidden" name="id" value={user.user_id} />
                                                                <Button variant="destructive" size="sm" type="submit">
                                                                    Hapus
                                                                </Button>
                                                            </form>
                                                        </TableCell>
                                                    </TableRow>
                                                ))}
                                            </TableBody>
                                        </Table>
                                    ) : (
                                        <div className="flex flex-col items-center justify-center py-10 text-center">
                                            <AlertTriangle className="h-10 w-10 text-yellow-500 mb-2" />
                                            <h3 className="text-lg font-medium">Tidak ada data user</h3>
                                            <p className="text-sm text-gray-500">
                                                {query ? `Tidak ada hasil untuk pencarian "${query}"` : 'Belum ada data user yang tersedia'}
                                            </p>
                                        </div>
                                    )}
                                </CardContent>

                                {/* Pagination - existing code tetap sama */}
                                <CardFooter>
                                    {totalPages > 1 && (
                                        <Pagination>
                                            <PaginationContent>
                                                <PaginationItem>
                                                    <PaginationPrevious
                                                        href={`/admin?page=${page > 1 ? page - 1 : 1}${query ? `&query=${query}` : ''}`}
                                                        aria-disabled={page === 1}
                                                    />
                                                </PaginationItem>

                                                {[...Array(totalPages)].map((_, i) => {
                                                    const pageNumber = i + 1;
                                                    if (pageNumber === 1 || pageNumber === totalPages ||
                                                        (pageNumber >= page - 1 && pageNumber <= page + 1)) {
                                                        return (
                                                            <PaginationItem key={pageNumber}>
                                                                <PaginationLink
                                                                    href={`/admin?page=${pageNumber}${query ? `&query=${query}` : ''}`}
                                                                    isActive={page === pageNumber}
                                                                >
                                                                    {pageNumber}
                                                                </PaginationLink>
                                                            </PaginationItem>
                                                        );
                                                    }
                                                    if (pageNumber === 2 || pageNumber === totalPages - 1) {
                                                        return (
                                                            <PaginationItem key={pageNumber}>
                                                                <PaginationEllipsis />
                                                            </PaginationItem>
                                                        );
                                                    }
                                                    return null;
                                                })}

                                                <PaginationItem>
                                                    <PaginationNext
                                                        href={`/admin?page=${page < totalPages ? page + 1 : totalPages}${query ? `&query=${query}` : ''}`}
                                                        aria-disabled={page === totalPages}
                                                    />
                                                </PaginationItem>
                                            </PaginationContent>
                                        </Pagination>
                                    )}
                                </CardFooter>
                            </Card>
                        </TabsContent>

                        <TabsContent value="units">
                            <Card>
                                <CardHeader>
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <CardTitle>Kelola Unit</CardTitle>
                                            <CardDescription>Management unit militer dalam sistem.</CardDescription>
                                        </div>
                                        <Dialog>
                                            <DialogTrigger asChild>
                                                <Button className="flex items-center gap-1">
                                                    <Plus className="h-4 w-4" />
                                                    Tambah Unit
                                                </Button>
                                            </DialogTrigger>
                                            <DialogContent>
                                                <DialogHeader>
                                                    <DialogTitle>Tambah Unit Baru</DialogTitle>
                                                    <DialogDescription>
                                                        Masukkan nama unit baru untuk sistem.
                                                    </DialogDescription>
                                                </DialogHeader>
                                                <form action={createUnit} className="space-y-4">
                                                    <div className="grid gap-2">
                                                        <Label htmlFor="unit_name">Nama Unit</Label>
                                                        <Input id="unit_name" name="unit_name" placeholder="Contoh: Kompi A Rajawali" required />
                                                    </div>
                                                    <DialogFooter>
                                                        <Button type="submit">Simpan Unit</Button>
                                                    </DialogFooter>
                                                </form>
                                            </DialogContent>
                                        </Dialog>
                                    </div>
                                </CardHeader>
                                <CardContent>
                                    {units.length > 0 ? (
                                        <Table>
                                            <TableCaption>Total {units.length} unit terdaftar</TableCaption>
                                            <TableHeader>
                                                <TableRow>
                                                    <TableHead>ID</TableHead>
                                                    <TableHead>Nama Unit</TableHead>
                                                    <TableHead>Status</TableHead>
                                                    <TableHead>Tanggal Dibuat</TableHead>
                                                    <TableHead className="text-right">Aksi</TableHead>
                                                </TableRow>
                                            </TableHeader>
                                            <TableBody>
                                                {units.map((unit) => (
                                                    <TableRow key={unit.unit_id}>
                                                        <TableCell>{unit.unit_id}</TableCell>
                                                        <TableCell className="font-medium">{unit.unit_name}</TableCell>
                                                        <TableCell>
                                                            {unit.is_active ?
                                                                <Badge variant="default" className="bg-green-500">Aktif</Badge> :
                                                                <Badge variant="destructive">Non-aktif</Badge>
                                                            }
                                                        </TableCell>
                                                        <TableCell>
                                                            {new Date(unit.created_at).toLocaleDateString('id-ID')}
                                                        </TableCell>
                                                        <TableCell className="flex justify-end gap-2">
                                                            <form action={deleteUnit}>
                                                                <input type="hidden" name="id" value={unit.unit_id} />
                                                                <Button variant="destructive" size="sm" type="submit">
                                                                    Hapus
                                                                </Button>
                                                            </form>
                                                        </TableCell>
                                                    </TableRow>
                                                ))}
                                            </TableBody>
                                        </Table>
                                    ) : (
                                        <div className="flex flex-col items-center justify-center py-10 text-center">
                                            <AlertTriangle className="h-10 w-10 text-yellow-500 mb-2" />
                                            <h3 className="text-lg font-medium">Belum ada unit</h3>
                                            <p className="text-sm text-gray-500">
                                                Belum ada unit yang terdaftar dalam sistem
                                            </p>
                                        </div>
                                    )}
                                </CardContent>
                            </Card>
                        </TabsContent>


                        {/* Tab Kelola Pangkat */}
                        <TabsContent value="ranks">
                            <Card>
                                <CardHeader>
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <CardTitle>Kelola Pangkat</CardTitle>
                                            <CardDescription>Management pangkat militer dalam sistem.</CardDescription>
                                        </div>
                                        <Dialog>
                                            <DialogTrigger asChild>
                                                <Button className="flex items-center gap-1">
                                                    <Plus className="h-4 w-4" />
                                                    Tambah Pangkat
                                                </Button>
                                            </DialogTrigger>
                                            <DialogContent>
                                                <DialogHeader>
                                                    <DialogTitle>Tambah Pangkat Baru</DialogTitle>
                                                    <DialogDescription>
                                                        Masukkan nama pangkat baru untuk sistem.
                                                    </DialogDescription>
                                                </DialogHeader>
                                                <form action={createRank} className="space-y-4">
                                                    <div className="grid gap-2">
                                                        <Label htmlFor="rank_name">Nama Pangkat</Label>
                                                        <Input id="rank_name" name="rank_name" placeholder="Contoh: Sersan Dua" required />
                                                    </div>
                                                    <DialogFooter>
                                                        <Button type="submit">Simpan Pangkat</Button>
                                                    </DialogFooter>
                                                </form>
                                            </DialogContent>
                                        </Dialog>
                                    </div>
                                </CardHeader>
                                <CardContent>
                                    {ranks.length > 0 ? (
                                        <Table>
                                            <TableCaption>Total {ranks.length} pangkat terdaftar</TableCaption>
                                            <TableHeader>
                                                <TableRow>
                                                    <TableHead>ID</TableHead>
                                                    <TableHead>Nama Pangkat</TableHead>
                                                    <TableHead>Status</TableHead>
                                                    <TableHead>Tanggal Dibuat</TableHead>
                                                    <TableHead className="text-right">Aksi</TableHead>
                                                </TableRow>
                                            </TableHeader>
                                            <TableBody>
                                                {ranks.map((rank) => (
                                                    <TableRow key={rank.rank_id}>
                                                        <TableCell>{rank.rank_id}</TableCell>
                                                        <TableCell className="font-medium">{rank.rank_name}</TableCell>
                                                        <TableCell>
                                                            {rank.is_active ?
                                                                <Badge variant="default" className="bg-green-500">Aktif</Badge> :
                                                                <Badge variant="destructive">Non-aktif</Badge>
                                                            }
                                                        </TableCell>
                                                        <TableCell>
                                                            {new Date(rank.created_at).toLocaleDateString('id-ID')}
                                                        </TableCell>
                                                        <TableCell className="flex justify-end gap-2">
                                                            <form action={deleteRank}>
                                                                <input type="hidden" name="id" value={rank.rank_id} />
                                                                <Button variant="destructive" size="sm" type="submit">
                                                                    Hapus
                                                                </Button>
                                                            </form>
                                                        </TableCell>
                                                    </TableRow>
                                                ))}
                                            </TableBody>
                                        </Table>
                                    ) : (
                                        <div className="flex flex-col items-center justify-center py-10 text-center">
                                            <AlertTriangle className="h-10 w-10 text-yellow-500 mb-2" />
                                            <h3 className="text-lg font-medium">Belum ada pangkat</h3>
                                            <p className="text-sm text-gray-500">
                                                Belum ada pangkat yang terdaftar dalam sistem
                                            </p>
                                        </div>
                                    )}
                                </CardContent>
                            </Card>
                        </TabsContent>

                        {/* Overview tab - existing code tetap sama */}
                        <TabsContent value="overview">
                            <Card>
                                <CardHeader>
                                    <CardTitle>Overview Dashboard</CardTitle>
                                    <CardDescription>
                                        Statistik dan overview sistem CombatSense.
                                    </CardDescription>
                                </CardHeader>
                                <CardContent>
                                    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                                        <Card>
                                            <CardHeader className="pb-2">
                                                <CardTitle className="text-sm font-medium">
                                                    Total User
                                                </CardTitle>
                                            </CardHeader>
                                            <CardContent>
                                                <div className="text-2xl font-bold">{totalUsers}</div>
                                                <p className="text-xs text-muted-foreground">
                                                    Akun terdaftar dalam sistem
                                                </p>
                                            </CardContent>
                                        </Card>

                                        <Card>
                                            <CardHeader className="pb-2">
                                                <CardTitle className="text-sm font-medium">
                                                    User Aktif
                                                </CardTitle>
                                            </CardHeader>
                                            <CardContent>
                                                <div className="text-2xl font-bold">
                                                    {users.filter(user => user.is_active).length}
                                                </div>
                                                <p className="text-xs text-muted-foreground">
                                                    Akun dengan status aktif
                                                </p>
                                            </CardContent>
                                        </Card>

                                        <Card>
                                            <CardHeader className="pb-2">
                                                <CardTitle className="text-sm font-medium">
                                                    Distribusi Role
                                                </CardTitle>
                                            </CardHeader>
                                            <CardContent>
                                                <div className="text-xs space-y-1">
                                                    <div className="flex justify-between">
                                                        <span>Prajurit:</span>
                                                        <span className="font-medium">
                                                            {users.filter(user => user.role === 'prajurit').length}
                                                        </span>
                                                    </div>
                                                    <div className="flex justify-between">
                                                        <span>Komandan:</span>
                                                        <span className="font-medium">
                                                            {users.filter(user => user.role === 'komandan').length}
                                                        </span>
                                                    </div>
                                                    <div className="flex justify-between">
                                                        <span>Medis:</span>
                                                        <span className="font-medium">
                                                            {users.filter(user => user.role === 'medis').length}
                                                        </span>
                                                    </div>
                                                </div>
                                            </CardContent>
                                        </Card>
                                    </div>
                                </CardContent>
                            </Card>
                        </TabsContent>
                    </Tabs>
                </main>
            </div>
        </SidebarProvider>
    );
}