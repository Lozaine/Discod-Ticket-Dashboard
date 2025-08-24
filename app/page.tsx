'use client';

import { useState, useEffect } from 'react';
import {
  Ticket,
  Activity,
  Server,
  Users,
  Clock,
  TrendingUp,
  PieChart as LucidePieChart,
} from 'lucide-react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieChart as RechartsPieChart,
  Pie,
  Cell,
} from 'recharts';

interface DashboardStats {
  overview: {
    totalGuilds: number;
    configuredGuilds: number;
    totalTickets: number;
    openTickets: number;
    closedTickets: number;
    avgResolutionHours: number;
  };
  ticketTypes: Array<{
    ticket_type: string;
    count: string;
    open_count: string;
    closed_count: string;
  }>;
  dailyStats: Array<{
    date: string;
    tickets_created: string;
    tickets_closed: string;
  }>;
  topGuilds: Array<{
    guildId: string;
    isConfigured: boolean;
    ticketCount: number;
    openTickets: number;
    lastTicketCreated: string;
  }>;
}

const COLORS = ['#5865F2', '#57F287', '#ED4245', '#FEE75C'];

export default function Dashboard() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/stats');
      if (!response.ok) throw new Error('Failed to fetch stats');
      const data = await response.json();
      setStats(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-discord-dark to-discord-darker flex items-center justify-center">
        <div className="text-center text-white">
          <div className="loading-spinner mx-auto mb-4" />
          <p className="text-lg">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-discord-dark to-discord-darker flex items-center justify-center">
        <div className="text-center text-white">
          <div className="text-discord-red mb-4">
            <LucidePieChart className="w-16 h-16 mx-auto mb-2" />
          </div>
          <h1 className="text-2xl font-bold mb-2">Dashboard Error</h1>
          <p className="text-gray-300 mb-4">{error}</p>
          <button
            onClick={fetchStats}
            className="bg-discord-blue hover:bg-blue-600 text-white px-6 py-2 rounded-lg transition-colors"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  const ticketTypeData = stats?.ticketTypes.map(type => ({
    name: type.ticket_type,
    value: parseInt(type.count),
    open: parseInt(type.open_count),
    closed: parseInt(type.closed_count),
  })) || [];

  const dailyData = stats?.dailyStats.map(day => ({
    date: new Date(day.date).toLocaleDateString(),
    created: parseInt(day.tickets_created),
    closed: parseInt(day.tickets_closed),
  })) || [];

  return (
    <div className="min-h-screen bg-gradient-to-br from-discord-dark to-discord-darker text-white">
      {/* Header */}
      <header className="bg-discord-darker/50 backdrop-blur border-b border-gray-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="bg-discord-blue p-2 rounded-lg">
              <Ticket className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-white">Discord Ticket Bot Dashboard</h1>
              <p className="text-gray-400">Monitor and manage your ticket system</p>
            </div>
          </div>
          <button
            onClick={fetchStats}
            className="bg-discord-blue hover:bg-blue-600 text-white px-4 py-2 rounded-lg transition-colors flex items-center space-x-2"
          >
            <Activity className="w-4 h-4" />
            <span>Refresh</span>
          </button>
        </div>
      </header>

      {/* Overview Cards */}
      <div className="max-w-7xl mx-auto px-4 py-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        <StatCard icon={<Server />} label="Total Servers" value={stats!.overview.totalGuilds} />
        <StatCard icon={<Users />} label="Configured Servers" value={stats!.overview.configuredGuilds} />
        <StatCard icon={<Ticket />} label="Total Tickets" value={stats!.overview.totalTickets} />
        <StatCard icon={<Clock />} label="Open Tickets" value={stats!.overview.openTickets} />
        <StatCard icon={<TrendingUp />} label="Closed Tickets" value={stats!.overview.closedTickets} />
        <StatCard icon={<Clock />} label="Avg Resolution (hrs)" value={stats!.overview.avgResolutionHours.toFixed(2)} />
      </div>

      {/* Charts Section */}
      <div className="max-w-7xl mx-auto px-4 py-6 grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Line Chart */}
        <div className="bg-discord-darker p-4 rounded-lg shadow">
          <h2 className="text-lg font-semibold mb-4">Daily Ticket Stats</h2>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={dailyData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#4b5563" />
              <XAxis dataKey="date" stroke="#ccc" />
              <YAxis stroke="#ccc" />
              <Tooltip />
              <Legend />
              <Line type="monotone" dataKey="created" stroke="#5865F2" name="Created" />
              <Line type="monotone" dataKey="closed" stroke="#ED4245" name="Closed" />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Pie Chart */}
        <div className="bg-discord-darker p-4 rounded-lg shadow">
          <h2 className="text-lg font-semibold mb-4">Ticket Types</h2>
          <ResponsiveContainer width="100%" height={300}>
            <RechartsPieChart>
              <Pie
                data={ticketTypeData}
                dataKey="value"
                nameKey="name"
                cx="50%"
                cy="50%"
                outerRadius={100}
                fill="#8884d8"
                label
              >
                {ticketTypeData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
            </RechartsPieChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}

// 🧩 Stat Card Component
function StatCard({ icon, label, value }: { icon: React.ReactNode; label: string; value: number | string }) {
  return (
    <div className="bg-discord-darker p-4 rounded-lg flex items-center space-x-4 shadow">
      <div className="bg-discord-blue p-2 rounded-md">{icon}</div>
      <div>
        <p className="text-gray-400 text-sm">{label}</p>
        <h3 className="text-xl font-bold">{value}</h3>
      </div>
    </div>
  );
}
