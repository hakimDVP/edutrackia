'use client';

import { useState, useEffect } from 'react';
import { addChild } from '@/lib/firestore';
import { useAuth } from './AuthProvider';
import { collection, getDocs, query, where } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import Link from 'next/link';

type Props = {
  onAdded?: () => void;
};

export default function AddChildForm({ onAdded }: Props) {
  const { user } = useAuth();

  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [gradeLevel, setGradeLevel] = useState('');

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [ok, setOk] = useState(false);

  const [childrenCount, setChildrenCount] = useState<number>(0);
  const [plan, setPlan] = useState<string>('free');
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    if (!user) return;

    const load = async () => {
      setChecking(true);

      // 1) charger le plan utilisateur
      const userRef = collection(db, 'users');
      const userSnap = await getDocs(query(userRef, where('__name__', '==', user.uid)));
      if (!userSnap.empty) {
        const data = userSnap.docs[0].data();
        setPlan(data.plan || 'free');
      }

      // 2) compter les enfants
      const childRef = collection(db, 'children');
      const snap = await getDocs(query(childRef, where('parentId', '==', user.uid)));
      setChildrenCount(snap.size);

      setChecking(false);
    };

    load();
  }, [user]);

  const canSubmit =
    !!user && firstName.trim().length > 0 && !loading && !checking;

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setOk(false);

    if (!user) {
      setError('Vous devez être connecté pour ajouter un enfant.');
      return;
    }

    // 🔒 Bloquer si plan gratuit + déjà 1 enfant
    if (plan === 'free' && childrenCount >= 1) {
      setError('Votre plan gratuit permet un seul enfant. Passez en Premium pour en ajouter d’autres.');
      return;
    }

    const payload = {
      firstName: firstName.trim(),
      lastName: lastName.trim() || undefined,
      gradeLevel: gradeLevel.trim() || undefined,
    };

    setLoading(true);
    try {
      await addChild(user.uid, payload);
      setOk(true);

      // reset
      setFirstName('');
      setLastName('');
      setGradeLevel('');

      onAdded?.();
    } catch (e: any) {
      setError(e?.message || 'Erreur inconnue lors de l’ajout.');
    } finally {
      setLoading(false);
    }
  };

  /* --- AFFICHAGE UI --- */

  // Si plan Free + limite atteinte → afficher upgrade
  if (plan === 'free' && childrenCount >= 1) {
    return (
      <div className="rounded-md border border-amber-300 bg-amber-50 p-4">
        <p className="text-sm text-amber-800">
          Votre plan gratuit permet d’ajouter <strong>1 seul enfant</strong>.
        </p>
        <p className="mt-2 text-sm text-amber-800">
          Passez au plan Premium pour en ajouter plus.
        </p>

        <Link
          href="/pricing"
          className="mt-4 inline-block rounded-md bg-gray-900 px-4 py-2 text-white hover:bg-gray-800"
        >
          Passer en Premium
        </Link>
      </div>
    );
  }

  return (
    <form onSubmit={submit} className="space-y-3">
      {/* Champs */}
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
          placeholder="Classe (ex: 5e, CE2)"
        />

        <button
          type="submit"
          disabled={!canSubmit}
          className="rounded-md bg-gray-900 px-4 py-2 text-white hover:bg-gray-800 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {loading ? 'Ajout…' : 'Ajouter'}
        </button>
      </div>

      {/* Messages */}
      {error && <p className="text-sm text-red-600">{error}</p>}
      {ok && <p className="text-sm text-green-600">Enfant ajouté avec succès.</p>}
    </form>
  );
}