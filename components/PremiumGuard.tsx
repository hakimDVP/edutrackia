'use client';

import { ReactNode } from 'react';
import Link from 'next/link';
import { useUserPlan } from '@/hooks/useUserPlan';

export default function PremiumGuard({ children }: { children: ReactNode }) {
  const { plan, loading } = useUserPlan();

  if (loading) {
    return (
      <div className="rounded-md border bg-white p-4 text-sm text-gray-600">
        Chargement…
      </div>
    );
  }

  if (plan !== 'premium') {
    return (
      <div className="rounded-md border border-amber-300 bg-amber-50 p-4">
        <h4 className="font-medium text-amber-900">Fonctionnalité Premium</h4>
        <p className="mt-1 text-sm text-amber-800">
          Cette section est réservée aux comptes Premium. Passez au plan Premium pour y accéder.
        </p>
        <div className="mt-3">
          <Link
            href="/pricing"
            className="inline-flex items-center justify-center rounded-md bg-gray-900 px-4 py-2 text-sm font-medium text-white hover:bg-gray-800"
          >
            Voir les tarifs
          </Link>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}