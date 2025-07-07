'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/Shadcn/card';
import { toast } from 'sonner';
import { getActiveSoldierPositions } from '@/actions/admin/map_actions';
import { AlertTriangle } from 'lucide-react';
import Map, { Marker, Popup } from 'react-map-gl/mapbox';
import 'mapbox-gl/dist/mapbox-gl.css';

function SoldierMarker({ soldier, onClick }) {
    const { isConnected } = soldier;
    return (
        <Marker longitude={soldier.longitude} latitude={soldier.latitude} anchor="bottom" onClick={e => {
            e.originalEvent.stopPropagation();
            onClick(soldier);
        }}>
            <div className="cursor-pointer" title={`${soldier.fullName} ${isConnected ? '' : '(Terputus)'}`}>
                <div className={`h-3 w-3 ${isConnected ? 'bg-red-500 animate-pulse' : 'bg-gray-500'} rounded-full border-2 border-white shadow-md`}></div>
            </div>
        </Marker>
    );
}

export default function AdminMapPage() {
    const [soldiersOnMap, setSoldiersOnMap] = useState([]);
    const [popupInfo, setPopupInfo] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [viewState, setViewState] = useState({
        // Default: Pusat Kota Semarang, ganti jika perlu
        longitude: 110.4133,
        latitude: -6.98745,
        zoom: 15
    });

    const MAPBOX_TOKEN = process.env.NEXT_PUBLIC_MAPBOX_TOKEN;

    useEffect(() => {
        const fetchPositions = async () => {
            const result = await getActiveSoldierPositions();
            if (result.success) {
                const now = Date.now();
                const soldiersWithStatus = result.data.map(soldier => {
                    const lastSeen = soldier.timestamp ? new Date(soldier.timestamp).getTime() : 0;
                    const isConnected = (now - lastSeen) < 30000; // Terputus jika > 30 detik
                    return { ...soldier, isConnected };
                });
                setSoldiersOnMap(soldiersWithStatus);

                // Jika ini pemuatan pertama dan ada prajurit, pusatkan peta pada prajurit pertama
                if (isLoading && soldiersWithStatus.length > 0) {
                    setViewState(prev => ({
                        ...prev,
                        longitude: soldiersWithStatus[0].longitude,
                        latitude: soldiersWithStatus[0].latitude,
                    }));
                }
            } else {
                toast.error(result.message || 'Gagal memuat posisi prajurit.');
            }
            if (isLoading) setIsLoading(false);
        };

        fetchPositions();
        const interval = setInterval(fetchPositions, 10000); // Poll setiap 10 detik

        return () => clearInterval(interval);
    }, [isLoading]);

    if (!MAPBOX_TOKEN) {
        return (
            <div className="flex flex-col items-center justify-center h-full text-center">
                <AlertTriangle className="h-12 w-12 text-red-500 mb-3" />
                <h3 className="text-xl font-bold text-red-600">Konfigurasi Mapbox Diperlukan</h3>
                <p className="text-md text-gray-600 mt-2">
                    `NEXT_PUBLIC_MAPBOX_TOKEN` tidak ditemukan.<br />
                    Harap tambahkan token akses Anda ke file `.env.local` dan restart server.
                </p>
            </div>
        );
    }

    return (
        <div className="space-y-6 h-full flex flex-col">
            <div>
                <h1 className="text-2xl md:text-3xl font-bold tracking-tight">Peta Pergerakan</h1>
                <p className="text-gray-500 dark:text-gray-400">Visualisasi posisi prajurit di sesi aktif secara real-time.</p>
            </div>

            <Card className="flex-grow">
                <CardHeader>
                    <CardTitle>Peta Sesi Aktif</CardTitle>
                    <CardDescription>Menampilkan semua prajurit yang aktif dan terpantau.</CardDescription>
                </CardHeader>
                <CardContent className="h-[75vh] p-0">
                    <div className="relative w-full h-full bg-gray-200 rounded-b-lg overflow-hidden">
                        <Map
                            {...viewState}
                            onMove={evt => setViewState(evt.viewState)}
                            mapboxAccessToken={MAPBOX_TOKEN}
                            mapStyle="mapbox://styles/mapbox/satellite-v9"
                            style={{ width: '100%', height: '100%' }}
                        >
                            {soldiersOnMap.map(soldier => (
                                <SoldierMarker key={soldier.userId} soldier={soldier} onClick={setPopupInfo} />
                            ))}

                            {popupInfo && (
                                <Popup
                                    anchor="top"
                                    longitude={Number(popupInfo.longitude)}
                                    latitude={Number(popupInfo.latitude)}
                                    onClose={() => setPopupInfo(null)}
                                    closeOnClick={false}
                                >
                                    <div>{popupInfo.fullName}</div>
                                </Popup>
                            )}
                        </Map>

                        {(isLoading || soldiersOnMap.length === 0) && (
                            <div className="absolute top-0 left-0 w-full h-full bg-gray-800/50 flex items-center justify-center pointer-events-none">
                                <div className="flex flex-col items-center justify-center text-center p-4 rounded-lg bg-black/60">
                                    {isLoading ? (
                                        <p className="text-white">Memuat data posisi...</p>
                                    ) : (
                                        <>
                                            <AlertTriangle className="h-10 w-10 text-gray-300 mb-2" />
                                            <h3 className="font-medium text-white">Tidak Ada Data Peta</h3>
                                            <p className="text-sm text-gray-300">Tidak ada sesi aktif atau data posisi tidak ditemukan.</p>
                                        </>
                                    )}
                                </div>
                            </div>
                        )}
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
