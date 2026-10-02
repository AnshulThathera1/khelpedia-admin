import { query } from './db.js'

/**
 * Safe Delete & Dependency Audit Service (VPS PostgreSQL)
 * Enforces strict foreign-key dependency verification before permitting deletion.
 */

export async function checkTeamDependencies(teamId) {
  try {
    const [playersRes, matchesRes, tourneyTeamsRes] = await Promise.all([
      query("SELECT COUNT(*) FROM players WHERE team_id = $1", [teamId]),
      query("SELECT COUNT(*) FROM matches WHERE team1_id = $1 OR team2_id = $1 OR winner_id = $1", [teamId]),
      query("SELECT COUNT(*) FROM tournament_teams WHERE team_id = $1", [teamId]),
    ]);

    const playersCount = parseInt(playersRes.rows[0]?.count || "0", 10);
    const matchesCount = parseInt(matchesRes.rows[0]?.count || "0", 10);
    const tourneyTeamsCount = parseInt(tourneyTeamsRes.rows[0]?.count || "0", 10);
    const totalRefs = playersCount + matchesCount + tourneyTeamsCount;

    return {
      canDelete: totalRefs === 0,
      totalDependencies: totalRefs,
      details: {
        playersCount,
        matchesCount,
        tourneyTeamsCount,
      },
      warning:
        totalRefs > 0
          ? `This team cannot be deleted because it is referenced by ${totalRefs} records (${playersCount} players, ${matchesCount} matches, ${tourneyTeamsCount} tournament participations).`
          : null,
    };
  } catch (err) {
    console.error("Error checking team dependencies in VPS DB:", err);
    return { canDelete: false, totalDependencies: 1, details: {}, warning: "Error checking dependencies in database." };
  }
}

export async function checkTournamentDependencies(tournamentId) {
  try {
    const [matchesRes, teamsRes] = await Promise.all([
      query("SELECT COUNT(*) FROM matches WHERE tournament_id = $1", [tournamentId]),
      query("SELECT COUNT(*) FROM tournament_teams WHERE tournament_id = $1", [tournamentId]),
    ]);

    const matchesCount = parseInt(matchesRes.rows[0]?.count || "0", 10);
    const teamsCount = parseInt(teamsRes.rows[0]?.count || "0", 10);
    const totalRefs = matchesCount + teamsCount;

    return {
      canDelete: totalRefs === 0,
      totalDependencies: totalRefs,
      details: {
        matchesCount,
        teamsCount,
      },
      warning:
        totalRefs > 0
          ? `This tournament cannot be deleted because it is referenced by ${totalRefs} records (${matchesCount} matches, ${teamsCount} team enrollments).`
          : null,
    };
  } catch (err) {
    console.error("Error checking tournament dependencies in VPS DB:", err);
    return { canDelete: false, totalDependencies: 1, details: {}, warning: "Error checking dependencies in database." };
  }
}

export async function checkPlayerDependencies(playerId) {
  try {
    const statsRes = await query("SELECT COUNT(*) FROM player_stats WHERE player_id = $1", [playerId]);
    const statsCount = parseInt(statsRes.rows[0]?.count || "0", 10);

    return {
      canDelete: statsCount === 0,
      totalDependencies: statsCount,
      details: {
        statsCount,
      },
      warning:
        statsCount > 0
          ? `This player cannot be deleted because they have ${statsCount} linked statistical match records.`
          : null,
    };
  } catch (err) {
    console.error("Error checking player dependencies in VPS DB:", err);
    return { canDelete: false, totalDependencies: 1, details: {}, warning: "Error checking dependencies in database." };
  }
}

export async function checkGameDependencies(gameId) {
  try {
    const tourneysRes = await query("SELECT COUNT(*) FROM tournaments WHERE game_id = $1", [gameId]);
    const tournamentsCount = parseInt(tourneysRes.rows[0]?.count || "0", 10);

    return {
      canDelete: tournamentsCount === 0,
      totalDependencies: tournamentsCount,
      details: {
        tournamentsCount,
      },
      warning:
        tournamentsCount > 0
          ? `This game cannot be deleted because it has ${tournamentsCount} active or archived tournaments associated with it.`
          : null,
    };
  } catch (err) {
    console.error("Error checking game dependencies in VPS DB:", err);
    return { canDelete: false, totalDependencies: 1, details: {}, warning: "Error checking dependencies in database." };
  }
}

export async function checkMatchDependencies(matchId) {
  try {
    const matchPlayersRes = await query("SELECT COUNT(*) FROM match_players WHERE match_id = $1", [matchId]);
    const matchPlayersCount = parseInt(matchPlayersRes.rows[0]?.count || "0", 10);

    return {
      canDelete: matchPlayersCount === 0,
      totalDependencies: matchPlayersCount,
      details: {
        matchPlayersCount,
      },
      warning:
        matchPlayersCount > 0
          ? `This match cannot be deleted because it has ${matchPlayersCount} linked player performance records in match_players.`
          : null,
    };
  } catch (err) {
    console.error("Error checking match dependencies in VPS DB:", err);
    return { canDelete: false, totalDependencies: 1, details: {}, warning: "Error checking dependencies in database." };
  }
}
