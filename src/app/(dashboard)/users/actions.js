"use server";

import { requireAdmin } from "@/lib/auth";
import { ADMIN_PERMISSIONS, ADMIN_ROLES } from "@/lib/rbac";
import { createAdminClient } from "@/utils/supabase/admin";
import { revalidatePath } from "next/cache";

/**
 * Update user administrative role
 */
export async function updateUserRole(formData) {
  const currentAdmin = await requireAdmin(ADMIN_PERMISSIONS.USERS_EDIT);

  const userId = formData.get("userId");
  const role = formData.get("role"); // e.g. "SUPER_ADMIN", "ADMIN", "EDITOR", "USER"

  if (!userId) {
    return { success: false, error: "Missing user ID." };
  }

  // Prevent admin from removing their own super admin status accidentally
  if (userId === currentAdmin.user.id && role === "USER") {
    return { success: false, error: "You cannot demote your own administrator account." };
  }

  try {
    const adminDb = createAdminClient();
    const isAdmin = role !== "USER";

    // 1. Update profiles table
    const { error: profileError } = await adminDb
      .from("profiles")
      .update({
        is_admin: isAdmin,
      })
      .eq("id", userId);

    if (profileError) {
      throw profileError;
    }

    // 2. Update auth user app_metadata for scoped role if applicable
    await adminDb.auth.admin.updateUserById(userId, {
      app_metadata: {
        admin_role: isAdmin ? role : null,
      },
    });

    revalidatePath("/users");
    revalidatePath(`/users/${userId}`);
    return { success: true };
  } catch (err) {
    console.error("Error updating user role:", err);
    return { success: false, error: err.message || "Failed to update user role." };
  }
}

/**
 * Toggle user account suspension (Ban/Unban)
 */
export async function toggleUserSuspension(formData) {
  const currentAdmin = await requireAdmin(ADMIN_PERMISSIONS.USERS_SUSPEND);

  const userId = formData.get("userId");
  const shouldSuspend = formData.get("suspend") === "true";

  if (!userId) {
    return { success: false, error: "Missing user ID." };
  }

  // Prevent self-suspension
  if (userId === currentAdmin.user.id) {
    return { success: false, error: "You cannot suspend your own account." };
  }

  try {
    const adminDb = createAdminClient();

    // Ban for 100 years or remove ban
    const banDuration = shouldSuspend ? "876000h" : "none";

    const { error } = await adminDb.auth.admin.updateUserById(userId, {
      ban_duration: banDuration,
    });

    if (error) {
      throw error;
    }

    revalidatePath("/users");
    revalidatePath(`/users/${userId}`);
    return { success: true };
  } catch (err) {
    console.error("Error toggling user suspension:", err);
    return { success: false, error: err.message || "Failed to modify suspension status." };
  }
}

/**
 * Update permitted profile fields
 */
export async function updateUserProfile(formData) {
  await requireAdmin(ADMIN_PERMISSIONS.USERS_EDIT);

  const userId = formData.get("userId");
  const displayName = formData.get("displayName");
  const emailNotifications = formData.get("emailNotifications") === "on";
  const pushNotifications = formData.get("pushNotifications") === "on";

  if (!userId) {
    return { success: false, error: "Missing user ID." };
  }

  try {
    const adminDb = createAdminClient();

    const { error } = await adminDb
      .from("profiles")
      .update({
        display_name: displayName?.trim() || null,
        email_notifications: emailNotifications,
        push_notifications: pushNotifications,
      })
      .eq("id", userId);

    if (error) {
      throw error;
    }

    revalidatePath("/users");
    revalidatePath(`/users/${userId}`);
    return { success: true };
  } catch (err) {
    console.error("Error updating profile:", err);
    return { success: false, error: err.message || "Failed to update profile." };
  }
}
