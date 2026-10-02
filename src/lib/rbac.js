/**
 * KhelPediA Admin — Role-Based Access Control (RBAC) System
 *
 * Provides roles, granular permissions, role resolution,
 * and server/client-side permission verification.
 */

export const ADMIN_ROLES = {
  SUPER_ADMIN: 'SUPER_ADMIN',
  ADMIN: 'ADMIN',
  EDITOR: 'EDITOR',
  MODERATOR: 'MODERATOR',
  ANALYST: 'ANALYST',
  CONTENT_MANAGER: 'CONTENT_MANAGER',
  DATA_MANAGER: 'DATA_MANAGER',
  AD_VIEWER: 'AD_VIEWER',
};

export const ROLE_METADATA = {
  [ADMIN_ROLES.SUPER_ADMIN]: {
    name: 'Super Administrator',
    description: 'Unrestricted full administrative access across all modules, settings, and users.',
    badgeClass: 'bg-red-500/10 text-red-500 border-red-500/20',
  },
  [ADMIN_ROLES.ADMIN]: {
    name: 'Administrator',
    description: 'Broad administrative privileges for entities, content, SEO, and operations.',
    badgeClass: 'bg-amber-500/10 text-amber-500 border-amber-500/20',
  },
  [ADMIN_ROLES.EDITOR]: {
    name: 'Editorial Lead',
    description: 'Manage and publish blogs, editorial copy, and related media assets.',
    badgeClass: 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20',
  },
  [ADMIN_ROLES.MODERATOR]: {
    name: 'Moderator',
    description: 'User oversight, account status, and platform activity review.',
    badgeClass: 'bg-blue-500/10 text-blue-500 border-blue-500/20',
  },
  [ADMIN_ROLES.ANALYST]: {
    name: 'Data Analyst',
    description: 'Read-only access to matches, statistics, and data quality dashboards.',
    badgeClass: 'bg-purple-500/10 text-purple-500 border-purple-500/20',
  },
  [ADMIN_ROLES.CONTENT_MANAGER]: {
    name: 'Content Manager',
    description: 'Draft and edit entity content, blogs, and marketing placements.',
    badgeClass: 'bg-cyan-500/10 text-cyan-500 border-cyan-500/20',
  },
  [ADMIN_ROLES.DATA_MANAGER]: {
    name: 'Data Manager',
    description: 'Maintain teams, players, tournaments, games, and data quality.',
    badgeClass: 'bg-indigo-500/10 text-indigo-500 border-indigo-500/20',
  },
  [ADMIN_ROLES.AD_VIEWER]: {
    name: 'Advertising Viewer',
    description: 'Read-only visibility into ad unit performance and placements.',
    badgeClass: 'bg-zinc-500/10 text-zinc-400 border-zinc-500/20',
  },
};

