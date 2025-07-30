import { Suspense } from 'react';
import LocationFormClient from '@/components/admin/LocationFormClient';

export default function LocationFormPage() {
    return (
        <Suspense fallback={<div>Memuat formulir lokasi...</div>}>
            <LocationFormClient />
        </Suspense>
    );
}