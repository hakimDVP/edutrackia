'use client';

import { useState, useEffect } from 'react';
import { useAuth } from './AuthProvider';
import { collection, getDocs, query, where } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { getIdToken } from 'firebase/auth';
import Link from 'next/link';

type Props = {
  onAdded?: () => void;
};

export default function AddChildForm({ onAdded }: Props) {
  const { user } = useAuth();

  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName]   = useState('');
  const [gradeLevel, setGradeLevel] = useState('');

  const [loading, setLoading] = useState(false);
  const [error, setError]     = useState<string | null>(null);
  const [ok, setOk]           = useState(false);

  const [childrenCount, setChildrenCount] = useState<number>(0);
  const [plan, setPlan] = useState<string>('free');
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    if (!user) return;

    const load = async () => {
      setChecking(true);

      // Charger le plan
      const userSnap = await getDocs(
        query(collection(db, 'users'), where('__name__', '==', user.uid))
      );
      if (!userSnap.empty) setPlan(userSnap.docs[0].data().plan || 'free');

      // Compter les enfants
      const childrenSnap = await getDocs(
        query(collection(db, 'children'), where('parentId', '==', user.uid))
      );
      setChildrenCount(childrenSnap.size);

      setChecking(false);
    };

    load();
  }, [user]);

  const canSubmit = !!user && firstName.trim().length > 0 && !loading && !checking;

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setOk(false);

    if (!user) {
      setError('Vous devez être connecté.');
      return;
    }

    // Limite Free
    if (plan === 'free' && childrenCount >= 1) {
      setError('Votre plan gratuit permet 1 enfant max.');
      return;
    }

    setLoading(true);

    try {
      // 🔥 Récupérer le token Firebase
      const token = await getIdToken(user, true);

      const res = await fetch('/api/children/create', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,  // ⭐ ESSENTIEL ⭐
        },
        body: JSON.stringify({
          firstName: firstName.trim(),
          lastName: lastName.trim(),
          gradeLevel: gradeLevel.trim(),
          birthDate: null,
        }),
      });

      const json = await res.json();
      if (!res.ok) throw new Error(json.error || 'Erreur inconnue.');

      setOk(true);
      setFirstName('');
      setLastName('');
      setGradeLevel('');
      onAdded?.();
    } catch (e: any) {
      setError(e.message || 'Erreur ajout enfant.');
    } finally {
      setLoading(false);
    }
  };

  // BLOQUAGE si plan FREE dépassé
  if (plan === 'free' && childrenCount >= 1) {
    return (
      <div className="rounded-md border border-amber-300 bg-amber-50 p-4">
        <p className="text-sm text-amber-800">
          Votre plan gratuit permet <strong>1 enfant maximum</strong>.
        </p>
        <p className="mt-2 text-sm text-amber-800">
          Passez au plan Premium pour en ajouter davantage.
        </p>

        <Link
          href="/pricing"
          className="mt-3 inline-block rounded-md bg-gray-900 px-4 py-2 text-white hover:bg-gray-800"
        >
          Passer en Premium
        </Link>
      </div>
    );
  }

  return (
    <form onSubmit={submit} className="space-y-3">
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-4">
        <input
          required
          value={firstName}
          onChange={(e) => setFirstName(e.target.value)}
          className="rounded-md border px-3 py-2 text-sm"
          placeholder="Prénom *"
        />

        <input
          value={lastName}
          onChange={(e) => setLastName(e.target.value)}
          className="rounded-md border px-3 py-2 text-sm"
          placeholder="Nom (optionnel)"
        />

        <input
          value={gradeLevel}
          onChange={(e) => setGradeLevel(e.target.value)}
          className="rounded-md border px-3 py-2 text-sm"
          placeholder="Classe (ex: CE2, 5e)"
        />

        <button
          disabled={!canSubmit}
          className="rounded-md bg-gray-900 px-4 py-2 text-white hover:bg-gray-800 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {loading ? 'Ajout…' : 'Ajouter'}
        </button>
      </div>

      {error && <p className="text-sm text-red-600">{error}</p>}
      {ok && <p className="text-sm text-green-600">Enfant ajouté avec succès.</p>}
    </form>
  );
}