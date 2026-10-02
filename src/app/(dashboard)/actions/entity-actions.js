"use server";

import { requireAdmin } from "@/lib/auth";
import { ADMIN_PERMISSIONS } from "@/lib/rbac";
import { query } from "@/lib/db";
import {
  checkTeamDependencies,
  checkTournamentDependencies,
  checkPlayerDependencies,
  checkGameDependencies,
  checkMatchDependencies,
} from "@/lib/entity-safety";
import { revalidatePath } from "next/cache";

// ======================== TEAMS ========================

export async function updateTeamAction(formData) {
  await requireAdmin(ADMIN_PERMISSIONS.TEAMS_EDIT);

  const id = formData.get("id");
  const name = formData.get("name")?.trim();
  const region = formData.get("region")?.trim();
  const country = formData.get("country")?.trim();
  const foundedYear = formData.get("founded_year");
  const description = formData.get("description")?.trim();
  const editorialContent = formData.get("editorial_content")?.trim();

  if (!id || !name) {
    return { success: false, error: "Team ID and Name are required." };
  }

  try {
    const sql = `
      UPDATE teams
      SET 
        name = $1,
        region = $2,
        country = $3,
        founded_year = $4,
        description = $5,
        editorial_content = $6,
        updated_at = NOW()
      WHERE id = $7
    `;

    await query(sql, [
      name,
      region || null,
      country || null,
      foundedYear ? parseInt(foundedYear, 10) : null,
      description || null,
      editorialContent || null,
      id,
    ]);

    revalidatePath("/teams");
    revalidatePath(`/teams/${id}`);
    revalidatePath("/overview");
    return { success: true };
  } catch (err) {
    console.error("Error updating team in VPS DB:", err);
    return { success: false, error: err.message || "Failed to update team." };
  }
}

export async function deleteTeamSafeAction(formData) {
  await requireAdmin(ADMIN_PERMISSIONS.TEAMS_DELETE);

  const id = formData.get("id");
  if (!id) return { success: false, error: "Team ID is required." };

  try {
    const depCheck = await checkTeamDependencies(id);
    if (!depCheck.canDelete) {
      return { success: false, error: depCheck.warning, blocked: true };
    }

    await query("DELETE FROM teams WHERE id = $1", [id]);

    revalidatePath("/teams");
    revalidatePath("/overview");
    return { success: true };
  } catch (err) {
    console.error("Error deleting team from VPS DB:", err);
    return { success: false, error: err.message || "Failed to delete team." };
  }
}

// ======================== PLAYERS ========================

export async function updatePlayerAction(formData) {
  await requireAdmin(ADMIN_PERMISSIONS.PLAYERS_EDIT);

  const id = formData.get("id");
  const ign = formData.get("ign")?.trim();
  const name = formData.get("name")?.trim();
  const country = formData.get("country")?.trim();
  const role = formData.get("role")?.trim();
  const teamId = formData.get("team_id");
  const earnings = formData.get("earnings");
  const editorialContent = formData.get("editorial_content")?.trim();

  if (!id || !ign) {
    return { success: false, error: "Player ID and IGN are required." };
  }

  try {
    const sql = `
      UPDATE players
      SET 
        ign = $1,
        name = $2,
        country = $3,
        role = $4,
        team_id = $5,
        earnings = $6,
        editorial_content = $7,
        updated_at = NOW()
      WHERE id = $8
    `;

    await query(sql, [
      ign,
      name || null,
      country || null,
      role || null,
      teamId ? teamId : null,
      earnings ? parseFloat(earnings) : null,
      editorialContent || null,
      id,
    ]);

    revalidatePath("/players");
    revalidatePath(`/players/${id}`);
    revalidatePath("/overview");
    return { success: true };
  } catch (err) {
    console.error("Error updating player in VPS DB:", err);
    return { success: false, error: err.message || "Failed to update player." };
  }
}

export async function deletePlayerSafeAction(formData) {
  await requireAdmin(ADMIN_PERMISSIONS.PLAYERS_DELETE);

  const id = formData.get("id");
  if (!id) return { success: false, error: "Player ID is required." };

  try {
    const depCheck = await checkPlayerDependencies(id);
    if (!depCheck.canDelete) {
      return { success: false, error: depCheck.warning, blocked: true };
    }

    await query("DELETE FROM players WHERE id = $1", [id]);

    revalidatePath("/players");
    revalidatePath("/overview");
    return { success: true };
  } catch (err) {
    console.error("Error deleting player from VPS DB:", err);
    return { success: false, error: err.message || "Failed to delete player." };
  }
}

