'use client';
import Map, { Marker, Source, Layer } from 'react-map-gl/mapbox';
import 'mapbox-gl/dist/mapbox-gl.css';

export default function MiniMapbox({ lat, lng, path }) {
    console.log("MiniMapbox received props: lat=", lat, "lng=", lng, "path=", path);
    // Revised condition: Check if lat OR lng are explicitly null or undefined
    const isLocationDataMissing = (lat === null || lat === undefined || lng === null || lng === undefined);

    if (isLocationDataMissing && (!path || path.length === 0)) {
        console.log("MiniMapbox: Location data missing or path empty.");
        return <div className="text-xs text-gray-400">Lokasi tidak tersedia</div>;
    }

    // If there is a path, use the last point of the path for the marker and initial view
    const hasPath = path && path.length > 0;
    const centerLat = hasPath ? Number(path[path.length - 1].lat) : (lat !== null && lat !== undefined ? Number(lat) : null);
    const centerLng = hasPath ? Number(path[path.length - 1].lng) : (lng !== null && lng !== undefined ? Number(lng) : null);

    console.log("MiniMapbox: Calculated centerLat=", centerLat, "centerLng=", centerLng);

    // If still no valid coordinates, return "Lokasi tidak tersedia"
    if (centerLat === null || centerLng === null) {
        console.log("MiniMapbox: Final coordinates are null. Displaying 'Lokasi tidak tersedia'.");
        return <div className="text-xs text-gray-400">Lokasi tidak tersedia</div>;
    }

    // GeoJSON for polyline
    const geojson = hasPath
        ? {
            type: "Feature",
            geometry: {
                type: "LineString",
                coordinates: path.map(p => [Number(p.lng), Number(p.lat)]),
            }
        }
        : null;

    return (
        <div style={{ width: '100%', height: 600, borderRadius: 8, overflow: 'hidden' }}>
            <Map
                mapboxAccessToken={process.env.NEXT_PUBLIC_MAPBOX_TOKEN}
                initialViewState={{
                    longitude: centerLng,
                    latitude: centerLat,
                    zoom: 16,
                }}
                longitude={centerLng} // Controlled component requires these
                latitude={centerLat}  // Controlled component requires these
                zoom={16}
                style={{ width: '100%', height: 600 }}
                mapStyle="mapbox://styles/mapbox/streets-v11"
                attributionControl={false}
            >
                {/* Polyline */}
                {hasPath && (
                    <Source id="line" type="geojson" data={geojson}>
                        <Layer
                            id="lineLayer"
                            type="line"
                            paint={{
                                'line-color': '#3b82f6',
                                'line-width': 4
                            }}
                        />
                    </Source>
                )}
                {/* Marker terakhir */}
                <Marker longitude={centerLng} latitude={centerLat} color="#ef4444" />
            </Map>
        </div>
    );
}