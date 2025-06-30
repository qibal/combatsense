'use client';

import { useState, useEffect } from 'react';
import { DUMMY_SESSIONS, DUMMY_USERS, getFullUserData } from '@/lib/admin-dummy-data';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/Shadcn/card';
import { Badge } from '@/components/Shadcn/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/Shadcn/avatar';
import { Progress } from '@/components/Shadcn/progress';
import { Wifi, WifiOff, Heart, Zap, Route, AlertTriangle } from 'lucide-react';

// Function to simulate real-time data
const generateRandomStats = () => ({
    heartRate: Math.floor(Math.random() * (120 - 70) + 70),
    speed: parseFloat((Math.random() * (15 - 1) + 1).toFixed(1)),
    distance: parseFloat((Math.random() * 10).toFixed(2)),
});

export default function AdminMonitoringPage() {
    const [livePrajurit, setLivePrajurit] = useState([]);
    const [monitoringData, setMonitoringData] = useState({});

    useEffect(() => {
        // Find active soldiers from active sessions
        const activeSession = DUMMY_SESSIONS.find(s => s.status === 'berlangsung');
        if (activeSession) {
            const activePrajuritIds = activeSession.participants;
            const prajuritData = DUMMY_USERS
                .filter(u => activePrajuritIds.includes(u.id))
                .map(p => ({
                    ...getFullUserData(p),
                    // Simulate device connection status
                    deviceConnected: Math.random() > 0.15 // 85% chance of being connected
                }))
                .sort((a, b) => (a.deviceConnected === b.deviceConnected) ? 0 : a.deviceConnected ? 1 : -1);

            setLivePrajurit(prajuritData);

            // Initialize monitoring data
            const initialData = {};
            prajuritData.forEach(p => {
                if (p.deviceConnected) {
                    initialData[p.id] = generateRandomStats();
                }
            });
            setMonitoringData(initialData);
        }
    }, []);

    useEffect(() => {
        // Update monitoring data every 3 seconds
        const interval = setInterval(() => {
            setMonitoringData(prevData => {
                const newData = { ...prevData };
                livePrajurit.forEach(p => {
                    if (p.deviceConnected) {
                        newData[p.id] = generateRandomStats();
                    }
                });
                return newData;
            });
        }, 3000);

        return () => clearInterval(interval);
    }, [livePrajurit]);

    const getProgressValue = (value, max) => Math.min(Math.round((value / max) * 100), 100);

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-2xl md:text-3xl font-bold tracking-tight">Monitoring Real-time</h1>
                <p className="text-gray-500 dark:text-gray-400">Memantau kondisi semua prajurit yang aktif dalam sesi latihan.</p>
            </div>
            
            {livePrajurit.length > 0 ? (
                <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                    {livePrajurit.map(prajurit => (
                        <Card key={prajurit.id} className={`border-l-4 ${prajurit.deviceConnected ? 'border-green-500' : 'border-red-500'}`}>
                            <CardHeader className="pb-2">
                                <div className="flex items-center gap-3">
                                    <Avatar className="h-12 w-12">
                                        <AvatarImage src={prajurit.avatar} alt={prajurit.full_name} />
                                        <AvatarFallback>{prajurit.full_name.split(' ').map(n=>n[0]).join('')}</AvatarFallback>
                                    </Avatar>
                                    <div className="flex-1">
                                        <CardTitle className="text-base">{prajurit.full_name}</CardTitle>
                                        <p className="text-xs text-gray-500">{prajurit.rank_name} - {prajurit.unit_name}</p>
                                    </div>
                                </div>
                            </CardHeader>
                            <CardContent>
                                <div className="flex items-center justify-between mb-3">
                                    {prajurit.deviceConnected 
                                        ? <Badge variant="default" className="bg-green-500 flex items-center gap-1"><Wifi className="h-3 w-3" />Terhubung</Badge>
                                        : <Badge variant="destructive" className="flex items-center gap-1"><WifiOff className="h-3 w-3" />Terputus</Badge>
                                    }
                                </div>

                                {prajurit.deviceConnected && monitoringData[prajurit.id] ? (
                                    <div className="space-y-3">
                                        <div>
                                            <div className="flex justify-between text-xs mb-1"><span className="flex items-center gap-1"><Heart className="h-3 w-3 text-red-500" />Detak Jantung</span><span>{monitoringData[prajurit.id].heartRate} bpm</span></div>
                                            <Progress value={getProgressValue(monitoringData[prajurit.id].heartRate, 200)} />
                                        </div>
                                        <div>
                                            <div className="flex justify-between text-xs mb-1"><span className="flex items-center gap-1"><Zap className="h-3 w-3 text-yellow-500" />Kecepatan</span><span>{monitoringData[prajurit.id].speed} km/h</span></div>
                                            <Progress value={getProgressValue(monitoringData[prajurit.id].speed, 30)} />
                                        </div>
                                        <div>
                                            <div className="flex justify-between text-xs mb-1"><span className="flex items-center gap-1"><Route className="h-3 w-3 text-blue-500" />Jarak</span><span>{monitoringData[prajurit.id].distance} km</span></div>
                                            <Progress value={getProgressValue(monitoringData[prajurit.id].distance, 10)} />
                                        </div>
                                    </div>
                                ) : (
                                     <p className="text-center text-xs text-red-500 py-4">Data tidak tersedia.</p>
                                )}
                            </CardContent>
                        </Card>
                    ))}
                </div>
            ) : (
                <div className="flex flex-col items-center justify-center py-16 text-center border-2 border-dashed rounded-lg">
                    <AlertTriangle className="h-12 w-12 text-gray-400 mb-3" />
                    <h3 className="text-lg font-medium">Tidak Ada Sesi Aktif</h3>
                    <p className="text-sm text-gray-500">
                        Tidak ada sesi latihan yang sedang berlangsung untuk dimonitor.
                    </p>
                </div>
            )}
        </div>
    );
} 