import React, { useState, useEffect } from 'react';
import { Button } from '@/Components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/Components/ui/card';
import { Input } from '@/Components/ui/input';
import { Badge } from '@/Components/ui/badge';
import { getAllVouches, deleteVouch, updateVouch, getVouchStats, isAdmin } from '@/utils/vouchStorage';
import { base44 } from '@/api/base44Client';
import { toast } from 'sonner';

export default function VouchAdmin() {
  const [vouches, setVouches] = useState([]);
  const [stats, setStats] = useState({ total: 0, verified: 0, pending: 0 });
  const [search, setSearch] = useState('');
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkAuth = async () => {
      try {
        if (await base44.auth.isAuthenticated()) {
          const currentUser = await base44.auth.me();
          if (!isAdmin(currentUser.id)) {
            window.location.href = '/';
            return;
          }
          setUser(currentUser);
        } else {
          window.location.href = '/';
        }
      } catch (error) {
        window.location.href = '/';
      } finally {
        setLoading(false);
      }
    };
    checkAuth();
  }, []);

  useEffect(() => {
    if (user) {
      loadVouches();
    }
  }, [user]);

  const loadVouches = () => {
    const allVouches = getAllVouches();
    setVouches(allVouches);
    setStats(getVouchStats());
  };

  const handleDelete = (id) => {
    if (confirm('Delete this vouch?')) {
      deleteVouch(id);
      loadVouches();
      toast.success('Vouch deleted');
    }
  };

  const handleToggleVerify = (id, currentStatus) => {
    updateVouch(id, { verified: !currentStatus });
    loadVouches();
    toast.success('Vouch updated');
  };

  const filteredVouches = vouches.filter(v =>
    v.discord_username?.toLowerCase().includes(search.toLowerCase()) ||
    v.discord_user_id?.includes(search) ||
    v.message_id?.includes(search)
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="w-8 h-8 border-4 border-fuchsia-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="py-10 max-w-7xl mx-auto">
      <div className="mb-8">
        <h1 className="text-4xl font-bold text-white mb-2">Vouch Management</h1>
        <p className="text-zinc-400">Manage all user vouches and reviews</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <Card className="bg-zinc-900 border-zinc-800">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-zinc-400">Total Vouches</p>
                <p className="text-3xl font-bold text-white">{stats.total}</p>
              </div>
              <div className="w-12 h-12 rounded-lg bg-blue-500/20 flex items-center justify-center">
                <svg className="w-6 h-6 text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-zinc-900 border-zinc-800">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-zinc-400">Verified</p>
                <p className="text-3xl font-bold text-green-400">{stats.verified}</p>
              </div>
              <div className="w-12 h-12 rounded-lg bg-green-500/20 flex items-center justify-center">
                <svg className="w-6 h-6 text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-zinc-900 border-zinc-800">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-zinc-400">Pending</p>
                <p className="text-3xl font-bold text-yellow-400">{stats.pending}</p>
              </div>
              <div className="w-12 h-12 rounded-lg bg-yellow-500/20 flex items-center justify-center">
                <svg className="w-6 h-6 text-yellow-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Search */}
      <Card className="bg-zinc-900 border-zinc-800 mb-6">
        <CardContent className="pt-6">
          <Input
            placeholder="Search by username, user ID, or message ID..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="bg-zinc-950 border-zinc-700 text-zinc-300"
          />
        </CardContent>
      </Card>

      {/* Vouches List */}
      <Card className="bg-zinc-900 border-zinc-800">
        <CardHeader>
          <CardTitle className="text-white">All Vouches ({filteredVouches.length})</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {filteredVouches.length === 0 ? (
              <div className="text-center py-12 text-zinc-500">
                No vouches found
              </div>
            ) : (
              filteredVouches.map((vouch) => (
                <div key={vouch.id} className="bg-zinc-950 border border-zinc-800 rounded-lg p-4">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="text-white font-semibold">{vouch.discord_username}</h3>
                        <Badge variant={vouch.verified ? "default" : "secondary"} className={vouch.verified ? "bg-green-500/20 text-green-400" : "bg-yellow-500/20 text-yellow-400"}>
                          {vouch.verified ? 'Verified' : 'Pending'}
                        </Badge>
                      </div>
                      <div className="space-y-1 text-sm text-zinc-400">
                        <p>User ID: <span className="text-zinc-300 font-mono">{vouch.discord_user_id}</span></p>
                        <p>Channel ID: <span className="text-zinc-300 font-mono">{vouch.channel_id}</span></p>
                        <p>Message ID: <span className="text-zinc-300 font-mono">{vouch.message_id}</span></p>
                        <p>Date: <span className="text-zinc-300">{new Date(vouch.created_date).toLocaleString()}</span></p>
                        {vouch.message_link && (
                          <p>
                            <a href={vouch.message_link} target="_blank" rel="noopener noreferrer" className="text-fuchsia-400 hover:text-fuchsia-300">
                              View Message →
                            </a>
                          </p>
                        )}
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleToggleVerify(vouch.id, vouch.verified)}
                        className="border-zinc-700 text-zinc-300 hover:bg-zinc-800"
                      >
                        {vouch.verified ? 'Unverify' : 'Verify'}
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleDelete(vouch.id)}
                        className="border-red-700 text-red-400 hover:bg-red-900/20"
                      >
                        Delete
                      </Button>
                    </div>
                  </div>
                  {vouch.vouch_text && (
                    <div className="mt-3 pt-3 border-t border-zinc-800">
                      <p className="text-sm text-zinc-400">{vouch.vouch_text}</p>
                    </div>
                  )}
                </div>
              ))
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
