// lib/ai.ts
import type { Grade } from './firestore';

export type AIAnalysis = {
  overview: { summary: string; highlights: string[] };
  perSubject: {
    subject: string;
    average: number;
    trend: 'hausse' | 'stable' | 'baisse';
    strengths: string[];
    weaknesses: string[];
    actions: string[];
  }[];
  globalTips: string[];
  risk: { level: 'low' | 'medium' | 'high'; reasons: string[] };
};

export async function analyzeChildWithAI(input: {
  child?: { firstName?: string; gradeLevel?: string };
  grades: Grade[];
}): Promise<AIAnalysis> {
  const res = await fetch('/api/ai/analysis', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      child: input.child || {},
      grades: input.grades.map(g => ({
        subject: g.subject,
        value: g.value,
        coef: g.coef ?? undefined,
        date: g.date ?? undefined,
      })),
    }),
  });

  if (!res.ok) {
    const data = await res.json().catch(() => ({}));
    throw new Error(data?.error || 'Échec appel IA');
  }

  const data = await res.json();
  return data.analysis as AIAnalysis;
}