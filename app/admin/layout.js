'use client';
import { usePathname } from 'next/navigation';
import Link from 'next/link';
import { SidebarProvider, Sidebar, SidebarHeader, SidebarContent, SidebarMenu, SidebarMenuItem, SidebarMenuButton, SidebarFooter, SidebarSeparator, SidebarTrigger, SidebarInset } from '@/components/Shadcn/sidebar';
import { Home, Users, CalendarDays, ActivitySquare, MapPin, Settings, LogOut, Shield } from 'lucide-react';

export default function AdminLayout({ children }) {
    const pathname = usePathname();

    const menuItems = [
        { href: '/admin', label: 'Dashboard', icon: Home },
        { href: '/admin/accounts', label: 'Kelola Accounts', icon: Users },
        { href: '/admin/sessions', label: 'Sesi Latihan', icon: CalendarDays },
        { href: '/admin/monitoring', label: 'Monitoring', icon: ActivitySquare },
        { href: '/admin/map', label: 'Peta Gerakan', icon: MapPin },
    ];
    
    return (
        <SidebarProvider className="flex h-screen gap-4 bg-gray-100 p-4 dark:bg-zinc-950">
            <Sidebar variant="inset">
                <SidebarHeader>
                    <div className="flex items-center gap-2 px-2">
                        <Shield className="h-6 w-6 text-blue-600" />
                        <h2 className="text-lg font-bold tracking-tight">CombatSense</h2>
                    </div>
                    <SidebarTrigger className="absolute right-2 top-2 md:hidden" />
                </SidebarHeader>

                <SidebarContent>
                    <SidebarMenu>
                        {menuItems.map(item => (
                            <SidebarMenuItem key={item.href}>
                                <SidebarMenuButton 
                                    asChild
                                    isActive={pathname === item.href} 
                                    tooltip={item.label}
                                >
                                    <Link href={item.href}>
                                        <item.icon className="h-5 w-5 mr-3" />
                                        <span>{item.label}</span>
                                    </Link>
                                </SidebarMenuButton>
                            </SidebarMenuItem>
                        ))}
                    </SidebarMenu>
                </SidebarContent>

                <SidebarSeparator />

                <SidebarFooter>
                    <SidebarMenu>
                        <SidebarMenuItem>
                            <SidebarMenuButton asChild isActive={pathname === '/admin/settings'} tooltip="Settings">
                                <Link href="/admin/settings">
                                    <Settings className="h-5 w-5 mr-3" />
                                    <span>Settings</span>
                                </Link>
                            </SidebarMenuButton>
                        </SidebarMenuItem>
                        <SidebarMenuItem>
                            <SidebarMenuButton asChild href="/logout" tooltip="Logout">
                                <Link href="/logout">
                                    <LogOut className="h-5 w-5 mr-3" />
                                    <span>Logout</span>
                                </Link>
                            </SidebarMenuButton>
                        </SidebarMenuItem>
                    </SidebarMenu>
                </SidebarFooter>
            </Sidebar>

            <SidebarInset className="flex-1 rounded-2xl bg-white dark:bg-zinc-900">
                <main className="overflow-auto p-4 md:p-6">
                    {children}
                </main>
            </SidebarInset>
        </SidebarProvider>
    );
} 