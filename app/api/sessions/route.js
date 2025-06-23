import { NextResponse } from 'next/server';

// Data dummy sesi latihan tersedia
const availableTrainingSessions = [
    {
        id: 1,
        name: "Latihan Tembak Siang",
        date: "2024-06-21",
        time: "14:00",
        location: "Lapangan A",
        commander: "Mayor Suharto",
        participants: 15,
        maxParticipants: 20,
        status: "open"
    },
    {
        id: 2,
        name: "Patroli Malam",
        date: "2024-06-21",
        time: "20:00",
        location: "Sector 3",
        commander: "Kapten Ahmad",
        participants: 8,
        maxParticipants: 10,
        status: "open"
    },
    {
        id: 3,
        name: "Latihan Fisik Pagi",
        date: "2024-06-22",
        time: "06:00",
        location: "Lapangan Olahraga",
        commander: "Letnan Sari",
        participants: 12,
        maxParticipants: 15,
        status: "waiting"
    },
    {
        id: 4,
        name: "Simulasi Pertempuran Hutan",
        date: "2024-06-22",
        time: "09:00",
        location: "Hutan C",
        commander: "Mayor Suharto",
        participants: 20,
        maxParticipants: 20,
        status: "closed"
    }
];

/**
 * API Endpoint untuk mendapatkan semua sesi latihan.
 * Mengembalikan data dummy untuk saat ini.
 *
 * @param {Request} request Objek request dari Next.js
 * @returns {NextResponse} Response JSON dengan daftar sesi.
 */
export async function GET(request) {
    try {
        // Mengembalikan data dummy
        const sessions = availableTrainingSessions;

        return NextResponse.json({
            status: 'success',
            data: {
                sessions,
            },
        });
    } catch (error) {
        console.error("API Route Error:", error);
        return NextResponse.json(
            { status: "error", message: "An internal server error occurred." },
            { status: 500 }
        );
    }
}

/**
 * Cara penggunaan:
 *
 * Frontend dapat melakukan fetch ke endpoint '/api/sessions' dengan method GET
 * untuk mendapatkan daftar semua sesi latihan yang tersedia.
 *
 * Contoh fetch di komponen React:
 *
 * useEffect(() => {
 *   const fetchSessions = async () => {
 *     const response = await fetch('/api/sessions');
 *     const data = await response.json();
 *     setSessions(data.data.sessions);
 *   };
 *   fetchSessions();
 * }, []);
 */
