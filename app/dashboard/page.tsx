'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/components/AuthProvider';
import AddChildForm from '@/components/AddChildForm';
import AddGradeForm from '@/components/AddGradeForm';
import Link from 'next/link';
import { getIdToken } from 'firebase/auth';
import { useUserPlan } from '@/hooks/useUserPlan';
import UpgradeBanner from '@/components/UpgradeBanner';

// --- TYPES ---
type Child = {
  id: string;
  firstName: string;
  lastName?: string;
  gradeLevel?: string;
};

type Grade = {
  id: string;
  childId: string;
  value: number;
  subject: string;
  createdAt: string;
};

// --- COMPUTE AVERAGE ---
function computeAverage(grades: Grade[]) {
  if (!grades.length) return null;
  const sum = grades.reduce((acc, g) => acc + g.value, 0);
  return Math.round((sum / grades.length) * 100) / 100;
}

export default function DashboardPage() {
  const { user } = useAuth();
  const { plan, loading: planLoading } = useUserPlan();

  const [children, setChildren] = useState<Child[]>([]);
  const [loading, setLoading] = useState(true);

  // --- API CHILDREN ---
  const refresh = async () => {
    if (!user) return;

    setLoading(true);
    try {
      const token = await getIdToken(user, true);

      const res = await fetch('/api/children/list', {
        headers: { Authorization: `Bearer ${token}` },
      });

      const json = await res.json();
      setChildren(json.children || []);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user) refresh();
  }, [user]);

  // --- NO USER ---
  if (!user) {
    return (
      <div className="rounded-xl border bg-white p-6">
        <p className="text-gray-700">Veuillez vous connecter.</p>
        <Link
          className="mt-3 inline-block rounded-md bg-gray-900 px-4 py-2 text-white"
          href="/auth/login"
        >
          Se connecter
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* HEADER */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <h1 className="text-2xl font-semibold">Bienvenue 👋</h1>

          {!planLoading && (
            <span
              className={`rounded-md px-2 py-1 text-xs font-medium ${
                plan === 'premium'
                  ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                  : 'bg-amber-50 text-amber-800 border border-amber-200'
              }`}
            >
              Plan : {plan}
            </span>
          )}
        </div>

        <Link href="/pricing" className="text-sm text-gray-600 hover:text-gray-900">
          Voir les tarifs
        </Link>
      </div>

      {/* BANNIÈRE PREMIUM */}
      {!planLoading && <UpgradeBanner plan={plan} />}

      {/* ADD CHILD */}
      <div className="rounded-xl border bg-white p-6">
        <div className="mb-3 flex items-center justify-between">
          <h2 className="text-lg font-semibold">Ajouter un enfant</h2>

          {!planLoading && plan !== 'premium' && (
            <span className="text-xs text-amber-700">Plan Free : 1 enfant maximum</span>
          )}
        </div>

        <AddChildForm onAdded={refresh} />
      </div>

      {/* CHILD LIST */}
      <section className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {loading && <div className="col-span-full text-gray-500">Chargement…</div>}

        {!loading && children.length === 0 && (
          <div className="col-span-full rounded-xl border bg-white p-6 text-gray-700">
            Aucun enfant pour l’instant. Ajoutez-en un ci-dessus.
          </div>
        )}

        {!loading &&
          children.map((child) => <ChildCard key={child.id} child={child} />)}
      </section>
    </div>
  );
}

// ===================== CHILD CARD ======================
function ChildCard({ child }: { child: Child }) {
  const [grades, setGrades] = useState<Grade[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  // --- API GRADES ---
  const refreshGrades = async () => {
    if (!child.id || !user) return;

    setLoading(true);
    try {
      const token = await getIdToken(user, true);

      const res = await fetch(`/api/grades/list?childId=${child.id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      const json = await res.json();
      setGrades(json.grades || []);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    refreshGrades();
  }, [child.id]);

  const avg = computeAverage(grades);

  return (
    <div className="flex flex-col gap-4 rounded-xl border bg-white p-5">
      <div className="flex items-start justify-between">
        <div>
          <h3 className="text-lg font-semibold">
            {child.firstName} {child.lastName || ''}
          </h3>

          {child.gradeLevel && (
            <p className="text-sm text-gray-600">Classe : {child.gradeLevel}</p>
          )}
        </div>

        <div className="rounded-md bg-indigo-50 px-3 py-1 text-sm font-medium text-indigo-700">
          Moyenne : {avg ? `${avg}/20` : '—'}
        </div>
      </div>

      {/* Add grade */}
      {child.id && <AddGradeForm childId={child.id} onAdded={refreshGrades} />}

      {/* See details */}
      <div className="text-right">
        <Link
          href={`/dashboard/children/${child.id}`}
          className="text-sm text-gray-700 underline hover:text-gray-900"
        >
          Voir le détail
        </Link>
      </div>
    </div>
  );
}