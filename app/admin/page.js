import { db } from '@/lib/db';
import { users, training_sessions } from '@/lib/schema';
import { eq, count } from 'drizzle-orm';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/Shadcn/card';
import { Users, ActivitySquare, ShieldCheck } from 'lucide-react';
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
export default async function AdminDashboardPage() {
  let statsData = {
    totalUsers: 0,
    activeSessions: 0,
    activeUsers: 0,
    prajuritCount: 0,
    komandanCount: 0,
    medisCount: 0,
  };

  try {
    const [
      totalUsersData,
      activeSessionsData,
      activeUsersData,
      prajuritCountData,
      komandanCountData,
      medisCountData,
    ] = await Promise.all([
      db.select({ value: count() }).from(users),
      db.select({ value: count() }).from(training_sessions).where(eq(training_sessions.status, 'berlangsung')),
      db.select({ value: count() }).from(users).where(eq(users.is_active, true)),
      db.select({ value: count() }).from(users).where(eq(users.role, 'prajurit')),
      db.select({ value: count() }).from(users).where(eq(users.role, 'komandan')),
      db.select({ value: count() }).from(users).where(eq(users.role, 'medis')),
    ]);

    statsData = {
      totalUsers: totalUsersData[0]?.value ?? 0,
      activeSessions: activeSessionsData[0]?.value ?? 0,
      activeUsers: activeUsersData[0]?.value ?? 0,
      prajuritCount: prajuritCountData[0]?.value ?? 0,
      komandanCount: komandanCountData[0]?.value ?? 0,
      medisCount: medisCountData[0]?.value ?? 0,
    };
  } catch (error) {
    console.error("Failed to fetch admin dashboard stats:", error);
  }

  const stats = [
    { title: "Total Pengguna", value: statsData.totalUsers, description: "Semua role terdaftar", icon: Users, href: "/admin/accounts" },
    { title: "Sesi Aktif", value: statsData.activeSessions, description: "Sesi latihan sedang berlangsung", icon: ActivitySquare, href: "/admin/sessions" },
    { title: "Akun Aktif", value: statsData.activeUsers, description: "Pengguna dengan status aktif", icon: ShieldCheck, href: "/admin/accounts" },
    { title: "Prajurit", value: statsData.prajuritCount, description: "Jumlah prajurit terdaftar", icon: Users, href: "/admin/accounts" },
    { title: "Komandan", value: statsData.komandanCount, description: "Jumlah komandan terdaftar", icon: Users, href: "/admin/accounts" },
    { title: "Tim Medis", value: statsData.medisCount, description: "Jumlah tim medis terdaftar", icon: Users, href: "/admin/accounts" },
  ];

  return (
    <div className="space-y-6">
      <div className="space-y-1">
        <h1 className="text-2xl md:text-3xl font-bold tracking-tight">Dashboard Admin</h1>
        <p className="text-gray-500 dark:text-gray-400">Ringkasan overview sistem CombatSense.</p>
      </div>

      <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
        {stats.map((stat, index) => (
          <StatCard key={index} {...stat} />
        ))}
      </div>
    </div>
  );
}