'use server';

const { db } = require('../../utils/database');
const { usersTable } = require('../../model/users');
const { unitTable } = require('../../model/unit');
const { rankTable } = require('../../model/rank');
const { eq, like, or, ne } = require('drizzle-orm');
const { 
  successResponse, 
  errorResponse, 
  handleDatabaseError, 
  validationError 
} = require('../../utils/response');

// Pastikan bcrypt di-import untuk hash password
const bcrypt = require('bcrypt');

/**
 * Server Actions untuk Admin Users Management
 * Bisa dipanggil langsung dari Client Components
 */
// Perbaikan: Tambah null checks dan better error handling
// Perbaikan: Tambah null checks dan better error handling

export async function getAllUsers() {
  try {
    const users = await db
      .select({
        user_id: usersTable.user_id,
        username: usersTable.username,
        full_name: usersTable.full_name,
        role: usersTable.role,
        unit_id: usersTable.unit_id,
        rank_id: usersTable.rank_id,
        avatar: usersTable.avatar,
        is_active: usersTable.is_active,
        created_at: usersTable.created_at,
        updated_at: usersTable.updated_at,
        // Join dengan unit dan rank table
        unit_name: unitTable.unit_name,
        rank_name: rankTable.rank_name
      })
      .from(usersTable)
      .leftJoin(unitTable, eq(usersTable.unit_id, unitTable.unit_id))
      .leftJoin(rankTable, eq(usersTable.rank_id, rankTable.rank_id))
      .where(ne(usersTable.role, 'admin'));

    // Pastikan users tidak null/undefined
    const safeUsers = users || [];
    
    return successResponse(safeUsers, 'Data users berhasil diambil');
  } catch (error) {
    console.log('Database error detail:', error);
    return handleDatabaseError(error);
  }
}

export async function createUser(formData) {
  try {
    // Perbaikan: Null check untuk formData
    if (!formData) {
      return validationError('formData', 'Data form tidak ditemukan');
    }

    let data;
    if (formData instanceof FormData) {
      data = {
        username: formData.get('username'),
        password: formData.get('password'),
        full_name: formData.get('full_name'),
        role: formData.get('role'),
        unit_id: formData.get('unit_id'),
        rank_id: formData.get('rank_id')
      };
    } else {
      data = formData;
    }

    // Perbaikan: Validasi semua field required
    if (!data.username) {
      return validationError('username', 'Username wajib diisi');
    }
    if (!data.password) {
      return validationError('password', 'Password wajib diisi');
    }
    if (!data.full_name) {
      return validationError('full_name', 'Nama lengkap wajib diisi');
    }
    if (!data.role) {
      return validationError('role', 'Role wajib dipilih');
    }

    // Cek username sudah ada
    const existingUser = await db
      .select()
      .from(usersTable)
      .where(eq(usersTable.username, data.username.trim()));

    if (existingUser.length > 0) {
      return validationError('username', 'Username sudah digunakan');
    }

    // Hash password
    const bcrypt = require('bcrypt');
    const hashedPassword = await bcrypt.hash(data.password, 10);

    // Insert user baru
    const newUser = await db
      .insert(usersTable)
      .values({
        username: data.username.trim(),
        password_hash: hashedPassword,
        full_name: data.full_name.trim(),
        role: data.role,
        unit_id: data.unit_id ? parseInt(data.unit_id) : null,
        rank_id: data.rank_id ? parseInt(data.rank_id) : null,
        is_active: true
      })
      .returning({
        user_id: usersTable.user_id,
        username: usersTable.username,
        full_name: usersTable.full_name,
        role: usersTable.role,
        created_at: usersTable.created_at
      });

    return successResponse(newUser[0], 'User berhasil dibuat');
  } catch (error) {
    console.log('Create user error:', error);
    return handleDatabaseError(error);
  }
}