export const ADMIN_PERMISSIONS = {
  // Dashboard
  DASHBOARD_VIEW: 'dashboard.view',

  // Users
  USERS_VIEW: 'users.view',
  USERS_CREATE: 'users.create',
  USERS_EDIT: 'users.edit',
  USERS_SUSPEND: 'users.suspend',
  USERS_DELETE: 'users.delete',

  // Teams
  TEAMS_VIEW: 'teams.view',
  TEAMS_CREATE: 'teams.create',
  TEAMS_EDIT: 'teams.edit',
  TEAMS_DELETE: 'teams.delete',

  // Players
  PLAYERS_VIEW: 'players.view',
  PLAYERS_CREATE: 'players.create',
  PLAYERS_EDIT: 'players.edit',
  PLAYERS_DELETE: 'players.delete',

  // Tournaments
  TOURNAMENTS_VIEW: 'tournaments.view',
  TOURNAMENTS_CREATE: 'tournaments.create',
  TOURNAMENTS_EDIT: 'tournaments.edit',
  TOURNAMENTS_DELETE: 'tournaments.delete',

  // Games
  GAMES_VIEW: 'games.view',
  GAMES_CREATE: 'games.create',
  GAMES_EDIT: 'games.edit',
  GAMES_DELETE: 'games.delete',

  // Matches
  MATCHES_VIEW: 'matches.view',
  MATCHES_CREATE: 'matches.create',
  MATCHES_EDIT: 'matches.edit',
  MATCHES_DELETE: 'matches.delete',

  // Blogs
  BLOGS_VIEW: 'blogs.view',
  BLOGS_CREATE: 'blogs.create',
  BLOGS_EDIT: 'blogs.edit',
  BLOGS_PUBLISH: 'blogs.publish',
  BLOGS_DELETE: 'blogs.delete',

  // Editorial
  EDITORIAL_VIEW: 'editorial.view',
  EDITORIAL_EDIT: 'editorial.edit',

  // Media
  MEDIA_VIEW: 'media.view',
  MEDIA_UPLOAD: 'media.upload',
  MEDIA_DELETE: 'media.delete',

  // SEO & Indexability
  SEO_VIEW: 'seo.view',
  SEO_EDIT: 'seo.edit',

  // Advertising
  ADS_VIEW: 'ads.view',
  ADS_EDIT: 'ads.edit',

  // Ingestion & Automation
  INGESTION_VIEW: 'ingestion.view',
  INGESTION_RUN: 'ingestion.run',

  // System
  SYSTEM_VIEW: 'system.view',
  SYSTEM_MANAGE: 'system.manage',

  // Audit Logs
  AUDIT_VIEW: 'audit.view',

  // Data Quality
  DATA_QUALITY_VIEW: 'data_quality.view',

  // RBAC Management
  ROLES_VIEW: 'roles.view',
  ROLES_MANAGE: 'roles.manage',
};

