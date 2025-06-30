export const DUMMY_RANKS = [
    { id: 1, name: 'Sersan Dua', created_at: '2023-01-10' },
    { id: 2, name: 'Kopral', created_at: '2023-01-10' },
    { id: 3, name: 'Mayor', created_at: '2023-01-10' },
    { id: 4, name: 'Kapten', created_at: '2023-01-10' },
    { id: 5, name: 'Dokter', created_at: '2023-01-10' },
];

export const DUMMY_UNITS = [
    { id: 1, name: 'Kompi A Rajawali', created_at: '2023-01-10' },
    { id: 2, name: 'Kompi B Garuda', created_at: '2023-01-10' },
    { id: 3, name: 'Tim Medis', created_at: '2023-01-10' },
];

export const DUMMY_USERS = [
    { 
        id: 1, 
        username: 'budi123', 
        full_name: 'Budi Santoso', 
        role: 'prajurit', 
        unit_id: 1, 
        rank_id: 1, 
        is_active: true,
        avatar: '/avatars/budi.jpg' 
    },
    { 
        id: 2, 
        username: 'ahmad_k', 
        full_name: 'Ahmad Perkasa', 
        role: 'komandan', 
        unit_id: 2, 
        rank_id: 4, 
        is_active: true,
        avatar: '/avatars/ahmad.jpg'
    },
    { 
        id: 3, 
        username: 'rina_medis', 
        full_name: 'Dr. Rina', 
        role: 'medis', 
        unit_id: 3, 
        rank_id: 5, 
        is_active: true,
        avatar: '/avatars/rina.jpg'
    },
    { 
        id: 4, 
        username: 'eko_w', 
        full_name: 'Eko Widodo', 
        role: 'prajurit', 
        unit_id: 1, 
        rank_id: 2, 
        is_active: false,
        avatar: '/avatars/eko.jpg'
    },
];

export const DUMMY_SESSIONS = [
    {
        id: 1,
        name: 'Latihan Tembak Siang',
        status: 'berlangsung',
        start_time: '2024-07-28 14:00',
        location: 'Lapangan Tembak A',
        participants: [1, 4],
        commanders: [2],
    },
    {
        id: 2,
        name: 'Latihan Fisik Pagi',
        status: 'terjadwal',
        start_time: '2024-07-29 06:00',
        location: 'Lapangan Utama',
        participants: [1, 2, 3, 4],
        commanders: [2],
    },
    {
        id: 3,
        name: 'Simulasi Pertempuran Kota',
        status: 'selesai',
        start_time: '2024-07-27 09:00',
        location: 'Area Urban Training',
        participants: [1, 4],
        commanders: [2],
    },
    {
        id: 4,
        name: 'Simulasi Pertempuran Kota',
        status: 'selesai',
        start_time: '2024-07-27 09:00',
        location: 'Area Urban Training',
        participants: [1, 4],
        commanders: [2],
    },
    {
        id: 5,
        name: 'Simulasi Pertempuran Kota',
        status: 'selesai',
        start_time: '2024-07-27 09:00',
        location: 'Area Urban Training',
        participants: [1, 4],
        commanders: [2],
    }
];

// Helper function to get related data
export const getFullUserData = (user) => {
    const unit = DUMMY_UNITS.find(u => u.id === user.unit_id);
    const rank = DUMMY_RANKS.find(r => r.id === user.rank_id);
    return {
        ...user,
        unit_name: unit ? unit.name : 'N/A',
        rank_name: rank ? rank.name : 'N/A',
    };
};

export const getFullUsersData = () => {
    return DUMMY_USERS.map(user => getFullUserData(user));
}; 