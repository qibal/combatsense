const { db } = require('../../utils/database');
const { usersTable } = require('../../model/users');
const { eq } = require('drizzle-orm');
const bcrypt = require('bcrypt');
const { 
  successResponse, 
  errorResponse, 
  handleDatabaseError, 
  validationError 
} = require('../../utils/response');

/**
 * Auth Repository
 * Handle operasi authentication untuk login, logout, dan user management
 */


/**
 * Login user dengan username dan password
 * @param {string} username - Username untuk login
 * @param {string} password - Password plain text
 * @returns {Object} - Response dengan user data atau error
 */
async function login(username, password) {
  try {
    // Validasi input
    if (!username) {
      return validationError('username', 'Username is required');
    }
    if (!password) {
      return validationError('password', 'Password is required');
    }

    // Cari user berdasarkan username
    const user = await db
      .select()
      .from(usersTable)
      .where(eq(usersTable.username, username.trim()));

    if (user.length === 0) {
      return errorResponse('Username atau password salah', null, 401);
    }

    const userData = user[0];

    // Check apakah user aktif
    if (!userData.is_active) {
      return errorResponse('Akun tidak aktif', null, 403);
    }

    // Verify password dengan bcrypt
    const isPasswordValid = await bcrypt.compare(password, userData.password_hash);
    if (!isPasswordValid) {
      return errorResponse('Username atau password salah', null, 401);
    }

    // Remove password dari response untuk keamanan
    const { password_hash, ...userWithoutPassword } = userData;

    return successResponse(userWithoutPassword, 'Login berhasil');
  } catch (error) {
    return handleDatabaseError(error);
  }
}

/**
 * Get user by ID
 * @param {number} userId - User ID
 * @returns {Object} - Response dengan user data atau error
 */
async function getUser(userId) {
  try {
    if (!userId) {
      return validationError('userId', 'User ID is required');
    }

    const user = await db
      .select({
        user_id: usersTable.user_id,
        username: usersTable.username,
        full_name: usersTable.full_name,
        role: usersTable.role,
        unit: usersTable.unit,
        rank: usersTable.rank,
        avatar: usersTable.avatar,
        is_active: usersTable.is_active,
        created_at: usersTable.created_at,
        updated_at: usersTable.updated_at
      })
      .from(usersTable)
      .where(eq(usersTable.user_id, userId));

    if (user.length === 0) {
      return errorResponse('User not found', null, 404);
    }

    return successResponse(user[0], 'User data retrieved successfully');
  } catch (error) {
    return handleDatabaseError(error);
  }
}

/**
 * Logout user (server-side logout logic)
 * @param {number} userId - User ID yang logout
 * @returns {Object} - Response logout berhasil
 */
async function logout(userId) {
  try {
    if (!userId) {
      return validationError('userId', 'User ID is required');
    }

    // Verify user exists
    const userCheck = await getUser(userId);
    if (!userCheck.success) {
      return userCheck;
    }

    // Untuk logout, biasanya handle di session/cookie
    // Di sini kita bisa tambah logic seperti update last_logout timestamp
    // atau invalidate refresh token jika menggunakan JWT

    return successResponse(null, 'Logout successful');
  } catch (error) {
    return handleDatabaseError(error);
  }
}

module.exports = {
  login,
  getUser,
  logout
};

/**
 * Cara penggunaan:
 * 
 * // Login user
 * const loginResult = await login('budi123', 'password123');
 * if (loginResult.success) {
 *   console.log('User logged in:', loginResult.data);
 *   // Set session atau cookie di sini
 * }
 * 
 * // Get user data
 * const userData = await getUser(1);
 * if (userData.success) {
 *   console.log('User data:', userData.data);
 * }
 * 
 * // Logout user
 * const logoutResult = await logout(1);
 * if (logoutResult.success) {
 *   console.log('User logged out successfully');
 *   // Clear session atau cookie di sini
 * }
 * 
 * // Install bcrypt dependency:
 * // npm install bcrypt
 * // npm install -D @types/bcrypt
 */