// Map roles to their granted permissions
export const ROLE_PERMISSIONS = {
  [ADMIN_ROLES.SUPER_ADMIN]: ['*'], // Wildcard matches all permissions

  [ADMIN_ROLES.ADMIN]: [
    ADMIN_PERMISSIONS.DASHBOARD_VIEW,
    ADMIN_PERMISSIONS.USERS_VIEW,
    ADMIN_PERMISSIONS.USERS_EDIT,
    ADMIN_PERMISSIONS.USERS_SUSPEND,
    ADMIN_PERMISSIONS.TEAMS_VIEW,
    ADMIN_PERMISSIONS.TEAMS_CREATE,
    ADMIN_PERMISSIONS.TEAMS_EDIT,
    ADMIN_PERMISSIONS.TEAMS_DELETE,
    ADMIN_PERMISSIONS.PLAYERS_VIEW,
    ADMIN_PERMISSIONS.PLAYERS_CREATE,
    ADMIN_PERMISSIONS.PLAYERS_EDIT,
    ADMIN_PERMISSIONS.PLAYERS_DELETE,
    ADMIN_PERMISSIONS.TOURNAMENTS_VIEW,
    ADMIN_PERMISSIONS.TOURNAMENTS_CREATE,
    ADMIN_PERMISSIONS.TOURNAMENTS_EDIT,
    ADMIN_PERMISSIONS.TOURNAMENTS_DELETE,
    ADMIN_PERMISSIONS.GAMES_VIEW,
    ADMIN_PERMISSIONS.GAMES_CREATE,
    ADMIN_PERMISSIONS.GAMES_EDIT,
    ADMIN_PERMISSIONS.MATCHES_VIEW,
    ADMIN_PERMISSIONS.MATCHES_CREATE,
    ADMIN_PERMISSIONS.MATCHES_EDIT,
    ADMIN_PERMISSIONS.BLOGS_VIEW,
    ADMIN_PERMISSIONS.BLOGS_CREATE,
    ADMIN_PERMISSIONS.BLOGS_EDIT,
    ADMIN_PERMISSIONS.BLOGS_PUBLISH,
    ADMIN_PERMISSIONS.BLOGS_DELETE,
    ADMIN_PERMISSIONS.EDITORIAL_VIEW,
    ADMIN_PERMISSIONS.EDITORIAL_EDIT,
    ADMIN_PERMISSIONS.MEDIA_VIEW,
    ADMIN_PERMISSIONS.MEDIA_UPLOAD,
    ADMIN_PERMISSIONS.MEDIA_DELETE,
    ADMIN_PERMISSIONS.SEO_VIEW,
    ADMIN_PERMISSIONS.SEO_EDIT,
    ADMIN_PERMISSIONS.ADS_VIEW,
    ADMIN_PERMISSIONS.ADS_EDIT,
    ADMIN_PERMISSIONS.INGESTION_VIEW,
    ADMIN_PERMISSIONS.INGESTION_RUN,
    ADMIN_PERMISSIONS.SYSTEM_VIEW,
    ADMIN_PERMISSIONS.SYSTEM_MANAGE,
    ADMIN_PERMISSIONS.AUDIT_VIEW,
    ADMIN_PERMISSIONS.DATA_QUALITY_VIEW,
    ADMIN_PERMISSIONS.ROLES_VIEW,
  ],

  [ADMIN_ROLES.EDITOR]: [
    ADMIN_PERMISSIONS.DASHBOARD_VIEW,
    ADMIN_PERMISSIONS.BLOGS_VIEW,
    ADMIN_PERMISSIONS.BLOGS_CREATE,
    ADMIN_PERMISSIONS.BLOGS_EDIT,
    ADMIN_PERMISSIONS.BLOGS_PUBLISH,
    ADMIN_PERMISSIONS.EDITORIAL_VIEW,
    ADMIN_PERMISSIONS.EDITORIAL_EDIT,
    ADMIN_PERMISSIONS.MEDIA_VIEW,
    ADMIN_PERMISSIONS.MEDIA_UPLOAD,
    ADMIN_PERMISSIONS.TEAMS_VIEW,
    ADMIN_PERMISSIONS.PLAYERS_VIEW,
    ADMIN_PERMISSIONS.TOURNAMENTS_VIEW,
    ADMIN_PERMISSIONS.GAMES_VIEW,
  ],

  [ADMIN_ROLES.CONTENT_MANAGER]: [
    ADMIN_PERMISSIONS.DASHBOARD_VIEW,
    ADMIN_PERMISSIONS.BLOGS_VIEW,
    ADMIN_PERMISSIONS.BLOGS_CREATE,
    ADMIN_PERMISSIONS.BLOGS_EDIT,
    ADMIN_PERMISSIONS.BLOGS_PUBLISH,
    ADMIN_PERMISSIONS.BLOGS_DELETE,
    ADMIN_PERMISSIONS.EDITORIAL_VIEW,
    ADMIN_PERMISSIONS.EDITORIAL_EDIT,
    ADMIN_PERMISSIONS.MEDIA_VIEW,
    ADMIN_PERMISSIONS.MEDIA_UPLOAD,
    ADMIN_PERMISSIONS.MEDIA_DELETE,
    ADMIN_PERMISSIONS.TEAMS_VIEW,
    ADMIN_PERMISSIONS.TEAMS_EDIT,
    ADMIN_PERMISSIONS.PLAYERS_VIEW,
    ADMIN_PERMISSIONS.PLAYERS_EDIT,
    ADMIN_PERMISSIONS.TOURNAMENTS_VIEW,
    ADMIN_PERMISSIONS.TOURNAMENTS_EDIT,
  ],

  [ADMIN_ROLES.DATA_MANAGER]: [
    ADMIN_PERMISSIONS.DASHBOARD_VIEW,
    ADMIN_PERMISSIONS.TEAMS_VIEW,
    ADMIN_PERMISSIONS.TEAMS_CREATE,
    ADMIN_PERMISSIONS.TEAMS_EDIT,
    ADMIN_PERMISSIONS.PLAYERS_VIEW,
    ADMIN_PERMISSIONS.PLAYERS_CREATE,
    ADMIN_PERMISSIONS.PLAYERS_EDIT,
    ADMIN_PERMISSIONS.TOURNAMENTS_VIEW,
    ADMIN_PERMISSIONS.TOURNAMENTS_CREATE,
    ADMIN_PERMISSIONS.TOURNAMENTS_EDIT,
    ADMIN_PERMISSIONS.GAMES_VIEW,
    ADMIN_PERMISSIONS.GAMES_CREATE,
    ADMIN_PERMISSIONS.GAMES_EDIT,
    ADMIN_PERMISSIONS.MATCHES_VIEW,
    ADMIN_PERMISSIONS.MATCHES_CREATE,
    ADMIN_PERMISSIONS.MATCHES_EDIT,
    ADMIN_PERMISSIONS.DATA_QUALITY_VIEW,
    ADMIN_PERMISSIONS.INGESTION_VIEW,
    ADMIN_PERMISSIONS.INGESTION_RUN,
  ],

  [ADMIN_ROLES.MODERATOR]: [
    ADMIN_PERMISSIONS.DASHBOARD_VIEW,
    ADMIN_PERMISSIONS.USERS_VIEW,
    ADMIN_PERMISSIONS.USERS_SUSPEND,
    ADMIN_PERMISSIONS.BLOGS_VIEW,
    ADMIN_PERMISSIONS.AUDIT_VIEW,
  ],

  [ADMIN_ROLES.ANALYST]: [
    ADMIN_PERMISSIONS.DASHBOARD_VIEW,
    ADMIN_PERMISSIONS.MATCHES_VIEW,
    ADMIN_PERMISSIONS.TEAMS_VIEW,
    ADMIN_PERMISSIONS.PLAYERS_VIEW,
    ADMIN_PERMISSIONS.TOURNAMENTS_VIEW,
    ADMIN_PERMISSIONS.GAMES_VIEW,
    ADMIN_PERMISSIONS.AUDIT_VIEW,
    ADMIN_PERMISSIONS.DATA_QUALITY_VIEW,
  ],

  [ADMIN_ROLES.AD_VIEWER]: [
    ADMIN_PERMISSIONS.DASHBOARD_VIEW,
    ADMIN_PERMISSIONS.ADS_VIEW,
  ],
};

