"use server";
import { db } from "@/lib/db";
import { training_locations } from "@/lib/schema";
import { eq } from "drizzle-orm";

export async function getAllLocations() {
    return await db.select().from(training_locations);
}