// ======================== TOURNAMENTS ========================

export async function updateTournamentAction(formData) {
  await requireAdmin(ADMIN_PERMISSIONS.TOURNAMENTS_EDIT);

  const id = formData.get("id");
  const name = formData.get("name")?.trim();
  const status = formData.get("status")?.trim();
  const tier = formData.get("tier")?.trim();
  const region = formData.get("region")?.trim();
  const prizePool = formData.get("prize_pool");
  const currency = formData.get("currency")?.trim();
  const startDate = formData.get("start_date");
  const endDate = formData.get("end_date");
  const format = formData.get("format")?.trim();
  const editorialContent = formData.get("editorial_content")?.trim();

  if (!id || !name) {
    return { success: false, error: "Tournament ID and Name are required." };
  }

  try {
    const sql = `
      UPDATE tournaments
      SET 
        name = $1,
        status = $2,
        tier = $3,
        region = $4,
        prize_pool = $5,
        currency = $6,
        start_date = $7,
        end_date = $8,
        format = $9,
        editorial_content = $10,
        updated_at = NOW()
      WHERE id = $11
    `;

    await query(sql, [
      name,
      status || "upcoming",
      tier || null,
      region || null,
      prizePool ? parseFloat(prizePool) : null,
      currency || "USD",
      startDate || null,
      endDate || null,
      format || null,
      editorialContent || null,
      id,
    ]);

    revalidatePath("/tournaments");
    revalidatePath(`/tournaments/${id}`);
    revalidatePath("/overview");
    return { success: true };
  } catch (err) {
    console.error("Error updating tournament in VPS DB:", err);
    return { success: false, error: err.message || "Failed to update tournament." };
  }
}

export async function deleteTournamentSafeAction(formData) {
  await requireAdmin(ADMIN_PERMISSIONS.TOURNAMENTS_DELETE);

  const id = formData.get("id");
  if (!id) return { success: false, error: "Tournament ID is required." };

  try {
    const depCheck = await checkTournamentDependencies(id);
    if (!depCheck.canDelete) {
      return { success: false, error: depCheck.warning, blocked: true };
    }

    await query("DELETE FROM tournaments WHERE id = $1", [id]);

    revalidatePath("/tournaments");
    revalidatePath("/overview");
    return { success: true };
  } catch (err) {
    console.error("Error deleting tournament from VPS DB:", err);
    return { success: false, error: err.message || "Failed to delete tournament." };
  }
}

// ======================== GAMES ========================

export async function updateGameAction(formData) {
  await requireAdmin(ADMIN_PERMISSIONS.GAMES_EDIT);

  const id = formData.get("id");
  const name = formData.get("name")?.trim();
  const genre = formData.get("genre")?.trim();
  const description = formData.get("description")?.trim();
  const iconUrl = formData.get("icon_url")?.trim();

  if (!id || !name) {
    return { success: false, error: "Game ID and Name are required." };
  }

  try {
    const sql = `
      UPDATE games
      SET 
        name = $1,
        genre = $2,
        description = $3,
        icon_url = $4,
        updated_at = NOW()
      WHERE id = $5
    `;

    await query(sql, [
      name,
      genre || null,
      description || null,
      iconUrl || null,
      id,
    ]);

    revalidatePath("/games");
    revalidatePath(`/games/${id}`);
    revalidatePath("/overview");
    return { success: true };
  } catch (err) {
    console.error("Error updating game in VPS DB:", err);
    return { success: false, error: err.message || "Failed to update game." };
  }
}

export async function deleteGameSafeAction(formData) {
  await requireAdmin(ADMIN_PERMISSIONS.GAMES_DELETE);

  const id = formData.get("id");
  if (!id) return { success: false, error: "Game ID is required." };

  try {
    const depCheck = await checkGameDependencies(id);
    if (!depCheck.canDelete) {
      return { success: false, error: depCheck.warning, blocked: true };
    }

    await query("DELETE FROM games WHERE id = $1", [id]);

    revalidatePath("/games");
    revalidatePath("/overview");
    return { success: true };
  } catch (err) {
    console.error("Error deleting game from VPS DB:", err);
    return { success: false, error: err.message || "Failed to delete game." };
  }
}

