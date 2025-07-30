import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import * as jose from 'jose';

// Fungsi untuk mendapatkan session dari cookie
async function getSession() {
    const session = cookies().get('session')?.value;
    if (!session) return null;

    try {
        const secret = new TextEncoder().encode(process.env.JWT_SECRET);
        const { payload } = await jose.jwtVerify(session, secret);
        return payload;
    } catch (error) {
        console.error('Gagal verifikasi JWT:', error);
        return null;
    }
}

export async function middleware(request) {
    const user = await getSession();
    const { pathname } = request.nextUrl;

    const rolePaths = {
        admin: '/admin',
        komandan: '/komandan',
        medis: '/medis',
        prajurit: '/prajurit',
    };

    const guestRoutes = ['/'];

    // Jika user sudah login
    if (user) {
        const userDashboard = rolePaths[user.role] || '/';

        // Jika user mencoba mengakses halaman login, arahkan ke dashboard mereka
        if (guestRoutes.includes(pathname)) {
            return NextResponse.redirect(new URL(userDashboard, request.url));
        }

        // Periksa jika user mencoba mengakses halaman yang tidak sesuai rolenya
        if (pathname.startsWith('/admin') && user.role !== 'admin') {
            return NextResponse.redirect(new URL(userDashboard, request.url));
        }
        if (pathname.startsWith('/komandan') && user.role !== 'komandan') {
            return NextResponse.redirect(new URL(userDashboard, request.url));
        }
        if (pathname.startsWith('/medis') && user.role !== 'medis') {
            return NextResponse.redirect(new URL(userDashboard, request.url));
        }
        if (pathname.startsWith('/prajurit') && user.role !== 'prajurit') {
            return NextResponse.redirect(new URL(userDashboard, request.url));
        }
    }
    // Jika user belum login
    else {
        const isProtectedRoute = Object.values(rolePaths).some(path => pathname.startsWith(path));
        if (isProtectedRoute) {
            // Arahkan ke halaman login jika mencoba akses halaman yang dilindungi
            return NextResponse.redirect(new URL('/', request.url));
        }
    }

    return NextResponse.next();
}

// Konfigurasi matcher untuk menentukan path mana yang akan dijalankan oleh middleware
export const config = {
    matcher: [
        /*
         * Match all request paths except for the ones starting with:
         * - api (API routes)
         * - _next/static (static files)
         * - _next/image (image optimization files)
         * - favicon.ico (favicon file)
         * - location (public location files)
         */
        '/((?!api|_next/static|_next/image|favicon.ico|location|.*\\.png$|.*\\.svg$|.*\\.jpg$).*)',
    ],
}; 