// Ubah untuk menggunakan FormData atau parameter langsung
export async function getUserById(formData) {
  try {
    // Bisa menerima FormData atau id langsung
    let id;
    if (formData instanceof FormData) {
      id = formData.get('id');
    } else {
      id = formData;
    }

    if (!id) {
      return validationError('id', 'User ID is required');
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
      .where(eq(usersTable.user_id, id));

    if (user.length === 0) {
      return errorResponse('User not found', null, 404);
    }

    return successResponse(user[0], 'User found successfully');
  } catch (error) {
    return handleDatabaseError(error);
  }
}


// Ubah untuk menggunakan FormData
export async function updateUser(formData) {
  try {
    // Ekstrak data dari FormData
    let id, data;
    if (formData instanceof FormData) {
      id = formData.get('id');
      data = {
        username: formData.get('username'),
        password: formData.get('password'),
        full_name: formData.get('full_name'),
        role: formData.get('role'),
        unit: formData.get('unit'),
        rank: formData.get('rank'),
        avatar: formData.get('avatar'),
        is_active: formData.get('is_active') === 'true'
      };
    } else {
      // Format untuk panggilan server-side: {id, data}
      id = formData.id;
      data = formData.data;
    }

    if (!id) {
      return validationError('id', 'User ID is required');
    }

    const { username, password, full_name, role, unit, rank, avatar, is_active } = data;

    // Check if user exists
    const userResult = await getUserById(id);
    if (!userResult.success) {
      return userResult;
    }

    // Prepare update data
    const updateData = {
      updated_at: new Date()
    };

    if (username) updateData.username = username.trim();
    if (full_name) updateData.full_name = full_name.trim();
    if (role) {
      const validRoles = ['prajurit', 'komandan', 'medis', 'admin'];
      if (!validRoles.includes(role)) {
        return validationError('role', 'Invalid role. Must be: prajurit, komandan, medis, or admin');
      }
      updateData.role = role;
    }
    if (unit !== undefined) updateData.unit = unit?.trim() || null;
    if (rank !== undefined) updateData.rank = rank?.trim() || null;
    if (avatar !== undefined) updateData.avatar = avatar;
    if (is_active !== undefined) updateData.is_active = is_active;

    // Hash password jika ada
    if (password) {
      const saltRounds = 10;
      updateData.password_hash = await bcrypt.hash(password, saltRounds);
    }

    const updatedUser = await db
      .update(usersTable)
      .set(updateData)
      .where(eq(usersTable.user_id, id))
      .returning({
        user_id: usersTable.user_id,
        username: usersTable.username,
        full_name: usersTable.full_name,
        role: usersTable.role,
        unit: usersTable.unit,
        rank: usersTable.rank,
        avatar: usersTable.avatar,
        is_active: usersTable.is_active,
        updated_at: usersTable.updated_at
      });

    return successResponse(updatedUser[0], 'User updated successfully');
  } catch (error) {
    return handleDatabaseError(error);
  }
}

// Ubah untuk menggunakan FormData
export async function deleteUser(formData) {
  try {
    // Ekstrak id dari FormData
    let id;
    if (formData instanceof FormData) {
      id = formData.get('id');
    } else {
      id = formData;
    }

    if (!id) {
      return validationError('id', 'User ID is required');
    }

    // Check if user exists
    const userResult = await getUserById(id);
    if (!userResult.success) {
      return userResult;
    }

    // Soft delete - set is_active = false
    await db
      .update(usersTable)
      .set({
        is_active: false,
        updated_at: new Date()
      })
      .where(eq(usersTable.user_id, id));

    return successResponse(null, 'User deleted successfully');
  } catch (error) {
    return handleDatabaseError(error);
  }
}

// Ubah untuk menggunakan FormData
export async function getUsersByRole(formData) {
  try {
    // Ekstrak role dari FormData
    let role;
    if (formData instanceof FormData) {
      role = formData.get('role');
    } else {
      role = formData;
    }

    if (!role) {
      return validationError('role', 'Role is required');
    }

    const validRoles = ['prajurit', 'komandan', 'medis', 'admin'];
    if (!validRoles.includes(role)) {
      return validationError('role', 'Invalid role. Must be: prajurit, komandan, medis, or admin');
    }

    const users = await db
      .select({
        user_id: usersTable.user_id,
        username: usersTable.username,
        full_name: usersTable.full_name,
        role: usersTable.role,
        unit: usersTable.unit,
        rank: usersTable.rank,
        avatar: usersTable.avatar,
        is_active: usersTable.is_active,
        created_at: usersTable.created_at
      })
      .from(usersTable)
      .where(eq(usersTable.role, role));

    return successResponse(users, `Found ${users.length} users with role: ${role}`);
  } catch (error) {
    return handleDatabaseError(error);
  }
}

// Ubah untuk menggunakan FormData
export async function searchUsers(formData) {
  try {
    // Ekstrak query dari FormData
    let query;
    if (formData instanceof FormData) {
      query = formData.get('query');
    } else {
      query = formData;
    }

    if (!query) {
      return getAllUsers();
    }

    const searchTerm = `%${query.trim()}%`;
    const users = await db
      .select({
        user_id: usersTable.user_id,
        username: usersTable.username,
        full_name: usersTable.full_name,
        role: usersTable.role,
        unit: usersTable.unit,
        rank: usersTable.rank,
        avatar: usersTable.avatar,
        is_active: usersTable.is_active,
        created_at: usersTable.created_at
      })
      .from(usersTable)
      .where(
        or(
          like(usersTable.username, searchTerm),
          like(usersTable.full_name, searchTerm),
          like(usersTable.unit, searchTerm),
          like(usersTable.rank, searchTerm)
        )
      );

    return successResponse(users, `Found ${users.length} users matching "${query}"`);
  } catch (error) {
    return handleDatabaseError(error);
  }
}

/**
 * Cara penggunaan di Next.js components:
 * 
 * // Di Server Component
 * import { getAllUsers, getUsersByRole } from '@/actions/admin/users';
 * 
 * export default async function Page() {
 *   const result = await getAllUsers();
 *   const users = result.success ? result.data : [];
 *   return (
 *     <div>
 *       <h1>User List</h1>
 *       <ul>{users.map(user => <li key={user.user_id}>{user.full_name}</li>)}</ul>
 *     </div>
 *   );
 * }
 * 
 * // Di Client Component dengan Form
 * "use client";
 * import { createUser } from '@/actions/admin/users';
 * 
 * export default function CreateUserForm() {
 *   return (
 *     <form action={createUser}>
 *       <input name="username" placeholder="Username" />
 *       <input type="password" name="password" placeholder="Password" />
 *       <input name="full_name" placeholder="Full Name" />
 *       <select name="role">
 *         <option value="prajurit">Prajurit</option>
 *         <option value="komandan">Komandan</option>
 *         <option value="medis">Medis</option>
 *       </select>
 *       <button type="submit">Create</button>
 *     </form>
 *   );
 * }
 * 
 * // Untuk delete user
 * <form action={deleteUser}>
 *   <input type="hidden" name="id" value={user.user_id} />
 *   <button type="submit">Delete</button>
 * </form>
 * 
 * // Untuk search
 * <form action={searchUsers}>
 *   <input name="query" placeholder="Search users..." />
 *   <button type="submit">Search</button>
 * </form>
 */