'use client';

import { useState } from 'react';
import { useAuth } from '@/components/AuthProvider';
import { getIdToken } from 'firebase/auth';

export default function AddGradeForm({
  childId,
  onAdded,
}: {
  childId: string;
  onAdded?: () => void;
}) {
  const { user } = useAuth();

  const [subject, setSubject] = useState('');
  const [value, setValue] = useState<number | ''>('');
  const [coef, setCoef] = useState<number | ''>('');
  const [date, setDate] = useState<string>('');
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  const [ok, setOk] = useState(false);

  const canSubmit =
    !!user &&
    !!childId &&
    subject.trim().length > 0 &&
    value !== '' &&
    !loading;

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErr(null);
    setOk(false);

    if (!canSubmit) return;

    try {
      setLoading(true);

      // 🔐 Récupère le token Firebase (auth du parent connecté)
      const token = await getIdToken(user!, true);

      // 🔥 Appel API serveur (Admin SDK) → pas de règles Firestore côté client
      const res = await fetch('/api/grades/create', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          childId,
          subject: subject.trim(),
          value: typeof value === 'string' ? Number(value) : value,
          // Champs optionnels : si tu veux les stocker, veille à ce que la route /api/grades/create les accepte.
          coef: coef === '' ? undefined : Number(coef),
          date: date || undefined,
        }),
      });

      const json = await res.json();
      if (!res.ok) throw new Error(json.error || 'Erreur lors de l’ajout.');

      // ✅ Succès
      setOk(true);
      setSubject('');
      setValue('');
      setCoef('');
      setDate('');
      onAdded?.();
    } catch (e: any) {
      setErr(e.message || 'Erreur inconnue.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={submit} className="grid grid-cols-1 gap-3 sm:grid-cols-5">
      <input
        required
        value={subject}
        onChange={(e) => setSubject(e.target.value)}
        className="rounded-md border px-3 py-2 text-sm"
        placeholder="Matière (ex: Math)"
      />
      <input
        required
        type="number"
        min={0}
        max={20}
        step="0.1"
        value={value}
        onChange={(e) =>
          setValue(e.target.value === '' ? '' : Number(e.target.value))
        }
        className="rounded-md border px-3 py-2 text-sm"
        placeholder="Note /20"
      />
      <input
        type="number"
        min={0}
        step="0.5"
        value={coef}
        onChange={(e) =>
          setCoef(e.target.value === '' ? '' : Number(e.target.value))
        }
        className="rounded-md border px-3 py-2 text-sm"
        placeholder="Coef (opt.)"
      />
      <input
        type="date"
        value={date}
        onChange={(e) => setDate(e.target.value)}
        className="rounded-md border px-3 py-2 text-sm"
      />
      <button
        disabled={!canSubmit}
        className="rounded-md bg-gray-900 px-4 py-2 text-white hover:bg-gray-800 disabled:opacity-60"
      >
        {loading ? 'Ajout…' : 'Ajouter la note'}
      </button>

      {/* Messages */}
      {err && <p className="col-span-full text-sm text-red-600">{err}</p>}
      {ok && (
        <p className="col-span-full text-sm text-green-600">
          Note ajoutée avec succès.
        </p>
      )}
    </form>
  );
}