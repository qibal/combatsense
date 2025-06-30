'use client';

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/Shadcn/card';
import { Users, MapIcon } from 'lucide-react';
import Image from 'next/image';

export default function AdminMapPage() {
    // Dummy data for soldier positions
    const soldiersOnMap = [
        { id: 1, name: 'Budi Santoso', x: 25, y: 40 },
        { id: 2, name: 'Ahmad Perkasa', x: 60, y: 75 },
        { id: 3, name: 'Dr. Rina', x: 80, y: 20 },
    ];

    return (
        <div className="space-y-6 h-full flex flex-col">
            <div>
                <h1 className="text-2xl md:text-3xl font-bold tracking-tight">Peta Pergerakan</h1>
                <p className="text-gray-500 dark:text-gray-400">Visualisasi posisi dan pergerakan prajurit di seluruh area barak.</p>
            </div>
            
            <Card className="flex-grow">
                <CardHeader>
                    <CardTitle>Peta Area Luas</CardTitle>
                    <CardDescription>Menampilkan semua prajurit yang aktif dan terpantau.</CardDescription>
                </CardHeader>
                <CardContent className="h-[75vh] p-0">
                    <div className="relative w-full h-full bg-gray-200 rounded-b-lg">
                        <Image
                            src="/maps/base-map.jpg" // Ganti dengan path gambar peta barak yang sesuai
                            alt="Peta Barak Militer"
                            fill
                            className="object-cover"
                            onError={(e) => { e.currentTarget.style.display = 'none'; }}
                        />
                        <div className="absolute top-0 left-0 w-full h-full bg-gray-800/20 flex items-center justify-center">
                             <p className="text-white bg-black/50 p-4 rounded-lg">
                                Placeholder untuk Peta Interaktif
                             </p>
                        </div>

                        {/* Render soldier positions */}
                        {soldiersOnMap.map(soldier => (
                            <div 
                                key={soldier.id}
                                className="absolute"
                                style={{ top: `${soldier.y}%`, left: `${soldier.x}%` }}
                                title={soldier.name}
                            >
                                <div className="h-3 w-3 bg-red-500 rounded-full border-2 border-white animate-pulse"></div>
                                <span className="text-xs text-white bg-black/60 px-1 py-0.5 rounded-md -translate-x-1/2 translate-y-2 absolute left-1/2 whitespace-nowrap">
                                    {soldier.name}
                                </span>
                            </div>
                        ))}
                    </div>
                </CardContent>
            </Card>
        </div>
    );
} 