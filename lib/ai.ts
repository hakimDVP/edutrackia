// lib/ai.ts
export async function requestAIAnalysis(childId: string) {
  const res = await fetch('/api/ai/analysis', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ childId })
  });
  if (!res.ok) throw new Error('AI analysis failed');
  return res.json();
}