'use client';
import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/Shadcn/card';
import { Button } from '@/components/Shadcn/button';
import { getAllLocations, deleteLocation } from "@/actions/admin/locations/location_actions";
import dynamic from "next/dynamic";
import { useRouter } from "next/navigation";
import Image from "next/image";
const MapboxLocation = dynamic(() => import('@/components/admin/MapboxLocation'), { ssr: false });

export default function AdminLocationPage() {
    const [locations, setLocations] = useState([]);
    const [selectedCoord, setSelectedCoord] = useState({ latitude: 0, longitude: 0 });
    const router = useRouter();

    useEffect(() => {
        async function fetchLocations() {
            setLocations(await getAllLocations());
        }
        fetchLocations();
    }, []);

    const handleDelete = async (id) => {
        await deleteLocation(id);
        setLocations(await getAllLocations());
    };

    const handleCardClick = (loc) => {
        setSelectedCoord({
            latitude: parseFloat(loc.latitude) || 0,
            longitude: parseFloat(loc.longitude) || 0,
        });
    };

    return (
        <div className="space-y-6">
            <h1 className="text-2xl font-bold">Kelola Lokasi Latihan</h1>
            <div className="mb-4">
                <Button onClick={() => router.push('/admin/location/form')}>Tambah Lokasi</Button>
            </div>
            {/* Map di atas */}
            <div className="mb-6">
                <MapboxLocation latitude={selectedCoord.latitude} longitude={selectedCoord.longitude} scrollZoom={true} />
            </div>
            {/* List lokasi di bawah */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {locations.map(loc => (
                    <Card key={loc.id} onClick={() => handleCardClick(loc)} className="cursor-pointer hover:border-blue-500">
                        <CardHeader>
                            <CardTitle>{loc.name}</CardTitle>
                            <CardDescription>{loc.description}</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <Image src={loc.map_image_url} width={500} height={500} alt={loc.name} className="w-full h-32 object-cover rounded mb-2" />
                            <div className="text-xs text-gray-500">Lat: {loc.latitude}, Lng: {loc.longitude}</div>
                            <div className="flex gap-2 mt-2">
                                <Button size="sm" onClick={e => { e.stopPropagation(); router.push(`/admin/location/form?id=${loc.id}`); }}>Edit</Button>
                                <Button size="sm" variant="destructive" onClick={e => { e.stopPropagation(); handleDelete(loc.id); }}>Hapus</Button>
                            </div>
                        </CardContent>
                    </Card>
                ))}
            </div>
        </div>
    );
}