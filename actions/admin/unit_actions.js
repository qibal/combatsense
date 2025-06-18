'use server';

const { db } = require('../../utils/database');
const { unitTable } = require('../../model/unit');
const { eq } = require('drizzle-orm'); 
const { 
  successResponse, 
  errorResponse, 
  handleDatabaseError, 
  validationError 
} = require('../../utils/response');

/**
 * Server Actions untuk Admin Unit Management
 * CRD - Create, Read, Delete (tanpa Update dan tanpa deskripsi)
 */

export async function getAllUnits() {
  try {
    const units = await db
      .select({
        unit_id: unitTable.unit_id,
        unit_name: unitTable.unit_name,
        is_active: unitTable.is_active,
        created_at: unitTable.created_at,
        updated_at: unitTable.updated_at
      })
      .from(unitTable)
      .where(eq(unitTable.is_active, true));
    
    return successResponse(units, 'Data unit berhasil diambil');
  } catch (error) {
    console.log('Database error detail:', error);
    return handleDatabaseError(error);
  }
}


export async function createUnit(formData) {
  try {
    let data;
    if (formData instanceof FormData) {
      data = {
        unit_name: formData.get('unit_name')
      };
    } else {
      data = formData;
    }

    const { unit_name } = data;

    if (!unit_name) {
      return validationError('unit_name', 'Nama unit wajib diisi');
    }

    // Cek apakah unit sudah ada
    const existingUnit = await db
      .select()
      .from(unitTable)
      .where(eq(unitTable.unit_name, unit_name.trim()));

    if (existingUnit.length > 0) {
      return validationError('unit_name', 'Unit dengan nama ini sudah ada');
    }

    const newUnit = await db
      .insert(unitTable)
      .values({
        unit_name: unit_name.trim(),
        is_active: true
      })
      .returning({
        unit_id: unitTable.unit_id,
        unit_name: unitTable.unit_name,
        is_active: unitTable.is_active,
        created_at: unitTable.created_at
      });

    // Revalidate cache untuk tarik data terbaru
    revalidatePath('/admin');

    return successResponse(newUnit[0], 'Unit berhasil dibuat');
  } catch (error) {
    return handleDatabaseError(error);
  }
}


export async function deleteUnit(formData) {
  try {
    let id;
    if (formData instanceof FormData) {
      id = formData.get('id');
    } else {
      id = formData;
    }

    if (!id) {
      return validationError('id', 'Unit ID wajib diisi');
    }

    const existingUnit = await db
      .select()
      .from(unitTable)
      .where(eq(unitTable.unit_id, parseInt(id)));

    if (existingUnit.length === 0) {
      return errorResponse('Unit tidak ditemukan', null, 404);
    }

    // Soft delete - set is_active = false
    await db
      .update(unitTable)
      .set({
        is_active: false,
        updated_at: new Date()
      })
      .where(eq(unitTable.unit_id, parseInt(id)));

    // Revalidate cache untuk refresh data
    revalidatePath('/admin');

    return successResponse(null, 'Unit berhasil dihapus');
  } catch (error) {
    return handleDatabaseError(error);
  }
}
/**
 * Cara penggunaan:
 * 
 * // Create unit baru dari form (tanpa deskripsi)
 * <form action={createUnit}>
 *   <input name="unit_name" placeholder="Nama Unit" required />
 *   <button type="submit">Buat Unit</button>
 * </form>
 */