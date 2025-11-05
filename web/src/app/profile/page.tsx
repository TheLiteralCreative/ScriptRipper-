'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { User, CreditCard, LogOut, Zap, Shield, Mail } from 'lucide-react';
import { billingApi } from '@/lib/api';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';

export default function ProfilePage() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [subscriptionStatus, setSubscriptionStatus] = useState<any>(null);
  const [checkingAuth, setCheckingAuth] = useState(true);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const loadUserData = async () => {
      if (typeof window !== 'undefined') {
        const token = localStorage.getItem('access_token');
        if (!token) {
          router.push('/login');
          return;
        }

        const userJson = localStorage.getItem('user');
        if (userJson) {
          setUser(JSON.parse(userJson));
        }

        try {
          const status = await billingApi.getSubscriptionStatus();
          setSubscriptionStatus(status);
        } catch (err) {
          console.error('Failed to fetch subscription status:', err);
        }

        setCheckingAuth(false);
      }
    };

    loadUserData();
  }, [router]);

  const handleLogout = () => {
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
    localStorage.removeItem('user');
    router.push('/login');
  };

  if (checkingAuth) {
    return null;
  }

  const isPro = subscriptionStatus?.tier === 'pro';
  const isPremium = subscriptionStatus?.tier === 'premium';
  const isFree = subscriptionStatus?.tier === 'free';

  return (
    <div className="min-h-screen bg-white">
      {/* Subtle background pattern */}
      <div className="absolute inset-0 -z-10 overflow-hidden">
        <div className="absolute left-1/2 top-0 -translate-x-1/2">
          <div className="h-[600px] w-[600px] rounded-full bg-gradient-to-br from-gray-100 via-gray-50 to-transparent blur-3xl opacity-60" />
        </div>
      </div>

      <div className="mx-auto max-w-4xl px-4 py-12 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-12">
          <h1 className="mb-2 text-4xl font-bold tracking-tight text-gray-900">
            Account Settings
          </h1>
          <p className="text-base font-light text-gray-600">
            Manage your profile and subscription
          </p>
        </div>

        {/* Profile Information */}
        <Card className="mb-6 border-gray-200 shadow-sm">
          <CardHeader className="space-y-1 pb-6">
            <div className="flex items-center gap-2">
              <User className="h-5 w-5 text-gray-900" />
              <CardTitle className="text-xl font-semibold tracking-tight">
                Profile Information
              </CardTitle>
            </div>
            <CardDescription className="text-base">
              Your account details
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium text-gray-700">Name</label>
                <p className="mt-1 text-base text-gray-900">
                  {user?.name || 'Not set'}
                </p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700">Email</label>
                <p className="mt-1 text-base text-gray-900">{user?.email}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700">Role</label>
                <p className="mt-1">
                  <span className="inline-flex items-center rounded-full bg-gray-100 px-3 py-1 text-sm font-medium text-gray-900">
                    {user?.role === 'admin' && <Shield className="mr-1 h-3 w-3" />}
                    {user?.role || 'user'}
                  </span>
                </p>
              </div>

              <div className="pt-4">
                <Link href="/forgot-password">
                  <Button variant="outline" className="border-gray-300">
                    Change Password
                  </Button>
                </Link>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Subscription Status */}
        <Card className="mb-6 border-gray-200 shadow-sm">
          <CardHeader className="space-y-1 pb-6">
            <div className="flex items-center gap-2">
              <CreditCard className="h-5 w-5 text-gray-900" />
              <CardTitle className="text-xl font-semibold tracking-tight">
                Subscription
              </CardTitle>
            </div>
            <CardDescription className="text-base">
              Your current plan and billing
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium text-gray-700">Current Plan</label>
                <p className="mt-1">
                  {isPro && (
                    <span className="inline-flex items-center gap-1 rounded-full bg-gray-900 px-3 py-1 text-sm font-semibold text-white">
                      <Zap className="h-3 w-3" />
                      Pro - $5/month
                    </span>
                  )}
                  {isPremium && (
                    <span className="inline-flex items-center gap-1 rounded-full bg-purple-900 px-3 py-1 text-sm font-semibold text-white">
                      <Shield className="h-3 w-3" />
                      Premium
                    </span>
                  )}
                  {isFree && (
                    <span className="inline-flex items-center rounded-full bg-gray-100 px-3 py-1 text-sm font-medium text-gray-900">
                      Free - 1 rip/day
                    </span>
                  )}
                </p>
              </div>

              {isFree && (
                <div className="rounded-xl bg-gray-50 p-4">
                  <p className="mb-3 text-sm text-gray-700">
                    Upgrade to Pro for unlimited rips and priority processing
                  </p>
                  <Link href="/upgrade">
                    <Button className="bg-gray-900 text-white hover:bg-gray-800">
                      <Zap className="mr-2 h-4 w-4" />
                      Upgrade to Pro
                    </Button>
                  </Link>
                </div>
              )}

              {(isPro || isPremium) && (
                <div className="rounded-xl bg-green-50 p-4">
                  <p className="mb-2 text-sm font-medium text-green-900">
                    ✓ You have unlimited access
                  </p>
                  <p className="text-xs text-green-700">
                    Enjoy unlimited rips with no daily limits
                  </p>
                </div>
              )}

              {isPro && (
                <div className="pt-2">
                  <p className="mb-2 text-xs text-gray-500">
                    Need to cancel or manage your subscription?
                  </p>
                  <p className="text-xs text-gray-500">
                    Contact us at{' '}
                    <a
                      href="mailto:support@scriptripper.dev"
                      className="font-medium text-gray-900 hover:underline"
                    >
                      support@scriptripper.dev
                    </a>
                  </p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Usage Stats (Placeholder) */}
        <Card className="mb-6 border-gray-200 shadow-sm">
          <CardHeader className="space-y-1 pb-6">
            <div className="flex items-center gap-2">
              <Mail className="h-5 w-5 text-gray-900" />
              <CardTitle className="text-xl font-semibold tracking-tight">
                Usage This Month
              </CardTitle>
            </div>
            <CardDescription className="text-base">
              Your rip history and usage
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="rounded-xl bg-gray-50 p-6 text-center">
              <p className="text-sm text-gray-600">
                Usage tracking coming soon! For now, enjoy your{' '}
                {isFree ? 'daily rip' : 'unlimited rips'}.
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Danger Zone */}
        <Card className="border-red-200 shadow-sm">
          <CardHeader className="space-y-1 pb-6">
            <CardTitle className="text-xl font-semibold tracking-tight text-red-900">
              Danger Zone
            </CardTitle>
            <CardDescription className="text-base">
              Irreversible actions
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <Button
                  onClick={handleLogout}
                  variant="outline"
                  className="border-red-300 text-red-900 hover:bg-red-50"
                >
                  <LogOut className="mr-2 h-4 w-4" />
                  Log Out
                </Button>
              </div>
              <div className="rounded-lg border border-red-200 bg-red-50 p-4">
                <p className="mb-2 text-sm font-medium text-red-900">
                  Delete Account
                </p>
                <p className="mb-3 text-xs text-red-700">
                  Permanently delete your account and all associated data. This action cannot be undone.
                </p>
                <Button
                  variant="outline"
                  disabled
                  className="border-red-300 text-red-900"
                  size="sm"
                >
                  Delete Account (Coming Soon)
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Back to Home */}
        <div className="mt-8 text-center">
          <Link href="/" className="text-sm text-gray-600 hover:text-gray-900 hover:underline">
            ← Back to Home
          </Link>
        </div>
      </div>
    </div>
  );
}
