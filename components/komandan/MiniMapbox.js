'use client';
import Map, { Marker, Source, Layer } from 'react-map-gl/mapbox';
import 'mapbox-gl/dist/mapbox-gl.css';

export default function MiniMapbox({ lat, lng, path }) {
    if ((!lat && !lng) && (!path || path.length === 0)) {
        return <div className="text-xs text-gray-400">Lokasi tidak tersedia</div>;
    }

    // Jika ada path, gunakan path untuk polyline dan marker terakhir
    const hasPath = path && path.length > 0;
    const last = hasPath ? path[path.length - 1] : { lat, lng };

    // GeoJSON untuk polyline
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
                    longitude: last.lng,
                    latitude: last.lat,
                    zoom: 16,
                }}
                longitude={last.lng}
                latitude={last.lat}
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
                <Marker longitude={last.lng} latitude={last.lat} color="#ef4444" />
            </Map>
        </div>
    );
}