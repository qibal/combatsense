'use server';

const { db } = require('../../utils/database');
const { rankTable } = require('../../model/rank');
const { eq } = require('drizzle-orm'); 
const { 
  successResponse, 
  errorResponse, 
  handleDatabaseError, 
  validationError 
} = require('../../utils/response');

/**
 * Server Actions untuk Admin Rank Management
 * CRD - Create, Read, Delete (tanpa Update dan tanpa deskripsi)
 */

export async function getAllRanks() {
  try {
    const ranks = await db
      .select({
        rank_id: rankTable.rank_id,
        rank_name: rankTable.rank_name,
        is_active: rankTable.is_active,
        created_at: rankTable.created_at,
        updated_at: rankTable.updated_at
      })
      .from(rankTable)
      .where(eq(rankTable.is_active, true));
    
    return successResponse(ranks, 'Data rank berhasil diambil');
  } catch (error) {
    console.log('Database error detail:', error);
    return handleDatabaseError(error);
  }
}


export async function createRank(formData) {
  try {
    let data;
    if (formData instanceof FormData) {
      data = {
        rank_name: formData.get('rank_name')
      };
    } else {
      data = formData;
    }

    const { rank_name } = data;

    if (!rank_name) {
      return validationError('rank_name', 'Nama pangkat wajib diisi');
    }

    // Cek apakah rank sudah ada
    const existingRank = await db
      .select()
      .from(rankTable)
      .where(eq(rankTable.rank_name, rank_name.trim()));

    if (existingRank.length > 0) {
      return validationError('rank_name', 'Pangkat dengan nama ini sudah ada');
    }

    const newRank = await db
      .insert(rankTable)
      .values({
        rank_name: rank_name.trim(),
        is_active: true
      })
      .returning({
        rank_id: rankTable.rank_id,
        rank_name: rankTable.rank_name,
        is_active: rankTable.is_active,
        created_at: rankTable.created_at
      });

    // Revalidate cache untuk tarik data terbaru
    revalidatePath('/admin');

    return successResponse(newRank[0], 'Pangkat berhasil dibuat');
  } catch (error) {
    return handleDatabaseError(error);
  }
}


export async function deleteRank(formData) {
  try {
    let id;
    if (formData instanceof FormData) {
      id = formData.get('id');
    } else {
      id = formData;
    }

    if (!id) {
      return validationError('id', 'Rank ID wajib diisi');
    }

    const existingRank = await db
      .select()
      .from(rankTable)
      .where(eq(rankTable.rank_id, parseInt(id)));

    if (existingRank.length === 0) {
      return errorResponse('Pangkat tidak ditemukan', null, 404);
    }

    // Soft delete - set is_active = false
    await db
      .update(rankTable)
      .set({
        is_active: false,
        updated_at: new Date()
      })
      .where(eq(rankTable.rank_id, parseInt(id)));

    // Revalidate cache untuk refresh data
    revalidatePath('/admin');

    return successResponse(null, 'Pangkat berhasil dihapus');
  } catch (error) {
    return handleDatabaseError(error);
  }
}

/**
 * Cara penggunaan:
 * 
 * // Create rank baru dari form (tanpa deskripsi)
 * <form action={createRank}>
 *   <input name="rank_name" placeholder="Nama Pangkat" required />
 *   <button type="submit">Buat Pangkat</button>
 * </form>
 */