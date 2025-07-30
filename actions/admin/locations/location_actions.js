"use server";
import { db } from "@/lib/db";
import { training_locations } from "@/lib/schema";
import { eq } from "drizzle-orm";
import { revalidatePath } from 'next/cache';

export async function getAllLocations() {
    return await db.select().from(training_locations);
}

export async function createLocation(data) {
    await db.insert(training_locations).values({
        name: data.name,
        description: data.description,
        map_image_url: data.map_image_url,
        latitude: parseFloat(data.latitude),
        longitude: parseFloat(data.longitude),
    });
    revalidatePath('/admin/location');
}

export async function updateLocation(id, data) {
    await db.update(training_locations)
        .set({
            name: data.name,
            description: data.description,
            map_image_url: data.map_image_url,
            latitude: parseFloat(data.latitude),
            longitude: parseFloat(data.longitude),
        })
        .where(eq(training_locations.id, Number(id)));
    revalidatePath('/admin/location');
}

export async function deleteLocation(id) {
    await db.delete(training_locations).where(eq(training_locations.id, Number(id)));
    revalidatePath('/admin/location');
}

export async function getLocationById(id) {
    const result = await db.select().from(training_locations).where(eq(training_locations.id, Number(id)));
    return result[0] || null;
}