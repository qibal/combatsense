'use client';

import { DUMMY_SESSIONS, DUMMY_USERS } from '@/lib/admin-dummy-data';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/Shadcn/card';
import { Badge } from '@/components/Shadcn/badge';
import { Clock, MapPin, Users } from 'lucide-react';

export default function AdminSessionsPage() {

    const getStatusBadge = (status) => {
        switch (status) {
            case 'berlangsung': return <Badge variant="default" className="bg-green-500">Berlangsung</Badge>;
            case 'terjadwal': return <Badge variant="outline" className="border-blue-500 text-blue-600">Terjadwal</Badge>;
            case 'selesai': return <Badge variant="secondary">Selesai</Badge>;
            default: return <Badge>{status}</Badge>;
        }
    };
    
    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-2xl md:text-3xl font-bold tracking-tight">Sesi Latihan</h1>
                <p className="text-gray-500 dark:text-gray-400">Daftar semua sesi latihan yang terdata dalam sistem.</p>
            </div>
            
            <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
                {DUMMY_SESSIONS.map(session => (
                    <Card key={session.id} className="flex flex-col h-full">
                        <CardHeader>
                            <div className="flex items-start justify-between gap-4">
                                <div className="flex-1 min-w-0 overflow-hidden">
                                    <CardTitle className="text-lg font-semibold break-words">{session.name}</CardTitle>
                                </div>
                                <div className="flex-shrink-0">{getStatusBadge(session.status)}</div>
                            </div>
                            <CardDescription className="space-y-1 pt-2">
                                <div className="flex items-center gap-2">
                                    <Clock className="h-4 w-4" />
                                    <span>{new Date(session.start_time).toLocaleString('id-ID')}</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <MapPin className="h-4 w-4" />
                                    <span>{session.location}</span>
                                </div>
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="flex flex-col flex-grow">
                            <div className="flex-grow">
                                <h4 className="font-semibold text-sm mb-2">Komandan</h4>
                                <div className="flex flex-wrap gap-2">
                                    {session.commanders.map(id => {
                                        const commander = DUMMY_USERS.find(u => u.id === id);
                                        return <Badge key={id} variant="destructive">{commander?.full_name}</Badge>
                                    })}
                                </div>
                             </div>
                             <div className="mt-4">
                                <h4 className="font-semibold text-sm mb-2">Jumlah Peserta</h4>
                                <div className="flex items-center gap-2">
                                    <Users className="h-4 w-4" />
                                    <span>{session.participants.length} Prajurit</span>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                ))}
            </div>
        </div>
    );
} 