'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Users, Activity, DollarSign, Calendar, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { adminApi } from '@/lib/api';

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

export default function AdminDashboard() {
  const router = useRouter();
  const [users, setUsers] = useState<UserStats[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [proEmail, setProEmail] = useState('');
  const [proStatus, setProStatus] = useState<string | null>(null);
  const [proBusy, setProBusy] = useState(false);

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

      // If 401 or 403, redirect to login
      if (err.response?.status === 401 || err.response?.status === 403) {
        router.push('/login');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleSetPro = async () => {
    if (!proEmail) {
      setProStatus('Please enter an email.');
      return;
    }
    try {
      setProBusy(true);
      setProStatus(null);
      await adminApi.setUserPro(proEmail.trim());
      setProStatus('User updated to Pro.');
      setProEmail('');
      await loadUsers();
    } catch (err: any) {
      console.error('Failed to set user to Pro:', err);
      const msg =
        err.response?.data?.detail ||
        err.response?.data?.error ||
        'Failed to update tier';
      setProStatus(msg);
      if (err.response?.status === 401 || err.response?.status === 403) {
        router.push('/login');
      }
    } finally {
      setProBusy(false);
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

  // Calculate summary stats
  const totalUsers = users.length;
  const totalRips = users.reduce((sum, u) => sum + u.total_rips, 0);
  const totalCost = users.reduce((sum, u) => sum + u.total_cost, 0);
  const activeToday = users.filter((u) => u.rips_today > 0).length;

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
      <div className="mx-auto max-w-7xl pt-8">
        {/* Header */}
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="mb-2 text-4xl font-bold text-gray-900">
              Admin Dashboard
            </h1>
            <p className="text-gray-600">Monitor user activity and system usage</p>
          </div>
          <div className="flex gap-3">
            <Button
              variant="outline"
              onClick={() => router.push('/admin/prompts')}
            >
              Manage Prompts
            </Button>
            <Button onClick={() => router.push('/')}>Back to Home</Button>
          </div>
        </div>

        {loading && (
          <div className="text-center py-12">
            <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-current border-r-transparent align-[-0.125em] motion-reduce:animate-[spin_1.5s_linear_infinite]"></div>
            <p className="mt-4 text-gray-600">Loading users...</p>
          </div>
        )}

        {error && (
          <Card className="border-red-200 bg-red-50">
            <CardContent className="p-6">
              <p className="text-red-800">{error}</p>
            </CardContent>
          </Card>
        )}

        {!loading && !error && (
          <>
            <Card className="mb-6 border-blue-100 bg-white">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-base font-semibold">
                  <Sparkles className="h-4 w-4 text-blue-600" />
                  Grant Pro Access
                </CardTitle>
                <CardDescription>
                  Promote a user to Pro without billing (admin-only). Enter their
                  account email.
                </CardDescription>
              </CardHeader>
              <CardContent className="flex flex-col gap-3 sm:flex-row sm:items-center">
                <Input
                  type="email"
                  placeholder="user@example.com"
                  value={proEmail}
                  onChange={(e) => setProEmail(e.target.value)}
                  className="sm:max-w-sm"
                />
                <Button onClick={handleSetPro} disabled={proBusy}>
                  {proBusy ? 'Updating...' : 'Set to Pro'}
                </Button>
                {proStatus && (
                  <p className="text-sm text-gray-700">{proStatus}</p>
                )}
              </CardContent>
            </Card>

            {/* Summary Cards */}
            <div className="mb-8 grid gap-4 md:grid-cols-4">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">
                    Total Users
                  </CardTitle>
                  <Users className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{totalUsers}</div>
                  <p className="text-xs text-muted-foreground">
                    Registered accounts
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">
                    Active Today
                  </CardTitle>
                  <Activity className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{activeToday}</div>
                  <p className="text-xs text-muted-foreground">
                    Users with rips today
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">
                    Total Rips
                  </CardTitle>
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{totalRips}</div>
                  <p className="text-xs text-muted-foreground">
                    All-time rips
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">
                    Total Cost
                  </CardTitle>
                  <DollarSign className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    ${totalCost.toFixed(2)}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    LLM API costs
                  </p>
                </CardContent>
              </Card>
            </div>

            {/* Users Table */}
            <Card>
              <CardHeader>
                <CardTitle>All Users</CardTitle>
                <CardDescription>
                  Detailed view of all registered users and their activity
                </CardDescription>
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
                      {users.map((user) => (
                        <TableRow key={user.id}>
                          <TableCell className="font-medium">
                            {user.email}
                          </TableCell>
                          <TableCell>
                            {user.display_name || '-'}
                          </TableCell>
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
                          <TableCell className="text-right">
                            {user.total_rips}
                          </TableCell>
                          <TableCell className="text-right">
                            {user.rips_today}
                          </TableCell>
                          <TableCell className="text-right">
                            ${user.total_cost.toFixed(4)}
                          </TableCell>
                          <TableCell>
                            {formatDateTime(user.last_rip_at)}
                          </TableCell>
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
          </>
        )}
      </div>
    </div>
  );
}
