'use client';

import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/Shadcn/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/Shadcn/card';
import { Input } from '@/components/Shadcn/input';
import { Label } from '@/components/Shadcn/label';
import { toast } from 'sonner';
import { Eye, EyeOff, Loader2 } from 'lucide-react';
import { loginAction } from '@/actions/auth/auth';
import { createDefaultAdmin } from '@/actions/auth/create_admin_action';

export default function LoginPage() {
    const router = useRouter();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [isLoading, startTransition] = useTransition();
    const [adminLoading, setAdminLoading] = useState(false);

    const handleLogin = (e) => {
        e.preventDefault();
        startTransition(async () => {
            const result = await loginAction({ email, password });
            if (result.success) {
                toast.success(`Login berhasil! Selamat datang, ${result.user.full_name}.`);
                // Redirect ke dashboard sesuai role
                switch (result.user.role) {
                    case 'admin': router.push('/admin'); break;
                    case 'komandan': router.push('/komandan'); break;
                    case 'medis': router.push('/medis'); break;
                    case 'prajurit': router.push('/prajurit'); break;
                    default: router.push('/'); break;
                }
            } else {
                toast.error(result.message || 'Login gagal.');
            }
        });
    };

    const handleCreateAdmin = async () => {
        setAdminLoading(true);
        const result = await createDefaultAdmin();
        setAdminLoading(false);
        if (result.success) {
            toast.success(result.message);
        } else {
            toast.error(result.message);
        }
    };

    return (
        <div className="flex items-center justify-center min-h-screen bg-gray-100 dark:bg-gray-900">
            <Card className="w-full max-w-sm mx-4">
                <CardHeader className="text-center">
                    <CardTitle className="text-2xl font-bold">CombatSense</CardTitle>
                    <CardDescription>Masuk untuk melanjutkan ke dasbor Anda</CardDescription>
                </CardHeader>
                <CardContent>
                    <form onSubmit={handleLogin} className="space-y-4">
                        <div className="space-y-2">
                            <Label htmlFor="email">Email</Label>
                            <Input
                                id="email"
                                type="email"
                                placeholder="Masukkan email Anda"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                required
                                disabled={isLoading}
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="password">Password</Label>
                            <div className="relative">
                                <Input
                                    id="password"
                                    type={showPassword ? 'text' : 'password'}
                                    placeholder="Masukkan password Anda"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    required
                                    disabled={isLoading}
                                />
                                <Button
                                    type="button"
                                    variant="ghost"
                                    size="icon"
                                    className="absolute inset-y-0 right-0 h-full"
                                    onClick={() => setShowPassword(!showPassword)}
                                >
                                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                                </Button>
                            </div>
                        </div>
                        <Button type="submit" className="w-full" disabled={isLoading}>
                            {isLoading ? (
                                <>
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                    Mohon Tunggu...
                                </>
                            ) : (
                                'Login'
                            )}
                        </Button>
                    </form>
                    {/* <Button
                        type="button"
                        className="w-full mt-4"
                        variant="outline"
                        onClick={handleCreateAdmin}
                        disabled={adminLoading}
                    >
                        {adminLoading ? 'Membuat Admin...' : 'Buat Admin Default'}
                    </Button> */}
                </CardContent>
            </Card>
        </div>
    );
}