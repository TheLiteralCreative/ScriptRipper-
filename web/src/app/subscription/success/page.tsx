'use client';

import { useEffect, useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { CheckCircle2, Sparkles, Home } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';

function SubscriptionSuccessContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [sessionId, setSessionId] = useState('');

  useEffect(() => {
    const sid = searchParams.get('session_id');
    if (sid) {
      setSessionId(sid);
    }

    // Refresh user data to get updated subscription status
    // In a real app, you might want to call an endpoint to verify the session
    setTimeout(() => {
      // Clear any cached user data
      const user = localStorage.getItem('user');
      if (user) {
        const userData = JSON.parse(user);
        userData.subscription_tier = 'pro';
        localStorage.setItem('user', JSON.stringify(userData));
      }
    }, 1000);
  }, [searchParams]);

  return (
    <div className="min-h-screen bg-white">
      {/* Subtle background pattern */}
      <div className="absolute inset-0 -z-10 overflow-hidden">
        <div className="absolute left-1/2 top-0 -translate-x-1/2">
          <div className="h-[600px] w-[600px] rounded-full bg-gradient-to-br from-gray-100 via-gray-50 to-transparent blur-3xl opacity-60" />
        </div>
      </div>

      <div className="mx-auto max-w-2xl px-4 py-12 sm:px-6 lg:px-8">
        {/* Success Header */}
        <div className="mb-12 text-center animate-in">
          <div className="mb-6 flex justify-center">
            <div className="rounded-full bg-green-100 p-6">
              <CheckCircle2 className="h-16 w-16 text-green-600" />
            </div>
          </div>
          <h1 className="mb-3 text-5xl font-bold tracking-tight text-gray-900">
            Welcome to Pro! 🎉
          </h1>
          <p className="text-lg font-light text-gray-600">
            Your subscription is now active
          </p>
        </div>

        {/* Success Card */}
        <Card className="mb-8 border-gray-200 shadow-sm">
          <CardHeader className="space-y-1 pb-6">
            <CardTitle className="text-2xl font-semibold tracking-tight">
              You're all set!
            </CardTitle>
            <CardDescription className="text-base">
              Here's what you get with ScriptRipper Pro
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4 mb-6">
              <div className="flex items-start gap-3 p-4 bg-gray-50 rounded-xl">
                <Sparkles className="h-5 w-5 flex-shrink-0 text-gray-900 mt-0.5" />
                <div>
                  <h3 className="font-semibold text-gray-900 mb-1">Unlimited Rips</h3>
                  <p className="text-sm text-gray-600">
                    No more daily limits. Analyze as many transcripts as you need.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3 p-4 bg-gray-50 rounded-xl">
                <CheckCircle2 className="h-5 w-5 flex-shrink-0 text-gray-900 mt-0.5" />
                <div>
                  <h3 className="font-semibold text-gray-900 mb-1">Priority Processing</h3>
                  <p className="text-sm text-gray-600">
                    Your analyses are processed faster than free tier users.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3 p-4 bg-gray-50 rounded-xl">
                <CheckCircle2 className="h-5 w-5 flex-shrink-0 text-gray-900 mt-0.5" />
                <div>
                  <h3 className="font-semibold text-gray-900 mb-1">Email Support</h3>
                  <p className="text-sm text-gray-600">
                    Get help when you need it at support@scriptripper.dev
                  </p>
                </div>
              </div>
            </div>

            {sessionId && (
              <div className="mb-6 p-3 bg-blue-50 rounded-lg">
                <p className="text-xs text-blue-800">
                  <strong>Payment confirmed</strong>
                  <br />
                  Session ID: {sessionId.slice(0, 20)}...
                </p>
              </div>
            )}

            <div className="flex gap-3">
              <Link href="/" className="flex-1">
                <Button className="w-full bg-gray-900 text-white hover:bg-gray-800" size="lg">
                  <Home className="mr-2 h-5 w-5" />
                  Start Ripping!
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>

        {/* Additional Info */}
        <Card className="border-gray-200 bg-gray-50">
          <CardContent className="py-6">
            <div className="text-center text-sm text-gray-600">
              <p className="mb-2">
                You'll receive a receipt via email shortly.
              </p>
              <p>
                Questions? Contact us at{' '}
                <a
                  href="mailto:support@scriptripper.dev"
                  className="font-medium text-gray-900 hover:underline"
                >
                  support@scriptripper.dev
                </a>
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

export default function SubscriptionSuccessPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <SubscriptionSuccessContent />
    </Suspense>
  );
}
