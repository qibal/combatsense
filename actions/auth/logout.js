"use server";
import { cookies } from "next/headers";

export async function logoutAction() {
    try {
        // Hapus cookie JWT dengan berbagai cara untuk memastikan terhapus
        cookies().set("token", "", {
            maxAge: 0,
            path: "/",
            expires: new Date(0),
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'lax'
        });

        // Hapus juga dengan domain yang sama
        cookies().delete("token");

        return { success: true };
    } catch (error) {
        console.error('Error during logout:', error);
        return { success: false, message: error.message };
    }
}
