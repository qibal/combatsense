import { getPrajuritProfile, getMedicalHistory } from "@/actions/prajurit/sesi_latihan/profile_actions";
import { getAvailableSessions } from "@/actions/prajurit/sesi_latihan/sessions_actions";
import { getTrainingHistory } from "@/actions/prajurit/sesi_latihan/history_actions";
import PrajuritDashboardClient from "@/components/prajurit/PrajuritDashboardClient";

export default async function PrajuritDashboardPage() {
    try {
        // Fetch semua data yang dibutuhkan dashboard
        const profileRes = await getPrajuritProfile();
        const medicalRes = await getMedicalHistory();
        const sessionsRes = await getAvailableSessions();
        const historyRes = await getTrainingHistory();

        // Jika ada error pada data profil, tampilkan error
        if (!profileRes.success) {
            return (
                <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                    <div className="text-center">
                        <p className="text-red-500 mb-2">Gagal memuat data profil.</p>
                        <p className="text-sm text-gray-500">{profileRes.message}</p>
                    </div>
                </div>
            );
        }

        return (
            <PrajuritDashboardClient
                initialProfile={profileRes.data || {}}
                initialMedicalHistory={medicalRes.success ? medicalRes.data : []}
                initialInvitations={[]} // Silakan isi jika ada fitur undangan
                initialAvailableSessions={sessionsRes.success ? sessionsRes.data : []}
                initialTrainingHistory={historyRes.success ? historyRes.data : []}
            />
        );
    } catch (error) {
        console.error("Error in PrajuritDashboardPage:", error);
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="text-center">
                    <p className="text-red-500 mb-2">Terjadi kesalahan saat memuat dashboard.</p>
                    <p className="text-sm text-gray-500">Silakan coba lagi nanti.</p>
                </div>
            </div>
        );
    }
}