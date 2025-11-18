'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Users, ArrowLeft, Home } from 'lucide-react';
import { adminApi } from '@/lib/api';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';

interface UserStats {
  id: string;
  email: string;
  display_name: string | null;
  role: string;
  subscription_tier: string;
  is_active: boolean;
  created_at: string;
  total_rips: number;
  rips_today: number;
  total_cost: number;
  last_rip_at: string | null;
}

export default function AdminUsersPage() {
  const [users, setUsers] = useState<UserStats[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [tierFilter, setTierFilter] = useState<'all' | 'free' | 'pro' | 'premium'>(
    'all'
  );

  useEffect(() => {
    loadUsers();
  }, []);

  const loadUsers = async () => {
    try {
      setLoading(true);
      const data = await adminApi.listUsers();
      setUsers(data);
    } catch (err: any) {
      console.error('Failed to load users:', err);
      setError(err.response?.data?.detail || 'Failed to load users');
    } finally {
      setLoading(false);
    }
  };

  const getTierBadgeColor = (tier: string) => {
    switch (tier) {
      case 'premium':
        return 'bg-purple-100 text-purple-800';
      case 'pro':
        return 'bg-blue-100 text-blue-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  const formatDateTime = (dateString: string | null) => {
    if (!dateString) return 'Never';
    return new Date(dateString).toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const filteredUsers =
    tierFilter === 'all'
      ? users
      : users.filter((u) => u.subscription_tier === tierFilter);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
      <div className="mx-auto max-w-7xl pt-6">
        <div className="mb-6 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Users className="h-6 w-6 text-gray-700" />
            <div>
              <h1 className="text-2xl font-bold text-gray-900">User Management</h1>
              <p className="text-gray-600">View membership tiers and recent activity</p>
            </div>
          </div>
          <div className="flex gap-3">
            <Link href="/admin">
              <Button variant="outline" className="gap-2">
                <ArrowLeft className="h-4 w-4" />
                Back to Dashboard
              </Button>
            </Link>
            <Link href="/">
              <Button variant="outline" className="gap-2">
                <Home className="h-4 w-4" />
                Home
              </Button>
            </Link>
            <Button onClick={loadUsers} disabled={loading}>
              {loading ? 'Refreshing...' : 'Refresh'}
            </Button>
          </div>
        </div>

        {loading && (
          <Card className="border-gray-200">
            <CardContent className="p-6 text-gray-700">Loading users...</CardContent>
          </Card>
        )}

        {error && (
          <Card className="border-red-200 bg-red-50">
            <CardContent className="p-6 text-red-800">{error}</CardContent>
          </Card>
        )}

        {!loading && !error && (
          <Card>
            <CardHeader>
              <CardTitle>All Users</CardTitle>
              <CardDescription>
                Filter by tier to quickly see who has Pro/Premium access.
              </CardDescription>
              <div className="mt-3 flex flex-wrap items-center gap-2">
                <span className="text-sm text-gray-700">Filter by tier:</span>
                {(['all', 'free', 'pro', 'premium'] as const).map((tier) => (
                  <Button
                    key={tier}
                    variant={tierFilter === tier ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setTierFilter(tier)}
                  >
                    {tier === 'all'
                      ? 'All'
                      : tier.charAt(0).toUpperCase() + tier.slice(1)}
                  </Button>
                ))}
              </div>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Email</TableHead>
                      <TableHead>Name</TableHead>
                      <TableHead>Tier</TableHead>
                      <TableHead>Role</TableHead>
                      <TableHead className="text-right">Total Rips</TableHead>
                      <TableHead className="text-right">Today</TableHead>
                      <TableHead className="text-right">Cost</TableHead>
                      <TableHead>Last Active</TableHead>
                      <TableHead>Joined</TableHead>
                      <TableHead>Status</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredUsers.map((user) => (
                      <TableRow key={user.id}>
                        <TableCell className="font-medium">{user.email}</TableCell>
                        <TableCell>{user.display_name || '-'}</TableCell>
                        <TableCell>
                          <span
                            className={`inline-flex rounded-full px-2 py-1 text-xs font-semibold ${getTierBadgeColor(
                              user.subscription_tier
                            )}`}
                          >
                            {user.subscription_tier}
                          </span>
                        </TableCell>
                        <TableCell>
                          <span className="capitalize">{user.role}</span>
                        </TableCell>
                        <TableCell className="text-right">{user.total_rips}</TableCell>
                        <TableCell className="text-right">{user.rips_today}</TableCell>
                        <TableCell className="text-right">
                          ${user.total_cost.toFixed(4)}
                        </TableCell>
                        <TableCell>{formatDateTime(user.last_rip_at)}</TableCell>
                        <TableCell>{formatDate(user.created_at)}</TableCell>
                        <TableCell>
                          <span
                            className={`inline-flex rounded-full px-2 py-1 text-xs font-semibold ${
                              user.is_active
                                ? 'bg-green-100 text-green-800'
                                : 'bg-red-100 text-red-800'
                            }`}
                          >
                            {user.is_active ? 'Active' : 'Inactive'}
                          </span>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
