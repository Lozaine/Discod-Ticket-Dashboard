'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { 
  Server, 
  Search, 
  Settings, 
  Trash2, 
  ArrowLeft,
  ChevronLeft,
  ChevronRight,
  Eye,
  CheckCircle,
  XCircle,
  Users,
  Ticket
} from 'lucide-react';

interface Guild {
  guild_id: string;
  category_id: string | null;
  panel_channel_id: string | null;
  transcript_channel_id: string | null;
  ticket_counter: number;
  created_at: string;
  updated_at: string;
  support_roles: string[];
  total_tickets: number;
  open_tickets: number;
  support_role_count: number;
  is_configured: boolean;
  last_ticket_created: string | null;
}

interface GuildsResponse {
  guilds: Guild[];
  pagination: {
    currentPage: number;
    totalPages: number;
    totalCount: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
}

export default function GuildsPage() {
  const [guilds, setGuilds] = useState<Guild[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [pagination, setPagination] = useState({
    currentPage: 1,
    totalPages: 1,
    totalCount: 0,
    hasNext: false,
    hasPrev: false,
  });
  
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);

  useEffect(() => {
    fetchGuilds();
  }, [currentPage, searchTerm]);

  const fetchGuilds = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams({
        page: currentPage.toString(),
        limit: '10',
        ...(searchTerm && { search: searchTerm }),
      });

      const response = await fetch(`/api/guilds?${params}`);
      if (!response.ok) throw new Error('Failed to fetch guilds');
      
      const data: GuildsResponse = await response.json();
      setGuilds(data.guilds);
      setPagination(data.pagination);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (term: string) => {
    setSearchTerm(term);
    setCurrentPage(1);
  };

  const handleDeleteGuild = async (guildId: string) => {
    try {
      const response = await fetch(`/api/guilds?guildId=${guildId}`, {
        method: 'DELETE',
      });

      if (!response.ok) throw new Error('Failed to delete guild');
      
      setDeleteConfirm(null);
      fetchGuilds();
    } catch (err) {
      alert('Error deleting guild: ' + (err instanceof Error ? err.message : 'Unknown error'));
    }
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
                <div className="bg-discord-blue p-2 rounded-lg">
                  <Server className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h1 className="text-2xl font-bold text-white">Guild Management</h1>
                  <p className="text-gray-400">Manage Discord server configurations</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Search and Stats */}
        <div className="bg-discord-darker/60 backdrop-blur border border-gray-700 rounded-xl p-6 mb-6">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
            <div className="flex-1 max-w-md">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <input
                  type="text"
                  placeholder="Search by Guild ID..."
                  value={searchTerm}
                  onChange={(e) => handleSearch(e.target.value)}
                  className="w-full bg-gray-800 border border-gray-600 rounded-lg pl-10 pr-4 py-2 text-white placeholder-gray-400 focus:border-discord-blue focus:ring-1 focus:ring-discord-blue"
                />
              </div>
            </div>
            
            <div className="flex items-center space-x-6 text-sm">
              <div className="text-center">
                <div className="text-2xl font-bold text-white">{pagination.totalCount}</div>
                <div className="text-gray-400">Total Guilds</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-discord-green">
                  {guilds.filter(g => g.is_configured).length}
                </div>
                <div className="text-gray-400">Configured</div>
              </div>
            </div>
          </div>
        </div>

        {/* Guilds Table */}
        <div className="bg-discord-darker/60 backdrop-blur border border-gray-700 rounded-xl overflow-hidden">
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <div className="loading-spinner mr-3"></div>
              <span className="text-white">Loading guilds...</span>
            </div>
          ) : error ? (
            <div className="text-center py-12">
              <div className="text-discord-red mb-4">
                <XCircle className="w-12 h-12 mx-auto" />
              </div>
              <p className="text-white mb-4">{error}</p>
              <button 
                onClick={fetchGuilds}
                className="bg-discord-blue hover:bg-blue-600 text-white px-4 py-2 rounded-lg transition-colors"
              >
                Retry
              </button>
            </div>
          ) : guilds.length === 0 ? (
            <div className="text-center py-12">
              <Server className="w-12 h-12 mx-auto text-gray-500 mb-4" />
              <p className="text-gray-400">No guilds found</p>
            </div>
          ) : (
            <>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-800/50">
                    <tr>
                      <th className="text-left py-4 px-6 text-gray-300 font-medium">Guild ID</th>
                      <th className="text-left py-4 px-6 text-gray-300 font-medium">Status</th>
                      <th className="text-left py-4 px-6 text-gray-300 font-medium">Tickets</th>
                      <th className="text-left py-4 px-6 text-gray-300 font-medium">Support Roles</th>
                      <th className="text-left py-4 px-6 text-gray-300 font-medium">Last Updated</th>
                      <th className="text-left py-4 px-6 text-gray-300 font-medium">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {guilds.map((guild) => (
                      <tr key={guild.guild_id} className="border-t border-gray-800 hover:bg-gray-800/30">
                        <td className="py-4 px-6">
                          <code className="text-xs bg-gray-800 px-2 py-1 rounded text-gray-300 font-mono">
                            {guild.guild_id}
                          </code>
                        </td>
                        <td className="py-4 px-6">
                          <div className="flex items-center space-x-2">
                            {guild.is_configured ? (
                              <CheckCircle className="w-4 h-4 text-discord-green" />
                            ) : (
                              <XCircle className="w-4 h-4 text-discord-red" />
                            )}
                            <span className={`text-sm font-medium ${
                              guild.is_configured ? 'text-discord-green' : 'text-discord-red'
                            }`}>
                              {guild.is_configured ? 'Configured' : 'Not Configured'}
                            </span>
                          </div>
                        </td>
                        <td className="py-4 px-6">
                          <div className="flex items-center space-x-4 text-sm">
                            <div className="flex items-center space-x-1">
                              <Ticket className="w-3 h-3 text-gray-400" />
                              <span className="text-white">{guild.total_tickets}</span>
                            </div>
                            <div className="flex items-center space-x-1">
                              <div className="w-2 h-2 bg-discord-yellow rounded-full"></div>
                              <span className="text-discord-yellow">{guild.open_tickets} open</span>
                            </div>
                          </div>
                        </td>
                        <td className="py-4 px-6">
                          <div className="flex items-center space-x-1 text-sm">
                            <Users className="w-3 h-3 text-gray-400" />
                            <span className="text-white">{guild.support_role_count}</span>
                            <span className="text-gray-400">roles</span>
                          </div>
                        </td>
                        <td className="py-4 px-6 text-gray-300 text-sm">
                          {formatDate(guild.updated_at)}
                        </td>
                        <td className="py-4 px-6">
                          <div className="flex items-center space-x-2">
                            <Link 
                              href={`/guilds/${guild.guild_id}`}
                              className="p-2 text-gray-400 hover:text-discord-blue hover:bg-discord-blue/10 rounded-lg transition-colors"
                              title="View Details"
                            >
                              <Eye className="w-4 h-4" />
                            </Link>
                            <button
                              onClick={() => setDeleteConfirm(guild.guild_id)}
                              className="p-2 text-gray-400 hover:text-discord-red hover:bg-discord-red/10 rounded-lg transition-colors"
                              title="Delete Guild"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Pagination */}
              <div className="bg-gray-800/30 px-6 py-4 border-t border-gray-700">
                <div className="flex items-center justify-between">
                  <div className="text-sm text-gray-400">
                    Showing {((pagination.currentPage - 1) * 10) + 1} to {Math.min(pagination.currentPage * 10, pagination.totalCount)} of {pagination.totalCount} guilds
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

      {/* Delete Confirmation Modal */}
      {deleteConfirm && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-discord-darker border border-gray-700 rounded-xl p-6 max-w-md mx-4">
            <h3 className="text-lg font-semibold text-white mb-4">Delete Guild Configuration</h3>
            <p className="text-gray-300 mb-6">
              Are you sure you want to delete the configuration for guild <code className="bg-gray-800 px-2 py-1 rounded">{deleteConfirm}</code>? 
              This action cannot be undone.
            </p>
            <div className="flex space-x-3">
              <button
                onClick={() => handleDeleteGuild(deleteConfirm)}
                className="bg-discord-red hover:bg-red-600 text-white px-4 py-2 rounded-lg transition-colors"
              >
                Delete
              </button>
              <button
                onClick={() => setDeleteConfirm(null)}
                className="bg-gray-600 hover:bg-gray-500 text-white px-4 py-2 rounded-lg transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}