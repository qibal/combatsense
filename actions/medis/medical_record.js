"use server";

import { db } from "@/lib/db";
import { medical_records } from "@/lib/schema";

/**
 * Server action untuk menyimpan rekam medis
 * @param {Object} data - Data rekam medis
 * @returns {Object} - { success, message }
 */
export async function saveMedicalRecord(data) {
    try {
        await db.insert(medical_records).values({
            checkup_date: new Date().toISOString().split('T')[0],
            general_condition: data.generalCondition,
            notes: data.notes,
            weight_kg: parseFloat(data.weight),
            height_cm: parseInt(data.height),
            blood_pressure: data.bloodPressure,
            pulse: parseInt(data.pulse),
            temperature: parseFloat(data.temperature),
            glucose: parseFloat(data.glucose),
            cholesterol: parseFloat(data.cholesterol),
            hemoglobin: parseFloat(data.hemoglobin),
            other_diseases: data.otherDiseases,
            user_id: data.userId,
            examiner_id: data.examinerId,
        });
        return { success: true };
    } catch (e) {
        return { success: false, message: e.message };
    }
}
export async function getMedicalRecordsByUserId(userId) {
    try {
        const records = await db
            .select()
            .from(medical_records)
            .where(eq(medical_records.user_id, userId));
        return { success: true, records };
    } catch (e) {
        return { success: false, message: e.message, records: [] };
    }
}