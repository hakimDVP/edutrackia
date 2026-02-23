'use client';

import Link from 'next/link';

export default function UpgradeBanner({ plan }: { plan: 'free'|'premium'|string }) {
  if (plan === 'premium') return null;

  return (
    <div className="my-4 rounded-md border bg-white p-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h3 className="font-semibold">Débloquez EduTrack Premium</h3>
          <p className="text-sm text-gray-600">
            Enfants illimités, analyse IA, alertes intelligentes et statistiques avancées.
          </p>
        </div>
        <Link
          href="/pricing"
          className="inline-flex items-center justify-center rounded-md bg-gray-900 px-4 py-2 text-sm font-medium text-white hover:bg-gray-800">
          Passer en Premium
        </Link>
      </div>
    </div>
  );
}