// ======================== MATCHES ========================

export async function updateMatchAction(formData) {
  await requireAdmin(ADMIN_PERMISSIONS.MATCHES_EDIT);

  const id = formData.get("id");
  const score1Raw = formData.get("score1");
  const score2Raw = formData.get("score2");
  const winnerId = formData.get("winner_id")?.trim() || null;
  const round = formData.get("round")?.trim() || null;
  const map = formData.get("map")?.trim() || null;
  const playedAtRaw = formData.get("played_at")?.trim();

  if (!id) {
    return { success: false, error: "Match ID is required." };
  }

  const score1 = score1Raw !== null && score1Raw !== "" ? parseInt(score1Raw, 10) : null;
  const score2 = score2Raw !== null && score2Raw !== "" ? parseInt(score2Raw, 10) : null;

  if (score1 !== null && isNaN(score1)) {
    return { success: false, error: "Score 1 must be a valid integer." };
  }
  if (score2 !== null && isNaN(score2)) {
    return { success: false, error: "Score 2 must be a valid integer." };
  }

  let playedAt = null;
  if (playedAtRaw) {
    const d = new Date(playedAtRaw);
    if (!isNaN(d.getTime())) {
      playedAt = d.toISOString();
    }
  }

  try {
    const sql = `
      UPDATE matches
      SET 
        score1 = $1,
        score2 = $2,
        winner_id = $3,
        round = $4,
        map = $5,
        played_at = $6,
        updated_at = NOW()
      WHERE id = $7
    `;

    await query(sql, [
      score1,
      score2,
      winnerId,
      round,
      map,
      playedAt,
      id,
    ]);

    revalidatePath("/matches");
    revalidatePath(`/matches/${id}`);
    revalidatePath("/data-quality");
    revalidatePath("/overview");
    return { success: true };
  } catch (err) {
    console.error("Error updating match in VPS DB:", err);
    return { success: false, error: err.message || "Failed to update match." };
  }
}

export async function deleteMatchSafeAction(formData) {
  await requireAdmin(ADMIN_PERMISSIONS.MATCHES_DELETE);

  const id = formData.get("id");
  if (!id) return { success: false, error: "Match ID is required." };

  try {
    const depCheck = await checkMatchDependencies(id);
    if (!depCheck.canDelete) {
      return { success: false, error: depCheck.warning, blocked: true };
    }

    await query("DELETE FROM matches WHERE id = $1", [id]);

    revalidatePath("/matches");
    revalidatePath("/data-quality");
    revalidatePath("/overview");
    return { success: true };
  } catch (err) {
    console.error("Error deleting match from VPS DB:", err);
    return { success: false, error: err.message || "Failed to delete match." };
  }
}

// ======================== EDITORIAL CONTENT ========================

export async function updateEditorialAction(formData) {
  await requireAdmin(ADMIN_PERMISSIONS.EDITORIAL_EDIT);

  const entityType = formData.get("entity_type")?.toLowerCase().trim();
  const id = formData.get("id");
  const content = formData.get("content")?.trim() || null;

  if (!entityType || !id) {
    return { success: false, error: "Entity type and ID are required." };
  }

  const validTypes = ["team", "tournament", "player", "game", "blog"];
  if (!validTypes.includes(entityType)) {
    return { success: false, error: `Invalid entity type: ${entityType}` };
  }

  try {
    const table = entityType === "blog" ? "blogs" : `${entityType}s`;
    const column = entityType === "game" ? "description" : entityType === "blog" ? "content" : "editorial_content";

    const sql = `UPDATE ${table} SET ${column} = $1, updated_at = NOW() WHERE id = $2`;
    await query(sql, [content, id]);

    revalidatePath("/editorial");
    revalidatePath(`/${table}`);
    revalidatePath(`/${table}/${id}`);
    revalidatePath("/overview");

    return { success: true };
  } catch (err) {
    console.error("Error updating editorial content in VPS DB:", err);
    return { success: false, error: err.message || "Failed to update editorial content." };
  }
}
