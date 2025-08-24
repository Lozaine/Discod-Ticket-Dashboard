import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/database';

export async function GET(request: NextRequest) {
  try {
    // Get basic stats
    const guildCountResult = await query('SELECT COUNT(*) as count FROM guild_configs');
    const totalGuilds = parseInt(guildCountResult.rows[0].count);

    const configuredGuildsResult = await query(`
      SELECT COUNT(*) as count FROM guild_configs 
      WHERE category_id IS NOT NULL 
      AND panel_channel_id IS NOT NULL 
      AND transcript_channel_id IS NOT NULL
    `);
    const configuredGuilds = parseInt(configuredGuildsResult.rows[0].count);

    const totalTicketsResult = await query('SELECT COUNT(*) as count FROM ticket_logs');
    const totalTickets = parseInt(totalTicketsResult.rows[0].count);

    const openTicketsResult = await query(`SELECT COUNT(*) as count FROM ticket_logs WHERE status = 'open'`);
    const openTickets = parseInt(openTicketsResult.rows[0].count);

    const closedTicketsResult = await query(`SELECT COUNT(*) as count FROM ticket_logs WHERE status = 'closed'`);
    const closedTickets = parseInt(closedTicketsResult.rows[0].count);

    // Get ticket stats by type
    const ticketTypeStatsResult = await query(`
      SELECT 
        ticket_type,
        COUNT(*) as count,
        COUNT(CASE WHEN status = 'open' THEN 1 END) as open_count,
        COUNT(CASE WHEN status = 'closed' THEN 1 END) as closed_count
      FROM ticket_logs 
      WHERE ticket_type IS NOT NULL
      GROUP BY ticket_type
      ORDER BY count DESC
    `);

    // Get daily ticket creation stats (last 7 days)
    const dailyStatsResult = await query(`
      SELECT 
        DATE(created_at) as date,
        COUNT(*) as tickets_created,
        COUNT(CASE WHEN closed_at IS NOT NULL THEN 1 END) as tickets_closed
      FROM ticket_logs 
      WHERE created_at >= CURRENT_DATE - INTERVAL '7 days'
      GROUP BY DATE(created_at)
      ORDER BY date
    `);

    // Get most active guilds
    const topGuildsResult = await query(`
      SELECT 
        tl.guild_id,
        gc.guild_id as configured_guild,
        COUNT(*) as ticket_count,
        COUNT(CASE WHEN tl.status = 'open' THEN 1 END) as open_tickets,
        MAX(tl.created_at) as last_ticket_created
      FROM ticket_logs tl
      LEFT JOIN guild_configs gc ON tl.guild_id = gc.guild_id
      GROUP BY tl.guild_id, gc.guild_id
      ORDER BY ticket_count DESC
      LIMIT 10
    `);

    // Calculate average ticket resolution time
    const avgResolutionResult = await query(`
      SELECT 
        AVG(EXTRACT(EPOCH FROM (closed_at - created_at))) as avg_seconds
      FROM ticket_logs 
      WHERE closed_at IS NOT NULL AND created_at IS NOT NULL
    `);

    const avgResolutionTime = avgResolutionResult.rows[0].avg_seconds 
      ? Math.round(avgResolutionResult.rows[0].avg_seconds / 3600) // Convert to hours
      : 0;

    return NextResponse.json({
      overview: {
        totalGuilds,
        configuredGuilds,
        totalTickets,
        openTickets,
        closedTickets,
        avgResolutionHours: avgResolutionTime,
      },
      ticketTypes: ticketTypeStatsResult.rows,
      dailyStats: dailyStatsResult.rows,
      topGuilds: topGuildsResult.rows.map(row => ({
        guildId: row.guild_id,
        isConfigured: row.configured_guild !== null,
        ticketCount: parseInt(row.ticket_count),
        openTickets: parseInt(row.open_tickets),
        lastTicketCreated: row.last_ticket_created,
      })),
    });

  } catch (error) {
    console.error('Database error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch statistics' },
      { status: 500 }
    );
  }
}