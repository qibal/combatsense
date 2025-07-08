import { getHistoryDetail } from "@/actions/prajurit/sesi_latihan/history_actions";
import HistoryDetailClient from "@/components/prajurit/HistoryDetailClient";

export default async function HistoryDetailPage({ params }) {
    try {
        const { id } = params;
        const result = await getHistoryDetail(id);

        // Jika terjadi error atau data tidak ditemukan, kita teruskan pesan errornya
        if (!result.success) {
            return <HistoryDetailClient error={result.message} />;
        }

        // Jika berhasil, kita teruskan datanya
        return <HistoryDetailClient historyData={result.data} />;
    } catch (error) {
        console.error("Error in HistoryDetailPage:", error);
        return <HistoryDetailClient error="Terjadi kesalahan saat memuat data histori." />;
    }
}