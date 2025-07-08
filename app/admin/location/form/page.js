'use client';
import { useState, useRef, useEffect } from "react";
import { Input } from '@/components/Shadcn/input';
import { Textarea } from '@/components/Shadcn/textarea';
import { Button } from '@/components/Shadcn/button';
import { useRouter, useSearchParams } from "next/navigation";
import { createLocation, updateLocation, getLocationById } from "@/actions/admin/locations/location_actions";
import Image from "next/image";
import Map, { Marker } from 'react-map-gl/mapbox';
import 'mapbox-gl/dist/mapbox-gl.css';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/Shadcn/card';
import { MapPin, Search } from 'lucide-react';
import { useState as useStateReact } from 'react';

export default function FormLocationPage() {
    const [form, setForm] = useState({
        name: "",
        description: "",
        latitude: -6.1754, // Default ke Monas Jakarta
        longitude: 106.8272,
        map_image_url: "",
    });
    const [preview, setPreview] = useState("");
    const [uploading, setUploading] = useState(false);
    const [searchQuery, setSearchQuery] = useState("");
    const [viewState, setViewState] = useState({
        longitude: 106.8272,
        latitude: -6.1754,
        zoom: 12
    });
    const [selectedLocation, setSelectedLocation] = useState({
        lat: -6.1754,
        lng: 106.8272
    });
    const inputFileRef = useRef(null);
    const router = useRouter();
    const searchParams = useSearchParams();
    const id = searchParams.get("id");
    const [error, setError] = useState("");

    // Fetch data lokasi jika edit
    useEffect(() => {
        if (id) {
            (async () => {
                const data = await getLocationById(Number(id));
                if (data) {
                    const lat = parseFloat(data.latitude) || -6.1754;
                    const lng = parseFloat(data.longitude) || 106.8272;

                    setForm({
                        name: data.name || "",
                        description: data.description || "",
                        latitude: lat,
                        longitude: lng,
                        map_image_url: data.map_image_url || "",
                    });
                    setSelectedLocation({ lat, lng });
                    setViewState({
                        longitude: lng,
                        latitude: lat,
                        zoom: 15
                    });
                    setPreview(data.map_image_url || "");
                }
            })();
        }
    }, [id]);

    const handleChange = e => {
        const { name, value, files } = e.target;
        if (name === "map_image_url" && files && files[0]) {
            setPreview(URL.createObjectURL(files[0]));
        } else {
            setForm(f => ({ ...f, [name]: value }));
        }
    };

    // Handle map click untuk memilih lokasi
    const handleMapClick = (event) => {
        const { lng, lat } = event.lngLat;
        setSelectedLocation({ lat, lng });
        setForm(prev => ({
            ...prev,
            latitude: lat,
            longitude: lng
        }));
    };

    // Handle search lokasi
    const handleSearch = async () => {
        if (!searchQuery.trim()) return;

        try {
            const response = await fetch(
                `https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(searchQuery)}.json?access_token=${process.env.NEXT_PUBLIC_MAPBOX_TOKEN}&country=id`
            );
            const data = await response.json();

            if (data.features && data.features.length > 0) {
                const [lng, lat] = data.features[0].center;
                setSelectedLocation({ lat, lng });
                setForm(prev => ({
                    ...prev,
                    latitude: lat,
                    longitude: lng
                }));
                setViewState({
                    longitude: lng,
                    latitude: lat,
                    zoom: 15
                });
            }
        } catch (error) {
            console.error('Error searching location:', error);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setUploading(true);
        setError("");

        let imageUrl = form.map_image_url;
        const file = inputFileRef.current?.files?.[0];
        if (file) {
            // Upload ke Vercel Blob
            try {
                const response = await fetch(`/api/admin/location/upload?filename=${file.name}`, {
                    method: 'POST',
                    body: file,
                });
                if (!response.ok) throw new Error('Gagal upload gambar');
                const blob = await response.json();
                imageUrl = blob.url;
            } catch (err) {
                setError('Gagal upload gambar');
                setUploading(false);
                console.log('Upload error:', err);
                return;
            }
        }

        const payload = {
            ...form,
            map_image_url: imageUrl,
        };

        try {
            if (id) {
                console.log('Update lokasi', id, payload);
                await updateLocation(id, payload);
            } else {
                console.log('Create lokasi', payload);
                await createLocation(payload);
            }
            router.push('/admin/location');
        } catch (error) {
            console.error('Error saving location:', error);
            setError('Gagal menyimpan lokasi. Cek koneksi atau data!');
        } finally {
            setUploading(false);
        }
    };

    return (
        <div className="max-w-7xl mx-auto py-8 px-4">
            <h2 className="text-2xl font-bold mb-6">{id ? "Edit Lokasi" : "Tambah Lokasi"}</h2>
            {error && (
                <div className="mb-4 p-3 bg-red-100 text-red-700 rounded">{error}</div>
            )}

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Form Section - Left Column */}
                <div className="lg:col-span-1 space-y-4">
                    <Card>
                        <CardHeader>
                            <CardTitle>Informasi Lokasi</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <Input
                                name="name"
                                placeholder="Nama Lokasi"
                                value={form.name}
                                onChange={handleChange}
                                required
                            />
                            <Textarea
                                name="description"
                                placeholder="Deskripsi lokasi"
                                value={form.description}
                                onChange={handleChange}
                                rows={3}
                            />

                            <div>
                                <label className="block mb-2 font-semibold">Gambar Peta</label>
                                <Input
                                    name="map_image_url"
                                    type="file"
                                    accept="image/*"
                                    onChange={handleChange}
                                    ref={inputFileRef}
                                />
                                {preview && (
                                    <div className="mt-2">
                                        <Image
                                            src={preview}
                                            alt="Preview"
                                            className="w-full h-32 object-cover rounded"
                                            width={400}
                                            height={128}
                                        />
                                    </div>
                                )}
                            </div>

                            <div className="bg-gray-50 p-4 rounded-lg">
                                <h4 className="font-semibold mb-2">Koordinat Terpilih</h4>
                                <div className="grid grid-cols-2 gap-2 text-sm">
                                    <div>
                                        <span className="text-gray-600">Latitude:</span>
                                        <span className="ml-2 font-mono">{selectedLocation.lat.toFixed(6)}</span>
                                    </div>
                                    <div>
                                        <span className="text-gray-600">Longitude:</span>
                                        <span className="ml-2 font-mono">{selectedLocation.lng.toFixed(6)}</span>
                                    </div>
                                </div>
                            </div>

                            <div className="flex gap-2">
                                <Button
                                    type="submit"
                                    disabled={uploading}
                                    className="flex-1"
                                    onClick={handleSubmit}
                                >
                                    {uploading ? "Menyimpan..." : id ? "Update Lokasi" : "Tambah Lokasi"}
                                </Button>
                                <Button
                                    type="button"
                                    variant="outline"
                                    onClick={() => router.push('/admin/location')}
                                >
                                    Batal
                                </Button>
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Map Section - Right Column (Larger) */}
                <div className="lg:col-span-2 space-y-4">
                    <Card>
                        <CardHeader>
                            <CardTitle>Pilih Lokasi di Peta</CardTitle>
                            <CardDescription>Geser, zoom, dan cari lokasi untuk memilih koordinat yang tepat</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            {/* Search Bar */}
                            <div className="flex gap-2">
                                <Input
                                    placeholder="Cari lokasi (contoh: Monas, Jakarta, Bandung)"
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                                    className="flex-1"
                                />
                                <Button
                                    onClick={handleSearch}
                                    variant="outline"
                                    size="icon"
                                >
                                    <Search className="h-4 w-4" />
                                </Button>
                            </div>

                            {/* Large Interactive Map */}
                            <div className="h-[600px] rounded-lg overflow-hidden border">
                                <Map
                                    mapboxAccessToken={process.env.NEXT_PUBLIC_MAPBOX_TOKEN}
                                    initialViewState={viewState}
                                    longitude={viewState.longitude}
                                    latitude={viewState.latitude}
                                    zoom={viewState.zoom}
                                    style={{ width: '100%', height: '100%' }}
                                    mapStyle="mapbox://styles/mapbox/streets-v11"
                                    onClick={handleMapClick}
                                    attributionControl={false}
                                    scrollZoom={true}
                                    dragPan={true}
                                    dragRotate={true}
                                    doubleClickZoom={true}
                                    touchZoomRotate={true}
                                    keyboard={true}
                                    boxZoom={true}
                                    onMove={evt => setViewState(evt.viewState)}
                                    viewState={viewState}
                                >
                                    <Marker
                                        longitude={selectedLocation.lng}
                                        latitude={selectedLocation.lat}
                                        color="#ef4444"
                                        draggable={true}
                                        onDragEnd={(event) => {
                                            const { lng, lat } = event.lngLat;
                                            setSelectedLocation({ lat, lng });
                                            setForm(prev => ({
                                                ...prev,
                                                latitude: lat,
                                                longitude: lng
                                            }));
                                        }}
                                    />
                                </Map>
                            </div>

                            <div className="text-sm text-gray-600 bg-blue-50 p-3 rounded-lg">
                                <p className="flex items-center gap-2 mb-2">
                                    <MapPin className="h-4 w-4" />
                                    <strong>Panduan Penggunaan:</strong>
                                </p>
                                <ul className="text-xs space-y-1 ml-6">
                                    <li>• <strong>Klik</strong> pada peta untuk memilih lokasi</li>
                                    <li>• <strong>Geser marker merah</strong> untuk mengubah posisi</li>
                                    <li>• <strong>Scroll mouse</strong> untuk zoom in/out</li>
                                    <li>• <strong>Drag peta</strong> untuk berpindah area</li>
                                    <li>• <strong>Double click</strong> untuk zoom cepat</li>
                                    <li>• <strong>Gunakan search bar</strong> untuk mencari lokasi spesifik</li>
                                </ul>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    );
}