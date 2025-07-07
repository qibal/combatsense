"use server";
import { cookies } from "next/headers";

export async function logoutAction() {
    // Hapus cookie JWT
    cookies().set("token", "", { maxAge: 0, path: "/" });
}
