'use client';
import { useEffect, useMemo, useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { Child, Grade, getChild, listGrades, computeAverage, addAIReport } from '@/lib/firestore';
import { analyzeChildWithAI, type AIAnalysis } from '@/lib/ai';

export default function AIAnalysisPage() {
  const params = useParams<{ childId: string }>();
  const childId = params.childId;

  const [child, setChild] = useState<Child | null>(null);
  const [grades, setGrades] = useState<Grade[]>([]);
  const [loading, setLoading] = useState(true);

  const [aiLoading, setAiLoading] = useState(false);
  const [analysis, setAnalysis] = useState<AIAnalysis | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [savedId, setSavedId] = useState<string | null>(null);

  const avg = useMemo(() => computeAverage(grades), [grades]);

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

  const runAnalysis = async () => {
    setError(null);
    setAnalysis(null);
    setSavedId(null);
    setAiLoading(true);
    try {
      const result = await analyzeChildWithAI({
        child: { firstName: child?.firstName, gradeLevel: child?.gradeLevel },
        grades,
      });
      setAnalysis(result);
    } catch (e: any) {
      setError(e?.message || 'Erreur IA');
    } finally {
      setAiLoading(false);
    }
  };

  const saveReport = async () => {
    if (!analysis) return;
    try {
      const id = await addAIReport(childId, analysis, analysis.risk?.level || 'medium');
      setSavedId(id);
    } catch (e: any) {
      setError(e?.message || 'Échec de la sauvegarde');
    }
  };

  const riskColor =
    analysis?.risk?.level === 'high' ? 'bg-red-100 text-red-700'
    : analysis?.risk?.level === 'medium' ? 'bg-amber-100 text-amber-700'
    : 'bg-emerald-100 text-emerald-700';

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <Link href={`/dashboard/children/${childId}`} className="text-sm text-gray-600 hover:text-gray-900">
            ← Retour
          </Link>
          <h1 className="mt-2 text-2xl font-semibold">Analyse IA</h1>
          {child && (
            <p className="text-gray-600">
              {child.firstName} {child.lastName || ''} {child.gradeLevel ? `• ${child.gradeLevel}` : ''} {Number.isFinite(avg) ? `• Moyenne ${avg}/20` : ''}
            </p>
          )}
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={runAnalysis}
            disabled={aiLoading || loading || grades.length === 0}
            className="rounded-md bg-gray-900 px-4 py-2 text-white hover:bg-gray-800 disabled:opacity-60"
          >
            {aiLoading ? 'Analyse en cours…' : 'Analyser avec l’IA'}
          </button>
          {analysis && (
            <button
              onClick={saveReport}
              className="rounded-md border px-4 py-2 text-gray-800 hover:bg-gray-50"
            >
              Sauvegarder le rapport
            </button>
          )}
        </div>
      </div>

      {loading && <div className="rounded-xl border bg-white p-6">Chargement…</div>}

      {error && (
        <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-red-700">
          {error}
        </div>
      )}

      {!loading && grades.length === 0 && (
        <div className="rounded-xl border bg-white p-6 text-gray-700">
          Aucune note pour l’instant. Ajoutez des notes avant de lancer l’analyse.
        </div>
      )}

      {analysis && (
        <div className="space-y-6">
          {/* Bandeau risque */}
          <div className={`rounded-xl border bg-white p-6 ${analysis.risk ? '' : 'hidden'}`}>
            <div className={`inline-flex rounded-md px-3 py-1 text-sm font-medium ${riskColor}`}>
              Risque : {analysis.risk.level.toUpperCase()}
            </div>
            {analysis.risk?.reasons?.length ? (
              <ul className="mt-3 list-disc pl-6 text-sm text-gray-700">
                {analysis.risk.reasons.map((r, i) => (
                  <li key={i}>{r}</li>
                ))}
              </ul>
            ) : null}
            {savedId && (
              <p className="mt-3 text-sm text-emerald-700">Rapport sauvegardé (ID : {savedId}).</p>
            )}
          </div>

          {/* Overview */}
          <div className="rounded-xl border bg-white p-6">
            <h2 className="text-lg font-semibold">Résumé</h2>
            <p className="mt-2 text-gray-700">{analysis.overview?.summary}</p>
            {!!analysis.overview?.highlights?.length && (
              <ul className="mt-3 list-disc pl-6 text-sm text-gray-700">
                {analysis.overview.highlights.map((h, i) => <li key={i}>{h}</li>)}
              </ul>
            )}
          </div>

          {/* Par matière */}
          <div className="rounded-xl border bg-white p-6">
            <h2 className="text-lg font-semibold">Par matière</h2>
            <div className="mt-4 grid gap-4 sm:grid-cols-2">
              {analysis.perSubject?.map((s, idx) => (
                <div key={idx} className="rounded-lg border p-4">
                  <div className="flex items-center justify-between">
                    <h3 className="font-semibold">{s.subject}</h3>
                    <span className="text-sm text-gray-600">
                      {s.average}/20 • {s.trend}
                    </span>
                  </div>
                  {!!s.strengths?.length && (
                    <>
                      <p className="mt-2 text-sm font-medium text-emerald-700">Forces</p>
                      <ul className="mt-1 list-disc pl-6 text-sm text-gray-700">
                        {s.strengths.map((it, i) => <li key={i}>{it}</li>)}
                      </ul>
                    </>
                  )}
                  {!!s.weaknesses?.length && (
                    <>
                      <p className="mt-3 text-sm font-medium text-red-700">Faiblesses</p>
                      <ul className="mt-1 list-disc pl-6 text-sm text-gray-700">
                        {s.weaknesses.map((it, i) => <li key={i}>{it}</li>)}
                      </ul>
                    </>
                  )}
                  {!!s.actions?.length && (
                    <>
                      <p className="mt-3 text-sm font-medium text-indigo-700">Actions concrètes</p>
                      <ul className="mt-1 list-disc pl-6 text-sm text-gray-700">
                        {s.actions.map((it, i) => <li key={i}>{it}</li>)}
                      </ul>
                    </>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Conseils globaux */}
          {!!analysis.globalTips?.length && (
            <div className="rounded-xl border bg-white p-6">
              <h2 className="text-lg font-semibold">Conseils généraux</h2>
              <ul className="mt-2 list-disc pl-6 text-sm text-gray-700">
                {analysis.globalTips.map((t, i) => <li key={i}>{t}</li>)}
              </ul>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
``