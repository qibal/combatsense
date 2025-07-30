import { Suspense } from 'react';
import KomandanDashboardClient from '@/components/komandan/KomandanDashboardClient';

export default function KomandanPage() {
  return (
    <Suspense fallback={<div>Memuat dashboard komandan...</div>}>
      <KomandanDashboardClient />
    </Suspense>
  );
}
