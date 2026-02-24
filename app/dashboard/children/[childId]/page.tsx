'use client';

import { useParams } from 'next/navigation';
import { useEffect, useMemo, useState } from 'react';
import { getIdToken } from 'firebase/auth';
import { useAuth } from '@/components/AuthProvider';
import AddGradeForm from '@/components/AddGradeForm';
import Link from 'next/link';

/* ---------- TYPES ----------- */
type Child = {
  id: string;
  firstName: string;
  lastName?: string;
  gradeLevel?: string;
  parentId: string;
};

type Grade = {
  id: string;
  childId: string;
  subject: string;
  value: number;
  createdAt?: any; // Date | string | Firestore Timestamp
  coef?: number;
  date?: string;
};

/* ---------- HELPERS ---------- */
function computeAverage(grades: Grade[]) {
  if (!grades.length) return null;
  const sum = grades.reduce((acc, g) => acc + Number(g.value || 0), 0);
  return Math.round((sum / grades.length) * 100) / 100;
}

function formatDate(d: any) {
  if (!d) return '—';
  try {
    if (typeof d === 'string' || typeof d === 'number') {
      return new Date(d).toLocaleString('fr-FR');
    }
    if (typeof d === 'object' && ('seconds' in d || '_seconds' in d)) {
      const s = (d.seconds ?? d._seconds) as number;
      const ns = (d.nanoseconds ?? d._nanoseconds ?? 0) as number;
      return new Date(s * 1000 + Math.floor(ns / 1e6)).toLocaleString('fr-FR');
    }
    return '—';
  } catch {
    return '—';
  }
}

/* ---------- PAGE ---------- */
export default function ChildDetailPage() {
  const params = useParams<{ childId: string }>();
  const childId = params.childId;

  const { user } = useAuth();
  const [child, setChild] = useState<Child | null>(null);
  const [grades, setGrades] = useState<Grade[]>([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState<string | null>(null);

  const refresh = async () => {
    if (!user || !childId) return;
    setLoading(true);
    setErr(null);
    try {
      const token = await getIdToken(user, true);

      // Charger l'enfant
      const childRes = await fetch(`/api/children/get?childId=${childId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const childJson = await childRes.json();
      if (!childRes.ok) throw new Error(childJson.error || 'Erreur chargement enfant');
      setChild(childJson.child || null);

      // Charger les notes
      const gradeRes = await fetch(`/api/grades/list?childId=${childId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const gradeJson = await gradeRes.json();
      if (!gradeRes.ok) throw new Error(gradeJson.error || 'Erreur chargement notes');
      setGrades(gradeJson.grades || []);
    } catch (e: any) {
      setErr(e.message);
      setChild(null);
      setGrades([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user) refresh();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user, childId]);

  const avg = useMemo(() => computeAverage(grades), [grades]);

  // Non connecté
  if (!user) {
    return (
      <div className="rounded-xl border bg-white p-6">
        <p className="text-gray-700">Veuillez vous connecter.</p>
        <Link href="/auth/login" className="mt-3 inline-block rounded-md bg-gray-900 px-4 py-2 text-white">
          Se connecter
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <Link href="/dashboard" className="text-sm text-gray-600 hover:text-gray-900">← Retour</Link>
          <h1 className="mt-2 text-2xl font-semibold">
            {child ? `${child.firstName} ${child.lastName || ''}` : 'Enfant'}
          </h1>
          {child?.gradeLevel && <p className="text-gray-600">Classe : {child.gradeLevel}</p>}
        </div>
        <div className="rounded-md bg-indigo-50 px-3 py-1 text-sm font-medium text-indigo-700">
          Moyenne : {avg ? `${avg}/20` : '—'}
        </div>
      </div>

      {/* Ajouter une note */}
      <div className="rounded-xl border bg-white p-6">
        <h2 className="mb-3 text-lg font-semibold">Ajouter une note</h2>
        <AddGradeForm childId={childId} onAdded={refresh} />
      </div>

      {/* Liste des notes */}
      <div className="rounded-xl border bg-white p-6">
        <h2 className="mb-3 text-lg font-semibold">Notes</h2>

        {err && <p className="text-sm text-red-600">{err}</p>}
        {loading && <p className="text-sm text-gray-500">Chargement…</p>}

        {!loading && !grades.length ? (
          <p className="text-gray-600">Aucune note pour l’instant.</p>
        ) : (
          !loading && (
            <div className="overflow-x-auto">
              <table className="min-w-full text-sm">
                <thead>
                  <tr className="text-left text-gray-500">
                    <th className="py-2">Matière</th>
                    <th className="py-2">Note</th>
                    <th className="py-2">Coef</th>
                    <th className="py-2">Date</th>
                  </tr>
                </thead>
                <tbody>
                  {grades.map((g) => (
                    <tr key={g.id} className="border-t">
                      <td className="py-2">{g.subject}</td>
                      <td className="py-2">{g.value}/20</td>
                      <td className="py-2">{g.coef ?? '—'}</td>
                      <td className="py-2">{formatDate(g.createdAt ?? g.date)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )
        )}

        <Link
          href={`/dashboard/children/${childId}/ai-analysis`}
          className="mt-4 inline-flex items-center rounded-md bg-indigo-600 px-3 py-2 text-sm font-medium text-white hover:bg-indigo-500"
        >
          Analyser avec l’IA
        </Link>
      </div>
    </div>
  );
}