/**
 * Determine the user's role from their profile and user metadata.
 * Bootstraps: profiles.is_admin === true -> SUPER_ADMIN
 */
export function resolveUserRole(profile, user = null) {
  if (!profile) return null;

  // If explicitly flagged as is_admin = true, grant SUPER_ADMIN
  if (profile.is_admin === true) {
    return ADMIN_ROLES.SUPER_ADMIN;
  }

  // Check custom role field if present
  if (profile.role && ADMIN_ROLES[profile.role]) {
    return profile.role;
  }

  // Check app_metadata on the auth user object if present
  if (user?.app_metadata?.admin_role && ADMIN_ROLES[user.app_metadata.admin_role]) {
    return user.app_metadata.admin_role;
  }

  return null;
}

/**
 * Check if a role has a given permission.
 */
export function hasPermission(role, permission) {
  if (!role) return false;

  const permissions = ROLE_PERMISSIONS[role] || [];
  if (permissions.includes('*')) return true;

  return permissions.includes(permission);
}

/**
 * Check if a user has any of the allowed roles.
 */
export function hasRole(role, allowedRoles = []) {
  if (!role) return false;
  if (role === ADMIN_ROLES.SUPER_ADMIN) return true;

  if (Array.isArray(allowedRoles)) {
    return allowedRoles.includes(role);
  }
  return role === allowedRoles;
}

/**
 * Get all permissions granted to a role.
 */
export function getPermissionsForRole(role) {
  if (!role) return [];
  if (role === ADMIN_ROLES.SUPER_ADMIN) {
    return Object.values(ADMIN_PERMISSIONS);
  }
  return ROLE_PERMISSIONS[role] || [];
}
