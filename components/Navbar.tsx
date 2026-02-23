'use client';

import Link from 'next/link';
import { useAuth } from './AuthProvider';
import { logoutUser } from '@/lib/auth';
import { usePathname, useRouter } from 'next/navigation';
import { useState } from 'react';

export default function Navbar() {
  const { user } = useAuth();
  const pathname = usePathname();
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const onLogout = async () => {
    setLoading(true);
    try {
      await logoutUser();
      router.push('/');
    } finally {
      setLoading(false);
    }
  };

  const isActive = (path: string) =>
    pathname === path ? 'text-gray-900' : 'text-gray-600 hover:text-gray-900';

  return (
    <header className="sticky top-0 z-40 w-full border-b bg-white/80 backdrop-blur">
      <nav className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3 sm:px-6 lg:px-8">
        <Link href="/" className="flex items-center gap-2">
          <div className="h-7 w-7 rounded-md bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500" />
          <span className="text-lg font-semibold">EduTrack AI</span>
        </Link>

        <div className="flex items-center gap-6">
          <Link href="/#features" className={isActive('/#features')}>Fonctionnalités</Link>
          <Link href="/pricing" className={isActive('/pricing')}>Tarifs</Link>
          {!user ? (
            <div className="flex items-center gap-2">
              <Link href="/auth/login" className="text-sm text-gray-600 hover:text-gray-900">
                Connexion
              </Link>
              <Link
                href="/auth/register"
                className="rounded-md bg-gray-900 px-3 py-2 text-sm font-medium text-white hover:bg-gray-800"
              >
                Essayer gratuitement
              </Link>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <Link
                href="/dashboard"
                className="rounded-md border border-gray-200 px-3 py-2 text-sm font-medium hover:bg-gray-50"
              >
                Dashboard
              </Link>
              <button
                onClick={onLogout}
                disabled={loading}
                className="rounded-md bg-gray-900 px-3 py-2 text-sm font-medium text-white hover:bg-gray-800 disabled:opacity-60"
              >
                {loading ? 'Déconnexion…' : 'Se déconnecter'}
              </button>
            </div>
          )}
        </div>
      </nav>
    </header>
  );
}