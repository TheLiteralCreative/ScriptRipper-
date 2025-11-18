'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Sparkles, Loader2 } from 'lucide-react';
import { authApi } from '@/lib/api';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [loadingMessage, setLoadingMessage] = useState('Signing in...');
  const [loadingStartTime, setLoadingStartTime] = useState<number | null>(null);

  // Progressive loading messages based on elapsed time
  useEffect(() => {
    if (!isLoading || loadingStartTime === null) return;

    const interval = setInterval(() => {
      const elapsed = Date.now() - loadingStartTime;

      if (elapsed < 2000) {
        setLoadingMessage('Signing in...');
      } else if (elapsed < 5000) {
        setLoadingMessage('Connecting to server...');
      } else {
        setLoadingMessage('Waking up server... (first login may take 30-60 seconds)');
      }
    }, 500);

    return () => clearInterval(interval);
  }, [isLoading, loadingStartTime]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);
    setLoadingStartTime(Date.now());
    setLoadingMessage('Signing in...');

    try {
      const response = await authApi.login(email, password);

      // Store tokens
      localStorage.setItem('access_token', response.tokens.access_token);
      localStorage.setItem('refresh_token', response.tokens.refresh_token);
      localStorage.setItem('user', JSON.stringify(response.user));

      // Redirect to home
      router.push('/');
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Login failed. Please try again.');
    } finally {
      setIsLoading(false);
      setLoadingStartTime(null);
    }
  };

  const handleQuickLogin = async (role: 'admin' | 'user') => {
    const credentials = {
      admin: { email: 'admin@scriptripper.dev', password: 'admin123' },
      user: { email: 'user@scriptripper.dev', password: 'user123' },
    };

    setEmail(credentials[role].email);
    setPassword(credentials[role].password);

    // Trigger login
    setTimeout(() => {
      const form = document.querySelector('form') as HTMLFormElement;
      form.requestSubmit();
    }, 100);
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-white p-4">
      {/* Subtle background pattern */}
      <div className="absolute inset-0 -z-10 overflow-hidden">
        <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2">
          <div className="h-[800px] w-[800px] rounded-full bg-gradient-to-br from-gray-100 via-gray-50 to-transparent blur-3xl opacity-60" />
        </div>
      </div>

      {/* Return to Home Link */}
      <div className="absolute left-4 top-4 sm:left-8 sm:top-8">
        <Link
          href="/"
          className="text-sm text-gray-600 hover:text-gray-900 transition-colors flex items-center gap-1"
        >
          ← Home
        </Link>
      </div>

      <div className="w-full max-w-md">
        {/* Header */}
        <div className="mb-8 text-center animate-in">
          <div className="mb-4 flex items-center justify-center">
            <Sparkles className="h-10 w-10 text-gray-900" />
          </div>
          <h1 className="mb-2 text-5xl font-bold tracking-tight text-gray-900">
            ScriptRipper
          </h1>
          <p className="text-base font-light text-gray-600">Sign in to your account</p>
        </div>

        {/* Login Card */}
        <div className="animate-slide-up">
          <Card className="border-gray-200 shadow-sm">
            <CardHeader className="space-y-1 pb-6">
              <CardTitle className="text-2xl font-semibold tracking-tight">Login</CardTitle>
              <CardDescription className="text-base">
                Enter your credentials to access ScriptRipper
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleLogin} className="space-y-5">
                {/* Email */}
                <div>
                  <label
                    htmlFor="email"
                    className="mb-2 block text-sm font-medium text-gray-900"
                  >
                    Email
                  </label>
                  <input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    className="w-full rounded-xl border border-gray-300 p-3 text-sm transition-all focus:border-gray-900 focus:outline-none focus:ring-2 focus:ring-gray-900/10"
                    placeholder="admin@scriptripper.dev"
                  />
                </div>

                {/* Password */}
                <div>
                  <div className="mb-2 flex items-center justify-between">
                    <label
                      htmlFor="password"
                      className="text-sm font-medium text-gray-900"
                    >
                      Password
                    </label>
                    <Link
                      href="/forgot-password"
                      className="text-xs text-gray-600 hover:text-gray-900 hover:underline"
                    >
                      Forgot password?
                    </Link>
                  </div>
                  <input
                    id="password"
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    className="w-full rounded-xl border border-gray-300 p-3 text-sm transition-all focus:border-gray-900 focus:outline-none focus:ring-2 focus:ring-gray-900/10"
                    placeholder="••••••••"
                  />
                </div>

                {/* Error Message */}
                {error && (
                  <div className="rounded-xl bg-red-50 p-4 text-sm text-red-800">
                    {error}
                  </div>
                )}

                {/* Loading Message */}
                {isLoading && (
                  <div className="rounded-xl bg-blue-50 p-4 text-sm text-blue-800 flex items-center gap-3">
                    <Loader2 className="h-4 w-4 animate-spin" />
                    <span>{loadingMessage}</span>
                  </div>
                )}

                {/* Submit Button */}
                <Button
                  type="submit"
                  disabled={isLoading}
                  className="w-full bg-gray-900 text-white hover:bg-gray-800 disabled:bg-gray-200 disabled:text-gray-400 transition-all"
                  size="lg"
                >
                  {isLoading ? (
                    <span className="flex items-center gap-2">
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Please wait...
                    </span>
                  ) : (
                    'Sign In →'
                  )}
                </Button>
              </form>

              {/* Divider */}
              <div className="relative my-8">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-gray-200"></div>
                </div>
                <div className="relative flex justify-center text-sm">
                  <span className="bg-white px-4 text-gray-400 font-medium">
                    Quick Login (Dev)
                  </span>
                </div>
              </div>

              {/* Quick Login Buttons */}
              <div className="grid gap-3">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => handleQuickLogin('admin')}
                  disabled={isLoading}
                  className="w-full border-gray-300 transition-all hover:scale-[1.01] active:scale-[0.99]"
                >
                  Login as Admin
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => handleQuickLogin('user')}
                  disabled={isLoading}
                  className="w-full border-gray-300 transition-all hover:scale-[1.01] active:scale-[0.99]"
                >
                  Login as User
                </Button>
              </div>

              {/* Register Link */}
              <div className="mt-6 text-center">
                <p className="text-sm text-gray-600">
                  Don't have an account?{' '}
                  <Link
                    href="/register"
                    className="font-medium text-gray-900 hover:underline"
                  >
                    Sign up
                  </Link>
                </p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Footer */}
        <p className="mt-8 text-center text-sm text-gray-400">
          Demo credentials are pre-filled for testing
        </p>
      </div>
    </div>
  );
}
