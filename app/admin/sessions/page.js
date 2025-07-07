import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/Shadcn/card';
import { Badge } from '@/components/Shadcn/badge';
import { Clock, MapPin, Users } from 'lucide-react';
import { getAllSessionsData } from '@/actions/admin/sessions_actions';

// Fungsi untuk mendapatkan badge status yang sesuai
const getStatusBadge = (status) => {
    switch (status) {
        case 'berlangsung': return <Badge variant="default" className="bg-green-500">Berlangsung</Badge>;
        case 'direncanakan': return <Badge variant="outline" className="border-blue-500 text-blue-600">Direncanakan</Badge>;
        case 'selesai': return <Badge variant="secondary">Selesai</Badge>;
        case 'dibatalkan': return <Badge variant="destructive">Dibatalkan</Badge>;
        default: return <Badge>{status || 'N/A'}</Badge>;
    }
};

export default async function AdminSessionsPage() {

    const { success, data: sessions, message } = await getAllSessionsData();

    if (!success) {
        return (
            <div className="text-center text-red-500">
                <h2 className="text-xl font-bold">Gagal Memuat Data</h2>
                <p>{message}</p>
            </div>
        )
    }

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-2xl md:text-3xl font-bold tracking-tight">Sesi Latihan</h1>
                <p className="text-gray-500 dark:text-gray-400">Daftar semua sesi latihan yang terdata dalam sistem.</p>
            </div>

            {sessions.length === 0 ? (
                <div className="text-center text-gray-500 dark:text-gray-400 py-10">
                    <p>Belum ada sesi latihan yang dibuat.</p>
                </div>
            ) : (
                <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
                    {sessions.map(session => (
                        <Card key={session.id} className="flex flex-col h-full">
                            <CardHeader>
                                <div className="flex items-start justify-between gap-4">
                                    <div className="flex-1 min-w-0 overflow-hidden">
                                        <CardTitle className="text-lg font-semibold break-words">{session.name || 'N/A'}</CardTitle>
                                    </div>
                                    <div className="flex-shrink-0">{getStatusBadge(session.status)}</div>
                                </div>
                                <CardDescription className="space-y-1 pt-2">
                                    <div className="flex items-center gap-2">
                                        <Clock className="h-4 w-4" />
                                        <span>{session.scheduled_at ? new Date(session.scheduled_at).toLocaleString('id-ID', { dateStyle: 'long', timeStyle: 'short' }) : 'N/A'}</span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <MapPin className="h-4 w-4" />
                                        <span>{session.location_name || 'Tidak ada lokasi'}</span>
                                    </div>
                                </CardDescription>
                            </CardHeader>
                            <CardContent className="flex flex-col flex-grow">
                                <div className="flex-grow">
                                    <h4 className="font-semibold text-sm mb-2">Komandan</h4>
                                    <div className="flex flex-wrap gap-2">
                                        <Badge variant={session.commander_name ? "default" : "secondary"}>
                                            {session.commander_name || 'Belum ditugaskan'}
                                        </Badge>
                                    </div>
                                </div>
                                <div className="mt-4">
                                    <h4 className="font-semibold text-sm mb-2">Jumlah Peserta</h4>
                                    <div className="flex items-center gap-2">
                                        <Users className="h-4 w-4" />
                                        <span>{session.participant_count || 0} Prajurit</span>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            )}
        </div>
    );
} 