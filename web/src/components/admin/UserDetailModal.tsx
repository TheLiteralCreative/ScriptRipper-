'use client';

import { useEffect, useState } from 'react';
import { X, User as UserIcon, Calendar, DollarSign, Activity } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { adminApi } from '@/lib/api';

interface UsageRecord {
  id: string;
  transcript_type: string;
  prompt_count: number;
  had_custom_prompt: boolean;
  total_input_tokens: number;
  total_output_tokens: number;
  total_cost: number;
  created_at: string;
}

interface UserDetail {
  id: string;
  email: string;
  display_name: string | null;
  role: string;
  subscription_tier: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
  total_rips: number;
  total_cost: number;
  recent_usage: UsageRecord[];
}

interface UserDetailModalProps {
  userId: string | null;
  isOpen: boolean;
  onClose: () => void;
}

export function UserDetailModal({ userId, isOpen, onClose }: UserDetailModalProps) {
  const [userDetail, setUserDetail] = useState<UserDetail | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen && userId) {
      loadUserDetail();
    }
  }, [isOpen, userId]);

  const loadUserDetail = async () => {
    if (!userId) return;

    try {
      setLoading(true);
      setError(null);
      const data = await adminApi.getUserDetail(userId);
      setUserDetail(data);
    } catch (err: any) {
      console.error('Failed to load user details:', err);
      setError(err.response?.data?.detail || 'Failed to load user details');
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
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

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <UserIcon className="h-5 w-5" />
            User Details
          </DialogTitle>
          <DialogDescription>
            Complete user information and usage history
          </DialogDescription>
        </DialogHeader>

        {loading && (
          <div className="py-12 text-center">
            <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-current border-r-transparent"></div>
            <p className="mt-4 text-gray-600">Loading user details...</p>
          </div>
        )}

        {error && (
          <div className="rounded-lg bg-red-50 p-4 text-red-800">
            {error}
          </div>
        )}

        {!loading && !error && userDetail && (
          <div className="space-y-6">
            {/* User Info Cards */}
            <div className="grid gap-4 md:grid-cols-2">
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm font-medium text-gray-600">
                    Account Information
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  <div>
                    <p className="text-xs text-gray-500">Email</p>
                    <p className="font-medium">{userDetail.email}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500">Display Name</p>
                    <p className="font-medium">{userDetail.display_name || '—'}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500">Role</p>
                    <p className="font-medium capitalize">{userDetail.role}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500">Subscription Tier</p>
                    <span
                      className={`inline-flex rounded-full px-2 py-1 text-xs font-semibold ${getTierBadgeColor(
                        userDetail.subscription_tier
                      )}`}
                    >
                      {userDetail.subscription_tier}
                    </span>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500">Status</p>
                    <span
                      className={`inline-flex rounded-full px-2 py-1 text-xs font-semibold ${
                        userDetail.is_active
                          ? 'bg-green-100 text-green-800'
                          : 'bg-red-100 text-red-800'
                      }`}
                    >
                      {userDetail.is_active ? 'Active' : 'Inactive'}
                    </span>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm font-medium text-gray-600">
                    Usage Statistics
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Activity className="h-4 w-4 text-blue-600" />
                      <span className="text-sm text-gray-600">Total Rips</span>
                    </div>
                    <span className="text-lg font-bold">{userDetail.total_rips}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <DollarSign className="h-4 w-4 text-green-600" />
                      <span className="text-sm text-gray-600">Total Cost</span>
                    </div>
                    <span className="text-lg font-bold">
                      ${userDetail.total_cost.toFixed(4)}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Calendar className="h-4 w-4 text-purple-600" />
                      <span className="text-sm text-gray-600">Joined</span>
                    </div>
                    <span className="text-sm font-medium">
                      {formatDate(userDetail.created_at)}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Calendar className="h-4 w-4 text-orange-600" />
                      <span className="text-sm text-gray-600">Last Updated</span>
                    </div>
                    <span className="text-sm font-medium">
                      {formatDate(userDetail.updated_at)}
                    </span>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Recent Usage History */}
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Recent Usage History</CardTitle>
              </CardHeader>
              <CardContent>
                {userDetail.recent_usage.length === 0 ? (
                  <p className="py-8 text-center text-gray-500">
                    No usage history yet
                  </p>
                ) : (
                  <div className="overflow-x-auto">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Date</TableHead>
                          <TableHead>Type</TableHead>
                          <TableHead className="text-right">Prompts</TableHead>
                          <TableHead className="text-right">Input Tokens</TableHead>
                          <TableHead className="text-right">Output Tokens</TableHead>
                          <TableHead className="text-right">Cost</TableHead>
                          <TableHead>Custom</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {userDetail.recent_usage.map((record) => (
                          <TableRow key={record.id}>
                            <TableCell className="text-sm">
                              {formatDate(record.created_at)}
                            </TableCell>
                            <TableCell className="text-sm capitalize">
                              {record.transcript_type}
                            </TableCell>
                            <TableCell className="text-right text-sm">
                              {record.prompt_count}
                            </TableCell>
                            <TableCell className="text-right text-sm">
                              {record.total_input_tokens.toLocaleString()}
                            </TableCell>
                            <TableCell className="text-right text-sm">
                              {record.total_output_tokens.toLocaleString()}
                            </TableCell>
                            <TableCell className="text-right text-sm font-medium">
                              ${record.total_cost.toFixed(4)}
                            </TableCell>
                            <TableCell>
                              {record.had_custom_prompt ? (
                                <span className="inline-flex rounded-full bg-blue-100 px-2 py-0.5 text-xs text-blue-800">
                                  Yes
                                </span>
                              ) : (
                                <span className="text-xs text-gray-400">No</span>
                              )}
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
