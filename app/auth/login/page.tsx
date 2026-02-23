'use client';

import { useState } from 'react';
import { loginUser } from '@/lib/auth';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function LoginPage() {
  const [email, setEmail] = useState(''); 
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      await loginUser(email, password);
      router.push('/dashboard');
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="mx-auto grid max-w-md gap-6 py-10">
      <div className="rounded-2xl border bg-white p-6 shadow-sm">
        <div className="mb-6 text-center">
          <div className="mx-auto h-10 w-10 rounded-md bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500" />
          <h1 className="mt-3 text-2xl font-semibold">Connexion</h1>
          <p className="text-sm text-gray-600">Heureux de vous revoir 👋</p>
        </div>

        <form onSubmit={onSubmit} className="space-y-4">
          <div>
            <label className="mb-1 block text-sm font-medium">Email</label>
            <input
              className="w-full rounded-md border px-3 py-2 focus:outline-none focus:ring-2 focus:ring-gray-900/10"
              placeholder="vous@exemple.com"
              type="email"
              required
              value={email}
              onChange={e=>setEmail(e.target.value)}
            />
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium">Mot de passe</label>
            <input
              className="w-full rounded-md border px-3 py-2 focus:outline-none focus:ring-2 focus:ring-gray-900/10"
              placeholder="••••••••"
              type="password"
              required
              value={password}
              onChange={e=>setPassword(e.target.value)}
            />
          </div>

          {error && <p className="text-sm text-red-600">{error}</p>}

          <button
            className="w-full rounded-md bg-gray-900 px-4 py-2 text-white hover:bg-gray-800 disabled:opacity-60"
            type="submit"
            disabled={loading}
          >
            {loading ? 'Connexion…' : 'Se connecter'}
          </button>
        </form>
      </div>

      <p className="text-center text-sm text-gray-600">
        Pas encore de compte ?{' '}
        <Link href="/auth/register" className="font-medium text-gray-900 underline">
          Créer un compte
        </Link>
      </p>
    </div>
  );
}