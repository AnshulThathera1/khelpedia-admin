import { createAdminClient } from '../utils/supabase/admin.js'
import { query } from './db.js'

/**
 * System and Database Health Diagnostics
 * Performs safe, read-only health checks and returns latency and status metrics.
 */
export async function getSystemHealth() {
  const startTime = Date.now()
  let dbStatus = 'disconnected'
  let dbLatencyMs = null
  let tableCounts = {}
  let dbError = null

  let authStatus = 'unknown'
  let authLatencyMs = null

  try {
    // 1. VPS Primary PostgreSQL DB Check
    const pingStart = Date.now()
    const countsRes = await query(`
      SELECT
        (SELECT COUNT(*) FROM matches) as matches,
        (SELECT COUNT(*) FROM tournaments) as tournaments,
        (SELECT COUNT(*) FROM teams) as teams,
        (SELECT COUNT(*) FROM blogs) as blogs,
        (SELECT COUNT(*) FROM players) as players,
        (SELECT COUNT(*) FROM games) as games
    `)
    dbLatencyMs = Date.now() - pingStart
    dbStatus = 'healthy'

    if (countsRes.rows && countsRes.rows[0]) {
      const r = countsRes.rows[0]
      tableCounts = {
        matches: parseInt(r.matches || '0', 10),
        tournaments: parseInt(r.tournaments || '0', 10),
        teams: parseInt(r.teams || '0', 10),
        blogs: parseInt(r.blogs || '0', 10),
        players: parseInt(r.players || '0', 10),
        games: parseInt(r.games || '0', 10),
      }
    }
  } catch (err) {
    dbStatus = 'error'
    dbError = err.message
    console.error('VPS PostgreSQL health check error:', err)
  }

  // 2. Supabase Auth Ping
  try {
    const authStart = Date.now()
    const adminDb = createAdminClient()
    const { count } = await adminDb.from('profiles').select('id', { count: 'exact', head: true })
    authLatencyMs = Date.now() - authStart
    authStatus = 'healthy'
    tableCounts.profiles = count ?? 0
  } catch (err) {
    authStatus = 'degraded'
  }

  const memory = process.memoryUsage()

  return {
    timestamp: new Date().toISOString(),
    checkDurationMs: Date.now() - startTime,
    application: {
      name: 'KhelPediA Control Center',
      version: '1.0.0',
      status: 'operational',
      environment: process.env.NODE_ENV || 'production',
      port: 3001,
      networkMode: 'Internal Network Only',
      uptimeSeconds: Math.floor(process.uptime()),
    },
    runtime: {
      nodeVersion: process.version,
      platform: process.platform,
      arch: process.arch,
      memory: {
        rssMb: Math.round(memory.rss / (1024 * 1024)),
        heapUsedMb: Math.round(memory.heapUsed / (1024 * 1024)),
        heapTotalMb: Math.round(memory.heapTotal / (1024 * 1024)),
      },
    },
    database: {
      provider: 'VPS PostgreSQL (88.222.245.63:5433/khelpedia)',
      status: dbStatus,
      latencyMs: dbLatencyMs,
      error: dbError,
      tableCounts,
      totalTrackedRecords: Object.values(tableCounts).reduce((a, b) => a + b, 0),
      authProvider: {
        name: 'Supabase Cloud Auth',
        status: authStatus,
        latencyMs: authLatencyMs,
      },
    },
    security: {
      robotsPolicy: 'Disallow: / (Enforced)',
      antiCrawlerHeaders: 'X-Robots-Tag: noindex, nofollow, noarchive',
      frameOptions: 'DENY',
      rbacStatus: 'Active & Enforced',
      authProvider: 'Supabase SSR Cookies',
    },
  }
}
