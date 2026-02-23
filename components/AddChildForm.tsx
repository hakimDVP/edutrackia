'use client';

import { useState } from 'react';
import { addChild } from '@/lib/firestore';
import { useAuth } from './AuthProvider';

type Props = {
  onAdded?: () => void; // callback pour rafraîchir la liste après ajout
};

export default function AddChildForm({ onAdded }: Props) {
  const { user } = useAuth();

  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName]   = useState('');
  const [gradeLevel, setGradeLevel] = useState('');
  const [loading, setLoading] = useState(false);

  const [error, setError] = useState<string | null>(null);
  const [ok, setOk] = useState(false);

  const canSubmit = !!user && firstName.trim().length > 0 && !loading;

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setOk(false);

    if (!user) {
      setError('Vous devez être connecté pour ajouter un enfant.');
      return;
    }

    const payload = {
      firstName: firstName.trim(),
      lastName: lastName.trim() || undefined,
      gradeLevel: gradeLevel.trim() || undefined,
    };

    // 🔍 Logs utiles pour déboguer
    console.log('[AddChild] uid =', user.uid, payload);

    setLoading(true);
    try {
      await addChild(user.uid, payload);
      setOk(true);
      // reset champs
      setFirstName('');
      setLastName('');
      setGradeLevel('');
      onAdded?.();
      console.log('[AddChild] success');
    } catch (e: any) {
      console.error('[AddChild] error', e?.code, e?.message, e);
      // Messages clairs pour les cas fréquents
      if (e?.code === 'permission-denied') {
        setError("Permissions insuffisantes : vérifie les règles Firestore et que tu es bien connecté.");
      } else if (e?.code === 'unauthenticated') {
        setError("Tu n'es pas authentifié. Reconnecte-toi puis réessaie.");
      } else {
        setError(e?.message || 'Erreur inconnue lors de l’ajout.');
      }
    } finally {
      setLoading(false);
    }
  };

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
          title={!user ? 'Connectez-vous pour ajouter' : undefined}
        >
          {loading ? 'Ajout…' : 'Ajouter'}
        </button>
      </div>

      {/* Messages d’état */}
      {error && (
        <p className="text-sm text-red-600">
          {error}
        </p>
      )}
      {ok && (
        <p className="text-sm text-green-600">
          Enfant ajouté avec succès.
        </p>
      )}

      {/* Astuce permissions (affichée si pas connecté) */}
      {!user && (
        <p className="text-xs text-gray-500">
          Vous devez être connecté pour créer un enfant. Rendez-vous sur la page d’inscription/connexion.
        </p>
      )}
    </form>
  );
}
