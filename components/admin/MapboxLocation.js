// components/admin/MapboxLocation.js
'use client';
import * as React from 'react';
import Map, { Marker } from 'react-map-gl/mapbox';
import 'mapbox-gl/dist/mapbox-gl.css';

export default function MapboxLocation({ latitude, longitude }) {
    const [viewState, setViewState] = React.useState({
        longitude: longitude || 110.4133,
        latitude: latitude || -6.98745,
        zoom: 17,
    });

    React.useEffect(() => {
        setViewState((prev) => ({
            ...prev,
            longitude: longitude || 110.4133,
            latitude: latitude || -6.98745,
        }));
    }, [latitude, longitude]);

    const MAPBOX_TOKEN = process.env.NEXT_PUBLIC_MAPBOX_TOKEN;

    return (
        <Map
            {...viewState}
            onMove={evt => setViewState(evt.viewState)}
            mapboxAccessToken={MAPBOX_TOKEN}
            mapStyle="mapbox://styles/mapbox/satellite-v9"
            style={{ width: '100%', height: 500, borderRadius: 12 }}
        >
            {latitude && longitude && (
                <Marker longitude={Number(longitude)} latitude={Number(latitude)} anchor="bottom">
                    <div className="h-4 w-4 bg-blue-600 rounded-full border-2 border-white shadow-lg" />
                </Marker>
            )}
        </Map>
    );
}