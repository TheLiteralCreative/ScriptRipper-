'use client';

import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { XCircle, ArrowLeft, Zap } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';

export default function SubscriptionCancelPage() {
  const router = useRouter();

  return (
    <div className="min-h-screen bg-white">
      {/* Subtle background pattern */}
      <div className="absolute inset-0 -z-10 overflow-hidden">
        <div className="absolute left-1/2 top-0 -translate-x-1/2">
          <div className="h-[600px] w-[600px] rounded-full bg-gradient-to-br from-gray-100 via-gray-50 to-transparent blur-3xl opacity-60" />
        </div>
      </div>

      <div className="mx-auto max-w-2xl px-4 py-12 sm:px-6 lg:px-8">
        {/* Cancel Header */}
        <div className="mb-12 text-center animate-in">
          <div className="mb-6 flex justify-center">
            <div className="rounded-full bg-gray-100 p-6">
              <XCircle className="h-16 w-16 text-gray-600" />
            </div>
          </div>
          <h1 className="mb-3 text-5xl font-bold tracking-tight text-gray-900">
            Checkout Cancelled
          </h1>
          <p className="text-lg font-light text-gray-600">
            No charges were made to your account
          </p>
        </div>

        {/* Info Card */}
        <Card className="mb-8 border-gray-200 shadow-sm">
          <CardHeader className="space-y-1 pb-6">
            <CardTitle className="text-2xl font-semibold tracking-tight">
              What happened?
            </CardTitle>
            <CardDescription className="text-base">
              You've cancelled the checkout process
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-gray-600 mb-6">
              That's okay! You can upgrade to Pro anytime you're ready. Your free account is still active and you can continue using ScriptRipper with the free tier limits.
            </p>

            <div className="space-y-3">
              <Link href="/upgrade">
                <Button className="w-full bg-gray-900 text-white hover:bg-gray-800" size="lg">
                  <Zap className="mr-2 h-5 w-5" />
                  Try Upgrading Again
                </Button>
              </Link>

              <Link href="/">
                <Button variant="outline" className="w-full border-gray-300" size="lg">
                  <ArrowLeft className="mr-2 h-5 w-5" />
                  Back to Home
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>

        {/* Why Upgrade Card */}
        <Card className="border-gray-200 bg-gray-50">
          <CardContent className="py-8">
            <h3 className="mb-4 text-center text-lg font-semibold text-gray-900">
              Still considering Pro?
            </h3>
            <ul className="space-y-2 text-sm text-gray-600">
              <li className="flex items-center gap-2">
                <div className="h-1.5 w-1.5 rounded-full bg-gray-900" />
                <span><strong>Unlimited rips</strong> - No daily limits</span>
              </li>
              <li className="flex items-center gap-2">
                <div className="h-1.5 w-1.5 rounded-full bg-gray-900" />
                <span><strong>Priority processing</strong> - Faster results</span>
              </li>
              <li className="flex items-center gap-2">
                <div className="h-1.5 w-1.5 rounded-full bg-gray-900" />
                <span><strong>Email support</strong> - Get help when you need it</span>
              </li>
              <li className="flex items-center gap-2">
                <div className="h-1.5 w-1.5 rounded-full bg-gray-900" />
                <span><strong>Cancel anytime</strong> - No long-term commitment</span>
              </li>
            </ul>
            <p className="mt-6 text-center text-xs text-gray-500">
              Questions? Contact us at{' '}
              <a
                href="mailto:support@scriptripper.dev"
                className="font-medium text-gray-900 hover:underline"
              >
                support@scriptripper.dev
              </a>
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
