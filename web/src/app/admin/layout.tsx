'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Loader2 } from 'lucide-react';

interface User {
  id: string;
  email: string;
  role: string;
  subscription_tier: string;
}

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const [isAuthorized, setIsAuthorized] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const checkAuth = () => {
      // Check if user is logged in
      const token = localStorage.getItem('access_token');
      const userStr = localStorage.getItem('user');

      if (!token || !userStr) {
        router.push('/login');
        return;
      }

      try {
        const user: User = JSON.parse(userStr);

        // Check if user is admin
        if (user.role !== 'admin') {
          // Not an admin, redirect to home
          router.push('/');
          return;
        }

        // User is authenticated and is an admin
        setIsAuthorized(true);
      } catch (error) {
        console.error('Error parsing user data:', error);
        router.push('/login');
      } finally {
        setIsLoading(false);
      }
    };

    checkAuth();
  }, [router]);

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100">
        <div className="text-center">
          <Loader2 className="h-12 w-12 animate-spin text-blue-600 mx-auto mb-4" />
          <p className="text-gray-600">Verifying admin access...</p>
        </div>
      </div>
    );
  }

  if (!isAuthorized) {
    return null; // Router will redirect
  }

  return <>{children}</>;
}
