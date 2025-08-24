'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { 
  Ticket, 
  Search, 
  Filter, 
  ArrowLeft,
  ChevronLeft,
  ChevronRight,
  Clock,
  User,
  Calendar,
  AlertCircle,
  MessageSquare,
  Scale,
  CheckCircle,
  XCircle
} from 'lucide-react';

interface TicketData {
  id: number;
  guild_id: string;
  channel_id: string | null;
  channel_name: string | null;
  owner_id: string | null;
  ticket_type: string | null;
  ticket_number: number | null;
  created_at: string;
  closed_at: string | null;
  closed_by: string | null;
  status: string;
  resolution_hours: number | null;
}

interface TicketsResponse {
  tickets: TicketData[];
  pagination: {
    currentPage: number;
    totalPages: number;
    totalCount: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
}

const TICKET_TYPE_ICONS = {
  report: AlertCircle,
  support: MessageSquare,
  appeal: Scale,
} as const;

const TICKET_TYPE_COLORS = {
  report: 'text-discord-red bg-discord-red/10',
  support: 'text-discord-blue bg-discord-blue/10',
  appeal: 'text-discord-yellow bg-discord-yellow/10',
} as const;

export default function TicketsPage() {
  const [tickets, setTickets] = useState<TicketData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [pagination, setPagination] = useState({
    currentPage: 1,
    totalPages: 1,
    totalCount: 0,
    hasNext: false,
    hasPrev: false,
  });
  
  const [filters, setFilters] = useState({
    status: 'all',
    type: 'all',
    guildId: '',
    search: '',
  });
  const [currentPage, setCurrentPage] = useState(1);

  useEffect(() => {
    fetchTickets();
  }, [currentPage, filters]);

  const fetchTickets = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams({
        page: currentPage.toString(),
        limit: '20',
        ...(filters.status !== 'all' && { status: filters.status }),
        ...(filters.type !== 'all' && { type: filters.type }),
        ...(filters.guildId && { guildId: filters.guildId }),
        ...(filters.search && { search: filters.search }),
      });

      const response = await fetch(`/api/tickets?${params}`);
      if (!response.ok) throw new Error('Failed to fetch tickets');
      
      const data: TicketsResponse = await response.json();
      setTickets(data.tickets);
      setPagination(data.pagination);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (key: string, value: string) => {
    setFilters(prev => ({ ...prev, [key]: value }));
    setCurrentPage(1);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const getTicketTypeIcon = (type: string | null) => {
    if (!type) return MessageSquare;
    return TICKET_TYPE_ICONS[type as keyof typeof TICKET_TYPE_ICONS] || MessageSquare;
  };

  const getTicketTypeColor = (type: string | null) => {
    if (!type) return 'text-gray-400 bg-gray-400/10';
    return TICKET_TYPE_COLORS[type as keyof typeof TICKET_TYPE_COLORS] || 'text-gray-400 bg-gray-400/10';
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-discord-dark to-discord-darker">
      {/* Header */}
      <header className="bg-discord-darker/50 backdrop-blur border-b border-gray-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Link 
                href="/"
                className="text-gray-400 hover:text-white transition-colors"
              >
                <ArrowLeft className="w-6 h-6" />
              </Link>
              <div className="flex items-center space-x-3">
                <div className="bg-discord-green p-2 rounded-lg">
                  <Ticket className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h1 className="text-2xl font-bold text-white">Ticket Management</h1>
                  <p className="text-gray-400">View and manage all support tickets</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Filters */}
        <div className="bg-discord-darker/60 backdrop-blur border border-gray-700 rounded-xl p-6 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
            {/* Search */}
            <div className="lg:col-span-2">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <input
                  type="text"
                  placeholder="Search channel name or user ID..."
                  value={filters.search}
                  onChange={(e) => handleFilterChange('search', e.target.value)}
                  className="w-full bg-gray-800 border border-gray-600 rounded-lg pl-10 pr-4 py-2 text-white placeholder-gray-400 focus:border-discord-blue focus:ring-1 focus:ring-discord-blue"
                />
              </div>
            </div>

            {/* Status Filter */}
            <div>
              <select
                value={filters.status}
                onChange={(e) => handleFilterChange('status', e.target.value)}
                className="w-full bg-gray-800 border border-gray-600 rounded-lg px-4 py-2 text-white focus:border-discord-blue focus:ring-1 focus:ring-discord-blue"
              >
                <option value="all">All Status</option>
                <option value="open">Open</option>
                <option value="closed">Closed</option>
              </select>
            </div>

            {/* Type Filter */}
            <div>
              <select
                value={filters.type}
                onChange={(e) => handleFilterChange('type', e.target.value)}
                className="w-full bg-gray-800 border border-gray-600 rounded-lg px-4 py-2 text-white focus:border-discord-blue focus:ring-1 focus:ring-discord-blue"
              >
                <option value="all">All Types</option>
                <option value="report">Report</option>
                <option value="support">Support</option>
                <option value="appeal">Appeal</option>
              </select>
            </div>

            {/* Guild ID Filter */}
            <div>
              <input
                type="text"
                placeholder="Guild ID..."
                value={filters.guildId}
                onChange={(e) => handleFilterChange('guildId', e.target.value)}
                className="w-full bg-gray-800 border border-gray-600 rounded-lg px-4 py-2 text-white placeholder-gray-400 focus:border-discord-blue focus:ring-1 focus:ring-discord-blue"
              />
            </div>
          </div>

          {/* Stats */}
          <div className="mt-4 pt-4 border-t border-gray-700">
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 text-center">
              <div>
                <div className="text-2xl font-bold text-white">{pagination.totalCount}</div>
                <div className="text-sm text-gray-400">Total Tickets</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-discord-yellow">
                  {tickets.filter(t => t.status === 'open').length}
                </div>
                <div className="text-sm text-gray-400">Open</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-gray-400">
                  {tickets.filter(t => t.status === 'closed').length}
                </div>
                <div className="text-sm text-gray-400">Closed</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-discord-blue">
                  {tickets.filter(t => t.resolution_hours !== null).length > 0
                    ? Math.round(
                        tickets.filter(t => t.resolution_hours !== null)
                          .reduce((sum, t) => sum + (t.resolution_hours || 0), 0) /
                        tickets.filter(t => t.resolution_hours !== null).length
                      )
                    : 0}h
                </div>
                <div className="text-sm text-gray-400">Avg Resolution</div>
              </div>
            </div>
          </div>
        </div>

        {/* Tickets Table */}
        <div className="bg-discord-darker/60 backdrop-blur border border-gray-700 rounded-xl overflow-hidden">
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <div className="loading-spinner mr-3"></div>
              <span className="text-white">Loading tickets...</span>
            </div>
          ) : error ? (
            <div className="text-center py-12">
              <div className="text-discord-red mb-4">
                <XCircle className="w-12 h-12 mx-auto" />
              </div>
              <p className="text-white mb-4">{error}</p>
              <button 
                onClick={fetchTickets}
                className="bg-discord-blue hover:bg-blue-600 text-white px-4 py-2 rounded-lg transition-colors"
              >
                Retry
              </button>
            </div>
          ) : tickets.length === 0 ? (
            <div className="text-center py-12">
              <Ticket className="w-12 h-12 mx-auto text-gray-500 mb-4" />
              <p className="text-gray-400">No tickets found</p>
            </div>
          ) : (
            <>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-800/50">
                    <tr>
                      <th className="text-left py-4 px-6 text-gray-300 font-medium">Ticket</th>
                      <th className="text-left py-4 px-6 text-gray-300 font-medium">Type</th>
                      <th className="text-left py-4 px-6 text-gray-300 font-medium">Status</th>
                      <th className="text-left py-4 px-6 text-gray-300 font-medium">Owner</th>
                      <th className="text-left py-4 px-6 text-gray-300 font-medium">Guild</th>
                      <th className="text-left py-4 px-6 text-gray-300 font-medium">Created</th>
                      <th className="text-left py-4 px-6 text-gray-300 font-medium">Resolution</th>
                    </tr>
                  </thead>
                  <tbody>
                    {tickets.map((ticket) => {
                      const TypeIcon = getTicketTypeIcon(ticket.ticket_type);
                      return (
                        <tr key={ticket.id} className="border-t border-gray-800 hover:bg-gray-800/30">
                          <td className="py-4 px-6">
                            <div className="flex flex-col">
                              <div className="font-medium text-white">
                                {ticket.channel_name || `Ticket #${ticket.ticket_number || ticket.id}`}
                              </div>
                              {ticket.channel_id && (
                                <code className="text-xs text-gray-400 font-mono">
                                  {ticket.channel_id}
                                </code>
                              )}
                            </div>
                          </td>
                          <td className="py-4 px-6">
                            <div className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getTicketTypeColor(ticket.ticket_type)}`}>
                              <TypeIcon className="w-3 h-3 mr-1" />
                              {ticket.ticket_type || 'Unknown'}
                            </div>
                          </td>
                          <td className="py-4 px-6">
                            <div className="flex items-center space-x-2">
                              {ticket.status === 'open' ? (
                                <CheckCircle className="w-4 h-4 text-discord-green" />
                              ) : (
                                <XCircle className="w-4 h-4 text-gray-500" />
                              )}
                              <span className={`text-sm font-medium capitalize ${
                                ticket.status === 'open' ? 'text-discord-green' : 'text-gray-400'
                              }`}>
                                {ticket.status}
                              </span>
                            </div>
                          </td>
                          <td className="py-4 px-6">
                            <div className="flex items-center space-x-2">
                              <User className="w-4 h-4 text-gray-400" />
                              <code className="text-xs bg-gray-800 px-2 py-1 rounded text-gray-300">
                                {ticket.owner_id || 'Unknown'}
                              </code>
                            </div>
                          </td>
                          <td className="py-4 px-6">
                            <code className="text-xs bg-gray-800 px-2 py-1 rounded text-gray-300">
                              {ticket.guild_id}
                            </code>
                          </td>
                          <td className="py-4 px-6">
                            <div className="flex items-center space-x-2 text-sm text-gray-300">
                              <Calendar className="w-4 h-4 text-gray-400" />
                              <span>{formatDate(ticket.created_at)}</span>
                            </div>
                          </td>
                          <td className="py-4 px-6">
                            {ticket.resolution_hours !== null ? (
                              <div className="flex items-center space-x-2 text-sm">
                                <Clock className="w-4 h-4 text-gray-400" />
                                <span className="text-discord-blue font-medium">
                                  {ticket.resolution_hours.toFixed(1)}h
                                </span>
                              </div>
                            ) : ticket.status === 'open' ? (
                              <div className="flex items-center space-x-2 text-sm">
                                <Clock className="w-4 h-4 text-discord-yellow" />
                                <span className="text-discord-yellow">Ongoing</span>
                              </div>
                            ) : (
                              <span className="text-gray-500 text-sm">N/A</span>
                            )}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>

              {/* Pagination */}
              <div className="bg-gray-800/30 px-6 py-4 border-t border-gray-700">
                <div className="flex items-center justify-between">
                  <div className="text-sm text-gray-400">
                    Showing {((pagination.currentPage - 1) * 20) + 1} to {Math.min(pagination.currentPage * 20, pagination.totalCount)} of {pagination.totalCount} tickets
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                      disabled={!pagination.hasPrev}
                      className="p-2 text-gray-400 hover:text-white disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <ChevronLeft className="w-4 h-4" />
                    </button>
                    
                    <span className="text-white px-3 py-1 bg-discord-blue rounded">
                      {pagination.currentPage}
                    </span>
                    <span className="text-gray-400 px-2">of</span>
                    <span className="text-gray-400">{pagination.totalPages}</span>
                    
                    <button
                      onClick={() => setCurrentPage(prev => prev + 1)}
                      disabled={!pagination.hasNext}
                      className="p-2 text-gray-400 hover:text-white disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <ChevronRight className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            </>
          )}
        </div>
      </main>
    </div>
  );
}