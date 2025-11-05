'use client';

import { useState } from 'react';
import Link from 'next/link';
import { ArrowLeft, Sparkles } from 'lucide-react';
import { authApi } from '@/lib/api';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      await authApi.requestPasswordReset(email);
      setSuccess(true);
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Failed to send reset link. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-white p-4">
      {/* Subtle background pattern */}
      <div className="absolute inset-0 -z-10 overflow-hidden">
        <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2">
          <div className="h-[800px] w-[800px] rounded-full bg-gradient-to-br from-gray-100 via-gray-50 to-transparent blur-3xl opacity-60" />
        </div>
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
          <p className="text-base font-light text-gray-600">Reset your password</p>
        </div>

        {/* Forgot Password Card */}
        <div className="animate-slide-up">
          <Card className="border-gray-200 shadow-sm">
            <CardHeader className="space-y-1 pb-6">
              <CardTitle className="text-2xl font-semibold tracking-tight">
                Forgot Password
              </CardTitle>
              <CardDescription className="text-base">
                {success
                  ? 'Check your email for reset instructions'
                  : 'Enter your email to receive a password reset link'}
              </CardDescription>
            </CardHeader>
            <CardContent>
              {success ? (
                <div className="space-y-4">
                  <div className="rounded-xl bg-gray-50 p-4 text-sm text-gray-700">
                    <p className="mb-2 font-medium">Reset link sent!</p>
                    <p className="text-gray-600">
                      If an account exists with the email <strong>{email}</strong>, you will
                      receive a password reset link shortly.
                    </p>
                    <p className="mt-2 text-xs text-gray-500">
                      Note: For development, check the backend console for the reset link.
                    </p>
                  </div>
                  <Link href="/login">
                    <Button variant="outline" className="w-full border-gray-300">
                      <ArrowLeft className="mr-2 h-4 w-4" />
                      Back to Login
                    </Button>
                  </Link>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-5">
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
                      placeholder="you@example.com"
                    />
                  </div>

                  {/* Error Message */}
                  {error && (
                    <div className="rounded-xl bg-red-50 p-4 text-sm text-red-800">
                      {error}
                    </div>
                  )}

                  {/* Submit Button */}
                  <Button
                    type="submit"
                    disabled={isLoading}
                    className="w-full bg-gray-900 text-white hover:bg-gray-800 disabled:bg-gray-200 disabled:text-gray-400 transition-all"
                    size="lg"
                  >
                    {isLoading ? 'Sending...' : 'Send Reset Link →'}
                  </Button>

                  {/* Back to Login */}
                  <Link href="/login">
                    <Button
                      type="button"
                      variant="ghost"
                      className="w-full text-gray-600"
                    >
                      <ArrowLeft className="mr-2 h-4 w-4" />
                      Back to Login
                    </Button>
                  </Link>
                </form>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
