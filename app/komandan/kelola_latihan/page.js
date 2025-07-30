'use client';
import { useSearchParams } from 'next/navigation';
import { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from '@/components/Shadcn/card';
import CreateSessionForm from "@/components/komandan/CreateSessionForm";
import { getAvailableUsersByRole, getSessionById } from "@/actions/komandan/sessions_actions";
import { getAllLocations } from "@/actions/komandan/location_actions";
import { Suspense } from 'react'; // Import Suspense

function SessionFormWrapper() {
  const searchParams = useSearchParams();
  const sesiId = Number(searchParams.get('id'));
  const [komandan, setKomandan] = useState([]);
  const [prajurit, setPrajurit] = useState([]);
  const [medis, setMedis] = useState([]);
  const [locations, setLocations] = useState([]);
  const [initialData, setInitialData] = useState(null);

  useEffect(() => {
    async function fetchData() {
      setKomandan(await getAvailableUsersByRole("komandan"));
      setPrajurit(await getAvailableUsersByRole("prajurit"));
      setMedis(await getAvailableUsersByRole("medis"));
      setLocations(await getAllLocations());
      if (sesiId) {
        const data = await getSessionById(sesiId);
        setInitialData(data);
      }
    }
    fetchData();
  }, [sesiId]); // sesiD adalah dependency yang penting

  return (
    <Card>
      <CardHeader>
        <CardTitle>{sesiId ? 'Edit Sesi Latihan' : 'Buat Sesi Latihan Baru'}</CardTitle>
        <CardDescription>
          {sesiId ? 'Edit detail dan peserta sesi latihan' : 'Isi detail sesi dan pilih peserta latihan'}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <CreateSessionForm
          komandan={komandan}
          prajurit={prajurit}
          medis={medis}
          locations={locations}
          initialData={initialData}
        />
      </CardContent>
    </Card>
  );
}

export default function KelolaLatihanPage() {

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-4xl mx-auto space-y-6">
        <Suspense fallback={<div>Memuat formulir sesi...</div>}>
          <SessionFormWrapper />
        </Suspense>
      </div>
    </div>
  );
}
