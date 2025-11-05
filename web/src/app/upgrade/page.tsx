'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Check, Zap, Sparkles } from 'lucide-react';
import { billingApi } from '@/lib/api';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';

export default function UpgradePage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [subscriptionStatus, setSubscriptionStatus] = useState<any>(null);
  const [checkingAuth, setCheckingAuth] = useState(true);

  useEffect(() => {
    const checkAuthAndSubscription = async () => {
      if (typeof window !== 'undefined') {
        const token = localStorage.getItem('access_token');
        if (!token) {
          router.push('/login');
          return;
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

    checkAuthAndSubscription();
  }, [router]);

  const handleUpgrade = async () => {
    setError('');
    setIsLoading(true);

    try {
      const { url } = await billingApi.createCheckoutSession();
      // Redirect to Stripe checkout
      window.location.href = url;
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Failed to start checkout. Please try again.');
      setIsLoading(false);
    }
  };

  if (checkingAuth) {
    return null;
  }

  const isPro = subscriptionStatus?.tier === 'pro' || subscriptionStatus?.tier === 'premium';

  return (
    <div className="min-h-screen bg-white">
      {/* Subtle background pattern */}
      <div className="absolute inset-0 -z-10 overflow-hidden">
        <div className="absolute left-1/2 top-0 -translate-x-1/2">
          <div className="h-[600px] w-[600px] rounded-full bg-gradient-to-br from-gray-100 via-gray-50 to-transparent blur-3xl opacity-60" />
        </div>
      </div>

      <div className="mx-auto max-w-6xl px-4 py-12 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-12 text-center">
          <div className="mb-4 flex items-center justify-center">
            <Zap className="h-10 w-10 text-gray-900" />
          </div>
          <h1 className="mb-3 text-5xl font-bold tracking-tight text-gray-900">
            Upgrade to ScriptRipper Pro
          </h1>
          <p className="text-lg font-light text-gray-600">
            Unlimited rips, unlimited insights
          </p>
        </div>

        {/* Pricing Cards */}
        <div className="grid gap-8 md:grid-cols-2 mb-12">
          {/* Free Tier */}
          <Card className="border-gray-200 shadow-sm">
            <CardHeader className="space-y-1 pb-6">
              <CardTitle className="text-2xl font-semibold tracking-tight">Free</CardTitle>
              <CardDescription className="text-base">
                Perfect for trying out ScriptRipper
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="mb-6">
                <div className="text-4xl font-bold text-gray-900">$0</div>
                <div className="text-sm text-gray-500">forever</div>
              </div>

              <ul className="space-y-3 mb-6">
                <li className="flex items-start gap-2">
                  <Check className="h-5 w-5 flex-shrink-0 text-gray-900 mt-0.5" />
                  <span className="text-sm text-gray-700">
                    <strong>1 rip per day</strong> (up to 5 prompts per rip)
                  </span>
                </li>
                <li className="flex items-start gap-2">
                  <Check className="h-5 w-5 flex-shrink-0 text-gray-900 mt-0.5" />
                  <span className="text-sm text-gray-700">
                    All standard analysis prompts
                  </span>
                </li>
                <li className="flex items-start gap-2">
                  <Check className="h-5 w-5 flex-shrink-0 text-gray-900 mt-0.5" />
                  <span className="text-sm text-gray-700">
                    Custom prompts supported
                  </span>
                </li>
                <li className="flex items-start gap-2">
                  <Check className="h-5 w-5 flex-shrink-0 text-gray-900 mt-0.5" />
                  <span className="text-sm text-gray-700">
                    Multi-format export (.md, .txt, .json)
                  </span>
                </li>
              </ul>

              {!isPro ? (
                <Button variant="outline" disabled className="w-full border-gray-300">
                  Current Plan
                </Button>
              ) : (
                <div className="text-center text-sm text-gray-500 py-2">
                  You're on Pro
                </div>
              )}
            </CardContent>
          </Card>

          {/* Pro Tier */}
          <Card className="border-gray-900 shadow-lg relative overflow-hidden">
            {/* Popular badge */}
            <div className="absolute top-0 right-0 bg-gray-900 text-white text-xs font-semibold px-3 py-1 rounded-bl-lg">
              POPULAR
            </div>

            <CardHeader className="space-y-1 pb-6">
              <CardTitle className="text-2xl font-semibold tracking-tight">Pro</CardTitle>
              <CardDescription className="text-base">
                For power users who need unlimited access
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="mb-6">
                <div className="text-4xl font-bold text-gray-900">$5</div>
                <div className="text-sm text-gray-500">per month</div>
              </div>

              <ul className="space-y-3 mb-6">
                <li className="flex items-start gap-2">
                  <Sparkles className="h-5 w-5 flex-shrink-0 text-gray-900 mt-0.5" />
                  <span className="text-sm text-gray-700">
                    <strong>Unlimited rips</strong> (no daily limit)
                  </span>
                </li>
                <li className="flex items-start gap-2">
                  <Check className="h-5 w-5 flex-shrink-0 text-gray-900 mt-0.5" />
                  <span className="text-sm text-gray-700">
                    Everything in Free
                  </span>
                </li>
                <li className="flex items-start gap-2">
                  <Check className="h-5 w-5 flex-shrink-0 text-gray-900 mt-0.5" />
                  <span className="text-sm text-gray-700">
                    Priority processing
                  </span>
                </li>
                <li className="flex items-start gap-2">
                  <Check className="h-5 w-5 flex-shrink-0 text-gray-900 mt-0.5" />
                  <span className="text-sm text-gray-700">
                    Email support
                  </span>
                </li>
                <li className="flex items-start gap-2">
                  <Check className="h-5 w-5 flex-shrink-0 text-gray-900 mt-0.5" />
                  <span className="text-sm text-gray-700">
                    Cancel anytime
                  </span>
                </li>
              </ul>

              {error && (
                <div className="mb-4 rounded-xl bg-red-50 p-3 text-sm text-red-800">
                  {error}
                </div>
              )}

              {isPro ? (
                <Button disabled className="w-full bg-gray-900 text-white">
                  ✓ Current Plan
                </Button>
              ) : (
                <Button
                  onClick={handleUpgrade}
                  disabled={isLoading}
                  className="w-full bg-gray-900 text-white hover:bg-gray-800 disabled:bg-gray-200 disabled:text-gray-400"
                  size="lg"
                >
                  {isLoading ? 'Starting checkout...' : 'Upgrade to Pro →'}
                </Button>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Premium Tier Info */}
        <Card className="border-gray-200 bg-gray-50">
          <CardContent className="py-8">
            <div className="text-center">
              <h3 className="mb-2 text-lg font-semibold text-gray-900">
                Need to use your own API key?
              </h3>
              <p className="mb-4 text-sm text-gray-600">
                Premium tier lets you bring your own Gemini API key for unlimited usage with no monthly fee.
              </p>
              <p className="text-xs text-gray-500">
                Contact us at support@scriptripper.dev to upgrade to Premium
              </p>
            </div>
          </CardContent>
        </Card>

        {/* FAQ */}
        <div className="mt-16">
          <h2 className="mb-8 text-center text-3xl font-bold tracking-tight text-gray-900">
            Frequently Asked Questions
          </h2>
          <div className="grid gap-6 md:grid-cols-2">
            <Card className="border-gray-200">
              <CardContent className="pt-6">
                <h3 className="mb-2 font-semibold text-gray-900">What's a "rip"?</h3>
                <p className="text-sm text-gray-600">
                  A rip is one analysis session where you can apply up to 5 prompts to a single transcript. Free users get 1 rip per day.
                </p>
              </CardContent>
            </Card>

            <Card className="border-gray-200">
              <CardContent className="pt-6">
                <h3 className="mb-2 font-semibold text-gray-900">Can I cancel anytime?</h3>
                <p className="text-sm text-gray-600">
                  Yes! Pro subscriptions can be cancelled at any time. You'll keep access until the end of your billing period.
                </p>
              </CardContent>
            </Card>

            <Card className="border-gray-200">
              <CardContent className="pt-6">
                <h3 className="mb-2 font-semibold text-gray-900">What payment methods do you accept?</h3>
                <p className="text-sm text-gray-600">
                  We accept all major credit cards through Stripe's secure payment processing.
                </p>
              </CardContent>
            </Card>

            <Card className="border-gray-200">
              <CardContent className="pt-6">
                <h3 className="mb-2 font-semibold text-gray-900">Do you offer refunds?</h3>
                <p className="text-sm text-gray-600">
                  We offer a 7-day money-back guarantee. If you're not satisfied, contact us for a full refund.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
