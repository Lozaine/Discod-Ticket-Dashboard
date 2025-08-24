import { Pool } from 'pg';

let pool: Pool | null = null;

export function getPool() {
  if (!pool) {
    const databaseUrl = process.env.DATABASE_URL;
    
    if (!databaseUrl) {
      throw new Error('DATABASE_URL environment variable is not set');
    }

    // Parse the DATABASE_URL to extract connection details
    const url = new URL(databaseUrl);
    
    pool = new Pool({
      host: url.hostname,
      port: parseInt(url.port) || 5432,
      database: url.pathname.slice(1), // Remove the leading '/'
      user: url.username,
      password: url.password,
      ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false,
      max: 10,
      idleTimeoutMillis: 30000,
      connectionTimeoutMillis: 2000,
    });
  }

  return pool;
}

export async function query(text: string, params?: any[]) {
  const pool = getPool();
  const client = await pool.connect();
  
  try {
    const result = await client.query(text, params);
    return result;
  } finally {
    client.release();
  }
}

// Types for database entities
export interface GuildConfig {
  guild_id: string;
  category_id: string | null;
  panel_channel_id: string | null;
  transcript_channel_id: string | null;
  ticket_counter: number;
  created_at: Date;
  updated_at: Date;
}

export interface SupportRole {
  id: number;
  guild_id: string;
  role_id: string;
}

export interface TicketLog {
  id: number;
  guild_id: string;
  channel_id: string | null;
  channel_name: string | null;
  owner_id: string | null;
  ticket_type: string | null;
  ticket_number: number | null;
  created_at: Date;
  closed_at: Date | null;
  closed_by: string | null;
  status: string;
}