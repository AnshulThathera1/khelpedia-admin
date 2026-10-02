"use server";

import { requireAdmin } from "@/lib/auth";
import { ADMIN_PERMISSIONS } from "@/lib/rbac";
import { createAdminClient } from "@/utils/supabase/admin";
import { revalidatePath } from "next/cache";

export async function uploadMediaAction(formData) {
  await requireAdmin(ADMIN_PERMISSIONS.MEDIA_UPLOAD);

  const file = formData.get("file");
  if (!file || typeof file === "string") {
    return { success: false, error: "Please select a valid image file to upload." };
  }

  // Validate mime type
  const allowedMimes = ["image/jpeg", "image/png", "image/webp", "image/gif", "image/svg+xml"];
  if (!allowedMimes.includes(file.type)) {
    return {
      success: false,
      error: `Invalid file format (${file.type}). Allowed formats: JPEG, PNG, WebP, SVG, GIF.`,
    };
  }

  // Validate size (10 MB max)
  const maxBytes = 10 * 1024 * 1024;
  if (file.size > maxBytes) {
    return {
      success: false,
      error: `File is too large (${(file.size / (1024 * 1024)).toFixed(1)} MB). Maximum limit is 10 MB.`,
    };
  }

  try {
    const adminDb = createAdminClient();
    const sanitizedName = file.name.replace(/[^a-zA-Z0-9.-]/g, "_");
    const uniqueFileName = `${Date.now()}_${sanitizedName}`;

    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    const { data, error } = await adminDb.storage
      .from("khelpedia-media")
      .upload(uniqueFileName, buffer, {
        contentType: file.type,
        upsert: false,
      });

    if (error) throw error;

    const {
      data: { publicUrl },
    } = adminDb.storage.from("khelpedia-media").getPublicUrl(uniqueFileName);

    revalidatePath("/media");
    return {
      success: true,
      url: publicUrl,
      fileName: uniqueFileName,
      size: file.size,
      mimeType: file.type,
    };
  } catch (err) {
    console.error("Error uploading media:", err);
    return { success: false, error: err.message || "Failed to upload image." };
  }
}

export async function deleteMediaAction(formData) {
  await requireAdmin(ADMIN_PERMISSIONS.MEDIA_DELETE);

  const fileName = formData.get("fileName");
  if (!fileName) {
    return { success: false, error: "Filename is required to delete media." };
  }

  try {
    const adminDb = createAdminClient();
    const { error } = await adminDb.storage.from("khelpedia-media").remove([fileName]);

    if (error) throw error;

    revalidatePath("/media");
    return { success: true };
  } catch (err) {
    console.error("Error deleting media:", err);
    return { success: false, error: err.message || "Failed to delete file from storage." };
  }
}
