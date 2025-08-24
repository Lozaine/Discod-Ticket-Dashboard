import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/database';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');
    const status = searchParams.get('status') || 'all';
    const type = searchParams.get('type') || 'all';
    const guildId = searchParams.get('guildId') || '';
    const search = searchParams.get('search') || '';
    const offset = (page - 1) * limit;

    let whereConditions: string[] = [];
    let queryParams: any[] = [];
    let paramCounter = 1;

    // Build WHERE conditions
    if (status !== 'all') {
      whereConditions.push(`status = $${paramCounter}`);
      queryParams.push(status);
      paramCounter++;
    }

    if (type !== 'all') {
      whereConditions.push(`ticket_type = $${paramCounter}`);
      queryParams.push(type);
      paramCounter++;
    }

    if (guildId) {
      whereConditions.push(`guild_id = $${paramCounter}`);
      queryParams.push(guildId);
      paramCounter++;
    }

    if (search) {
      whereConditions.push(`(channel_name ILIKE $${paramCounter} OR owner_id ILIKE $${paramCounter})`);
      queryParams.push(`%${search}%`);
      paramCounter++;
    }

    const whereClause = whereConditions.length > 0 
      ? `WHERE ${whereConditions.join(' AND ')}`
      : '';

    // Add limit and offset
    queryParams.push(limit, offset);

    const ticketsResult = await query(`
      SELECT 
        *,
        CASE 
          WHEN closed_at IS NOT NULL AND created_at IS NOT NULL 
          THEN EXTRACT(EPOCH FROM (closed_at - created_at)) / 3600 
          ELSE NULL 
        END as resolution_hours
      FROM ticket_logs 
      ${whereClause}
      ORDER BY created_at DESC
      LIMIT $${paramCounter} OFFSET $${paramCounter + 1}
    `, queryParams);

    // Get total count for pagination
    const countResult = await query(`
      SELECT COUNT(*) as total
      FROM ticket_logs 
      ${whereClause}
    `, queryParams.slice(0, -2)); // Remove limit and offset

    const totalCount = parseInt(countResult.rows[0].total);
    const totalPages = Math.ceil(totalCount / limit);

    // Process tickets data
    const tickets = ticketsResult.rows.map(ticket => ({
      ...ticket,
      resolution_hours: ticket.resolution_hours ? Math.round(ticket.resolution_hours * 100) / 100 : null,
    }));

    return NextResponse.json({
      tickets,
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
      { error: 'Failed to fetch tickets' },
      { status: 500 }
    );
  }
}

// Create manual ticket log (for testing or manual entry)
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      guild_id,
      channel_id,
      channel_name,
      owner_id,
      ticket_type,
      ticket_number,
      status = 'open'
    } = body;

    if (!guild_id || !owner_id) {
      return NextResponse.json(
        { error: 'guild_id and owner_id are required' },
        { status: 400 }
      );
    }

    const result = await query(`
      INSERT INTO ticket_logs 
      (guild_id, channel_id, channel_name, owner_id, ticket_type, ticket_number, status)
      VALUES ($1, $2, $3, $4, $5, $6, $7)
      RETURNING *
    `, [guild_id, channel_id, channel_name, owner_id, ticket_type, ticket_number, status]);

    return NextResponse.json({
      success: true,
      ticket: result.rows[0],
    });

  } catch (error) {
    console.error('Database error:', error);
    return NextResponse.json(
      { error: 'Failed to create ticket log' },
      { status: 500 }
    );
  }
}