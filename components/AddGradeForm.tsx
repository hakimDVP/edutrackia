'use client';
import { useState } from 'react';
import { addGrade } from '@/lib/firestore';

export default function AddGradeForm({
  childId, onAdded,
}: { childId: string; onAdded?: () => void }) {
  const [subject, setSubject] = useState('');
  const [value, setValue]     = useState<number | ''>('');
  const [coef, setCoef]       = useState<number | ''>('');
  const [date, setDate]       = useState<string>('');
  const [loading, setLoading] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!childId || value === '' || !subject) return;
    setLoading(true);
    try {
      await addGrade({
        childId,
        subject,
        value: Number(value),
        coef: coef === '' ? undefined : Number(coef),
        date: date || undefined,
      });
      setSubject(''); setValue(''); setCoef(''); setDate('');
      onAdded?.();
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={submit} className="grid grid-cols-1 gap-3 sm:grid-cols-5">
      <input
        required
        value={subject}
        onChange={e => setSubject(e.target.value)}
        className="rounded-md border px-3 py-2 text-sm"
        placeholder="Matière (ex: Math)"
      />
      <input
        required
        type="number"
        min={0} max={20} step="0.1"
        value={value}
        onChange={e => setValue(e.target.value === '' ? '' : Number(e.target.value))}
        className="rounded-md border px-3 py-2 text-sm"
        placeholder="Note /20"
      />
      <input
        type="number"
        min={0} step="0.5"
        value={coef}
        onChange={e => setCoef(e.target.value === '' ? '' : Number(e.target.value))}
        className="rounded-md border px-3 py-2 text-sm"
        placeholder="Coef (opt.)"
      />
      <input
        type="date"
        value={date}
        onChange={e => setDate(e.target.value)}
        className="rounded-md border px-3 py-2 text-sm"
      />
      <button
        disabled={loading}
        className="rounded-md bg-gray-900 px-4 py-2 text-white hover:bg-gray-800 disabled:opacity-60"
      >
        {loading ? 'Ajout…' : 'Ajouter la note'}
      </button>
    </form>
  );
}
``