"use server";

import { db } from "@/lib/db";
import { users } from "@/lib/schema";
import { eq } from "drizzle-orm";
import bcrypt from "bcrypt";
import * as jose from 'jose';
import { cookies } from 'next/headers';

/**
 * Server action untuk login user
 * @param {Object} formData - { username, password }
 * @returns {Object} - { success, message, user }
 */
export async function loginAction({ email, password }) {
  if (!email || !password) {
    return { success: false, message: "Email dan password wajib diisi." };
  }

  const userList = await db
    .select()
    .from(users)
    .where(eq(users.email, email.trim()));

  if (!userList || userList.length === 0) {
    return { success: false, message: "Email atau password salah." };
  }

  const user = userList[0];

  if (!user.is_active) {
    return { success: false, message: "Akun tidak aktif." };
  }

  const isValid = await bcrypt.compare(password, user.password_hash);
  if (!isValid) {
    return { success: false, message: "Email atau password salah." };
  }

  const { password_hash, ...userWithoutPassword } = user;

  // Buat session token menggunakan jose
  const secret = new TextEncoder().encode(process.env.JWT_SECRET);
  const session = await new jose.SignJWT({
    id: user.id,
    email: user.email,
    role: user.role,
    fullName: user.full_name // Tambahkan info lain jika perlu
  })
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime('1d')
    .sign(secret);

  // Set cookie httpOnly dengan nama 'session'
  cookies().set('session', session, {
    httpOnly: true,
    path: '/',
    maxAge: 60 * 60 * 24, // 1 hari
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production',
  });

  return { success: true, user: userWithoutPassword };
}