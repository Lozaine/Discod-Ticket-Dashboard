import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/database';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const search = searchParams.get('search') || '';
    const offset = (page - 1) * limit;

    let whereClause = '';
    let queryParams: any[] = [limit, offset];

    if (search) {
      whereClause = 'WHERE gc.guild_id ILIKE $3';
      queryParams.push(`%${search}%`);
    }

    const guildsResult = await query(`
      SELECT 
        gc.*,
        COUNT(sr.id) as support_role_count,
        COUNT(tl.id) as total_tickets,
        COUNT(CASE WHEN tl.status = 'open' THEN 1 END) as open_tickets,
        MAX(tl.created_at) as last_ticket_created
      FROM guild_configs gc
      LEFT JOIN support_roles sr ON gc.guild_id = sr.guild_id
      LEFT JOIN ticket_logs tl ON gc.guild_id = tl.guild_id
      ${whereClause}
      GROUP BY gc.guild_id, gc.category_id, gc.panel_channel_id, gc.transcript_channel_id, 
               gc.ticket_counter, gc.created_at, gc.updated_at
      ORDER BY gc.updated_at DESC
      LIMIT $1 OFFSET $2
    `, queryParams);

    // Get support roles for each guild
    const guildsWithRoles = await Promise.all(
      guildsResult.rows.map(async (guild) => {
        const rolesResult = await query(
          'SELECT role_id FROM support_roles WHERE guild_id = $1',
          [guild.guild_id]
        );
        
        return {
          ...guild,
          support_roles: rolesResult.rows.map(r => r.role_id),
          total_tickets: parseInt(guild.total_tickets) || 0,
          open_tickets: parseInt(guild.open_tickets) || 0,
          support_role_count: parseInt(guild.support_role_count) || 0,
          is_configured: !!(guild.category_id && guild.panel_channel_id && guild.transcript_channel_id),
        };
      })
    );

    // Get total count for pagination
    const countResult = await query(`
      SELECT COUNT(DISTINCT gc.guild_id) as total
      FROM guild_configs gc
      ${whereClause}
    `, search ? [`%${search}%`] : []);

    const totalCount = parseInt(countResult.rows[0].total);
    const totalPages = Math.ceil(totalCount / limit);

    return NextResponse.json({
      guilds: guildsWithRoles,
      pagination: {
        currentPage: page,
        totalPages,
        totalCount,
        hasNext: page < totalPages,
        hasPrev: page > 1,
      },
    });

  } catch (error) {
    console.error('Database error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch guilds' },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const guildId = searchParams.get('guildId');

    if (!guildId) {
      return NextResponse.json(
        { error: 'Guild ID is required' },
        { status: 400 }
      );
    }

    // Delete guild configuration (cascades to support_roles)
    await query('DELETE FROM guild_configs WHERE guild_id = $1', [guildId]);

    return NextResponse.json({ success: true });

  } catch (error) {
    console.error('Database error:', error);
    return NextResponse.json(
      { error: 'Failed to delete guild' },
      { status: 500 }
    );
  }
}