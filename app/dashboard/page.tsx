'use client';
import { useEffect, useState } from 'react';
import { useAuth } from '@/components/AuthProvider';
import { Child, Grade, listChildren, listGrades, computeAverage } from '@/lib/firestore';
import AddChildForm from '@/components/AddChildForm';
import AddGradeForm from '@/components/AddGradeForm';
import Link from 'next/link';

export default function DashboardPage() {
  const { user } = useAuth();
  const [children, setChildren] = useState<Child[]>([]);
  const [loading, setLoading]   = useState(true);

  const refresh = async () => {
    if (!user) return;
    setLoading(true);
    try {
      const items = await listChildren(user.uid);
      setChildren(items);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { user && refresh(); }, [user]);

  if (!user) {
    return (
      <div className="rounded-xl border bg-white p-6">
        <p className="text-gray-700">Veuillez vous connecter.</p>
        <Link className="mt-3 inline-block rounded-md bg-gray-900 px-4 py-2 text-white" href="/auth/login">
          Se connecter
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">Bienvenue 👋</h1>
        <Link href="/pricing" className="text-sm text-gray-600 hover:text-gray-900">Voir les tarifs</Link>
      </div>

      {/* Ajouter un enfant */}
      <div className="rounded-xl border bg-white p-6">
        <h2 className="mb-3 text-lg font-semibold">Ajouter un enfant</h2>
        <AddChildForm onAdded={refresh} />
      </div>

      {/* Liste des enfants */}
      <section className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {loading && <div className="col-span-full text-gray-500">Chargement…</div>}
        {!loading && children.length === 0 && (
          <div className="col-span-full rounded-xl border bg-white p-6 text-gray-700">
            Aucun enfant pour l’instant. Ajoutez-en un ci-dessus.
          </div>
        )}
        {children.map(child => (
          <ChildCard key={child.id} child={child} />
        ))}
      </section>
    </div>
  );
}

function ChildCard({ child }: { child: Child }) {
  const [grades, setGrades] = useState<Grade[]>([]);
  const [loading, setLoading] = useState(true);

  const refreshGrades = async () => {
    if (!child.id) return;
    setLoading(true);
    try {
      const items = await listGrades(child.id);
      setGrades(items);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { refreshGrades(); }, [child.id]);

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

      {/* Ajout rapide d’une note */}
      {child.id && <AddGradeForm childId={child.id} onAdded={refreshGrades} />}

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
