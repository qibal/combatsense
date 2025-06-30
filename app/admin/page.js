'use client';

import { DUMMY_USERS, DUMMY_SESSIONS } from '@/lib/admin-dummy-data';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/Shadcn/card';
import { Users, ActivitySquare, ShieldCheck, AlertTriangle } from 'lucide-react';
import Link from 'next/link';

// Komponen untuk kartu statistik
function StatCard({ title, value, description, icon: Icon, href }) {
  return (
    <Card>
      <Link href={href}>
        <div className="hover:bg-gray-100 dark:hover:bg-zinc-800 rounded-lg p-4">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{title}</CardTitle>
            <Icon className="h-5 w-5 text-gray-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{value}</div>
            <p className="text-xs text-gray-500 dark:text-gray-400">{description}</p>
          </CardContent>
        </div>
      </Link>
    </Card>
  );
}

// Komponen utama dashboard admin
export default function AdminDashboardPage() {
    const totalUsers = DUMMY_USERS.length;
    const activeSessions = DUMMY_SESSIONS.filter(s => s.status === 'berlangsung').length;
    const activeUsers = DUMMY_USERS.filter(u => u.is_active).length;
    const prajuritCount = DUMMY_USERS.filter(u => u.role === 'prajurit').length;
    const komandanCount = DUMMY_USERS.filter(u => u.role === 'komandan').length;
    const medisCount = DUMMY_USERS.filter(u => u.role === 'medis').length;

    const stats = [
        { title: "Total Pengguna", value: totalUsers, description: "Semua role terdaftar", icon: Users, href: "/admin/accounts" },
        { title: "Sesi Aktif", value: activeSessions, description: "Sesi latihan sedang berlangsung", icon: ActivitySquare, href: "/admin/sessions" },
        { title: "Akun Aktif", value: activeUsers, description: "Pengguna dengan status aktif", icon: ShieldCheck, href: "/admin/accounts" },
        { title: "Prajurit", value: prajuritCount, description: "Jumlah prajurit terdaftar", icon: Users, href: "/admin/accounts" },
        { title: "Komandan", value: komandanCount, description: "Jumlah komandan terdaftar", icon: Users, href: "/admin/accounts" },
        { title: "Tim Medis", value: medisCount, description: "Jumlah tim medis terdaftar", icon: Users, href: "/admin/accounts" },
    ];

    return (
        <div className="space-y-6">
            <div className="space-y-1">
                <h1 className="text-2xl md:text-3xl font-bold tracking-tight">Dashboard Admin</h1>
                <p className="text-gray-500 dark:text-gray-400">Ringkasan overview sistem CombatSense.</p>
            </div>
            
            {/* Grid Statistik Utama */}
            <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
                {stats.map((stat, index) => (
                    <StatCard key={index} {...stat} />
                ))}
            </div>

            {/* Quick Actions & Recent Activities can be added here */}
        </div>
    );
}