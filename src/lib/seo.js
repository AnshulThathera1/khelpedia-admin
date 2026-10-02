import { query } from "./db";

// ---------------------------------------------------------
// SHARED INDEXABILITY RULES — SINGLE SOURCE OF TRUTH
// These conditions are shared between Sitemaps, Metadata,
// and Admin SEO Audit to ensure 100% synchronization.
// ---------------------------------------------------------

/**
 * Tournament Indexability Predicate:
 * - Editorial lore/analysis > 100 chars
 *   OR
 * - At least 3 verified competitive matches recorded for this tournament
 *   (Guarantees full brackets/results to display, filtering out empty stubs
 *    and single-match undated sub-stage brackets).
 */
export const TOURNAMENT_INDEXABLE_SQL = `
  LENGTH(TRIM(COALESCE(t.editorial_content, ''))) > 100
  OR (
    EXISTS (
      SELECT 1 FROM matches m 
      WHERE m.tournament_id = t.id 
      HAVING COUNT(m.id) >= 3
    )
  )
`;

/**
 * Team Indexability Predicate:
 * - Editorial lore/analysis > 100 chars
 *   OR
 * - Active verified player roster in players table AND at least 1 match
 *   OR
 * - At least 3 verified competitive matches recorded in matches table
 *   (Guarantees substantial performance summary, recent match results,
 *    opponent history, and tournament appearances).
 */
export const TEAM_INDEXABLE_SQL = `
  LENGTH(TRIM(COALESCE(t.editorial_content, ''))) > 100
  OR (
    EXISTS (SELECT 1 FROM players p WHERE p.team_id = t.id)
    AND EXISTS (SELECT 1 FROM matches m WHERE m.team1_id = t.id OR m.team2_id = t.id HAVING COUNT(m.id) >= 1)
  )
  OR (
    EXISTS (
      SELECT 1 FROM matches m 
      WHERE (m.team1_id = t.id OR m.team2_id = t.id) 
      HAVING COUNT(m.id) >= 3
    )
  )
`;

/**
 * Player Indexability Predicate:
 * - Valid IGN AND (telemetry matches > 0 OR editorial content > 100 chars)
 */
export const PLAYER_INDEXABLE_SQL = `
  p.ign IS NOT NULL AND TRIM(p.ign) != ''
  AND (
    EXISTS (SELECT 1 FROM player_stats ps WHERE ps.player_id = p.id AND ps.matches_played > 0)
    OR LENGTH(TRIM(COALESCE(p.editorial_content, ''))) > 100
  )
`;

/**
 * Blog Article Indexability Predicate:
 * - Published status is true
 */
export const BLOG_INDEXABLE_SQL = `
  b.is_published = true
`;

export const TOURNAMENT_CRITERIA_DESCRIPTION =
  "editorial_content > 100 chars OR matches >= 3";

export const TEAM_CRITERIA_DESCRIPTION =
  "editorial_content > 100 chars OR (active roster + matches >= 1) OR matches >= 3";

export const PLAYER_CRITERIA_DESCRIPTION =
  "ign != '' AND (player_stats matches > 0 OR editorial_content > 100 chars)";

export const BLOG_CRITERIA_DESCRIPTION =
  "is_published = true";
