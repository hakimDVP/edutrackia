'use client';
import { useParams } from 'next/navigation';
import { useEffect, useMemo, useState } from 'react';
import { Child, Grade, getChild, listGrades, computeAverage } from '@/lib/firestore';
import AddGradeForm from '@/components/AddGradeForm';
import Link from 'next/link';

export default function ChildDetailPage() {
  const params = useParams<{ childId: string }>();
  const childId = params.childId;
  const [child, setChild]   = useState<Child | null>(null);
  const [grades, setGrades] = useState<Grade[]>([]);
  const [loading, setLoading] = useState(true);

  const refresh = async () => {
    setLoading(true);
    try {
      const [c, g] = await Promise.all([getChild(childId), listGrades(childId)]);
      setChild(c);
      setGrades(g);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { refresh(); }, [childId]);

  const avg = useMemo(() => computeAverage(grades), [grades]);

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

      <div className="rounded-xl border bg-white p-6">
        <h2 className="mb-3 text-lg font-semibold">Ajouter une note</h2>
        <AddGradeForm childId={childId} onAdded={refresh} />
      </div>

      <div className="rounded-xl border bg-white p-6">
        <h2 className="mb-3 text-lg font-semibold">Notes</h2>
        {!grades.length ? (
          <p className="text-gray-600">Aucune note pour l’instant.</p>
        ) : (
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
                {grades.map(g => (
                  <tr key={g.id} className="border-t">
                    <td className="py-2">{g.subject}</td>
                    <td className="py-2">{g.value}/20</td>
                    <td className="py-2">{g.coef ?? '-'}</td>
                    <td className="py-2">{g.date ?? '-'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
        
        <Link
          href={`/dashboard/children/${childId}/ai-analysis`}
          className="inline-flex items-center rounded-md bg-indigo-600 px-3 py-2 text-sm font-medium text-white hover:bg-indigo-500"
        >
          Analyser avec l’IA
        </Link>

      </div>
    </div>
  );
}