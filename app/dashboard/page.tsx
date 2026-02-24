'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/components/AuthProvider';
import AddChildForm from '@/components/AddChildForm';
import AddGradeForm from '@/components/AddGradeForm';
import Link from 'next/link';
import { getIdToken } from 'firebase/auth';
import { useUserPlan } from '@/hooks/useUserPlan';
import UpgradeBanner from '@/components/UpgradeBanner';

/* ---------- TYPES ---------- */
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
  // createdAt peut venir sous forme string, number, ou Timestamp Firestore
  createdAt?: any;
};

/* ---------- HELPERS ---------- */
function computeAverage(grades: Grade[]) {
  if (!grades.length) return null;
  const sum = grades.reduce((acc, g) => acc + Number(g.value || 0), 0);
  return Math.round((sum / grades.length) * 100) / 100;
}

// Formatteur robuste (gère string, number, ou Timestamp Firestore)
function formatDate(d: any) {
  if (!d) return '—';
  try {
    // string ou number
    if (typeof d === 'string' || typeof d === 'number') {
      return new Date(d).toLocaleString('fr-FR');
    }
    // Timestamp Firestore { seconds, nanoseconds }
    if (typeof d === 'object' && ('seconds' in d || '_seconds' in d)) {
      const seconds = (d.seconds ?? d._seconds) as number;
      const nanos = (d.nanoseconds ?? d._nanoseconds ?? 0) as number;
      const ms = seconds * 1000 + Math.floor(nanos / 1e6);
      return new Date(ms).toLocaleString('fr-FR');
    }
    return '—';
  } catch {
    return '—';
  }
}

/* ---------- PAGE DASHBOARD ---------- */
export default function DashboardPage() {
  const { user } = useAuth();
  const { plan, loading: planLoading } = useUserPlan();

  const [children, setChildren] = useState<Child[]>([]);
  const [loading, setLoading] = useState(true);

  // Charge la liste des enfants via l'API sécurisée (admin SDK côté serveur)
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

  // Non connecté
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
              title={plan === 'premium' ? 'Plan Premium actif' : 'Plan Gratuit – 1 enfant max'}
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

/* ---------- CHILD CARD (corrigé : une seule déclaration) ---------- */
function ChildCard({ child }: { child: Child }) {
  const [grades, setGrades] = useState<Grade[]>([]);
  const [loading, setLoading] = useState(true);
  const [editId, setEditId] = useState<string | null>(null);
  const [editSubject, setEditSubject] = useState<string>('');
  const [editValue, setEditValue] = useState<number>(0);
  const [err, setErr] = useState<string | null>(null);
  const { user } = useAuth();

  // Charge les notes via l'API sécurisée (admin SDK)
  const refreshGrades = async () => {
    if (!child.id || !user) return;

    setLoading(true);
    setErr(null);
    try {
      const token = await getIdToken(user, true);
      const res = await fetch(`/api/grades/list?childId=${child.id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || 'Erreur chargement notes');
      setGrades(json.grades || []);
    } catch (e: any) {
      setErr(e.message);
      setGrades([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    refreshGrades();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [child.id]);

  const avg = computeAverage(grades);

  const onEdit = (g: Grade) => {
    setEditId(g.id);
    setEditSubject(g.subject);
    setEditValue(Number(g.value || 0));
  };

  const cancelEdit = () => {
    setEditId(null);
    setEditSubject('');
    setEditValue(0);
  };

  const saveEdit = async () => {
    if (!user || !child.id || !editId) return;
    setErr(null);
    try {
      const token = await getIdToken(user, true);
      const res = await fetch('/api/grades/update', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          gradeId: editId,
          childId: child.id,
          subject: editSubject,
          value: Number(editValue),
        }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || 'Échec de la mise à jour');
      cancelEdit();
      await refreshGrades();
    } catch (e: any) {
      setErr(e.message);
    }
  };

  const deleteGrade = async (gradeId: string) => {
    if (!user || !child.id) return;
    if (!confirm('Supprimer cette note ?')) return;
    setErr(null);
    try {
      const token = await getIdToken(user, true);
      const res = await fetch('/api/grades/delete', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ gradeId, childId: child.id }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || 'Échec de la suppression');
      await refreshGrades();
    } catch (e: any) {
      setErr(e.message);
    }
  };

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

      {/* Ajout rapide d’une note */}
      {child.id && <AddGradeForm childId={child.id} onAdded={refreshGrades} />}

      {/* Messages */}
      {err && <p className="text-sm text-red-600">{err}</p>}
      {loading && <p className="text-sm text-gray-500">Chargement des notes…</p>}

      {/* Liste des notes */}
      {!loading && grades.length > 0 && (
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b bg-gray-50 text-xs uppercase text-gray-600">
                <th className="px-3 py-2 text-left">Date</th>
                <th className="px-3 py-2 text-left">Matière</th>
                <th className="px-3 py-2 text-left">Note</th>
                <th className="px-3 py-2 text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {grades.map((g) => {
                const isEdit = editId === g.id;
                return (
                  <tr key={g.id} className="border-b">
                    <td className="px-3 py-2">
                      {formatDate(g.createdAt)}
                    </td>

                    {/* Matière */}
                    <td className="px-3 py-2">
                      {isEdit ? (
                        <input
                          className="w-full rounded-md border px-2 py-1"
                          value={editSubject}
                          onChange={(e) => setEditSubject(e.target.value)}
                        />
                      ) : (
                        g.subject
                      )}
                    </td>

                    {/* Note */}
                    <td className="px-3 py-2">
                      {isEdit ? (
                        <input
                          type="number"
                          min={0}
                          max={20}
                          step={0.25}
                          className="w-24 rounded-md border px-2 py-1"
                          value={editValue}
                          onChange={(e) => setEditValue(Number(e.target.value))}
                        />
                      ) : (
                        g.value
                      )}
                    </td>

                    {/* Actions */}
                    <td className="px-3 py-2 text-right">
                      {isEdit ? (
                        <div className="flex justify-end gap-2">
                          <button
                            onClick={saveEdit}
                            className="rounded-md border border-emerald-300 px-2 py-1 text-emerald-700 hover:bg-emerald-50"
                          >
                            Enregistrer
                          </button>
                          <button
                            onClick={cancelEdit}
                            className="rounded-md border border-gray-300 px-2 py-1 text-gray-700 hover:bg-gray-50"
                          >
                            Annuler
                          </button>
                        </div>
                      ) : (
                        <div className="flex justify-end gap-2">
                          <button
                            onClick={() => onEdit(g)}
                            className="rounded-md border border-indigo-300 px-2 py-1 text-indigo-700 hover:bg-indigo-50"
                          >
                            Modifier
                          </button>
                          <button
                            onClick={() => deleteGrade(g.id)}
                            className="rounded-md border border-rose-300 px-2 py-1 text-rose-700 hover:bg-rose-50"
                          >
                            Supprimer
                          </button>
                        </div>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* Lien vers la page dédiée */}
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