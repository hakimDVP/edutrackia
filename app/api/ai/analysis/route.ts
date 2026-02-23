// app/api/ai/analysis/route.ts
import { NextResponse } from 'next/server';
import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY!, // ⚠️ server-side seulement
});

export const maxDuration = 30; // Next.js: temps max de la route (facultatif)

type GradeInput = {
  subject: string;
  value: number;     // /20
  coef?: number;
  date?: string;     // 'YYYY-MM-DD'
};

type ChildInput = {
  firstName?: string;
  lastName?: string;
  gradeLevel?: string;
};

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const child: ChildInput | undefined = body?.child;
    let grades: GradeInput[] = Array.isArray(body?.grades) ? body.grades : [];

    if (!grades.length) {
      return NextResponse.json(
        { error: 'Aucune note fournie.' },
        { status: 400 }
      );
    }

    // ✂️ Limiter la taille (MVP) : dernières 60 notes, arrondir les décimales
    grades = grades
      .slice(0, 60)
      .map(g => ({
        subject: String(g.subject || '').slice(0, 64),
        value: Math.max(0, Math.min(20, Number(g.value))),
        coef: g.coef != null ? Number(g.coef) : undefined,
        date: g.date ? String(g.date) : undefined,
      }));

    const system = `
Tu es un assistant pédagogique expert en évaluation et en orientation pour les parents. 
Tu dois analyser des notes (/20) par matière, détecter tendances et risques, et proposer des conseils concrets.
Réponds STRICTEMENT au format JSON compact et valide.

Contrainte de sortie (schema JSON) :
{
  "overview": { "summary": string, "highlights": string[] },
  "perSubject": [
    {
      "subject": string,
      "average": number,         // moyenne /20
      "trend": "hausse" | "stable" | "baisse",
      "strengths": string[],
      "weaknesses": string[],
      "actions": string[]        // conseils concrets
    }
  ],
  "globalTips": string[],
  "risk": {
    "level": "low" | "medium" | "high",
    "reasons": string[]
  }
}
Si une section est vide, renvoie un tableau vide.
    `.trim();

    const userPrompt = {
      role: 'user' as const,
      content: JSON.stringify({
        child: {
          firstName: child?.firstName ?? null,
          gradeLevel: child?.gradeLevel ?? null,
        },
        grades,
        rules: {
          scale: 20,
          // Astuce : considère la chronologie via "date" si fournie
          considerDate: true,
          frenchScale: true,
        },
      }),
    };

    // 💡 Modèle low-cost et performant pour MVP
    const model = 'gpt-4o-mini';

    const completion = await openai.chat.completions.create({
      model,
      temperature: 0.2,
      response_format: { type: 'json_object' }, // JSON strict si supporté par le modèle
      messages: [
        { role: 'system', content: system },
        userPrompt,
      ],
    });

    const raw = completion.choices?.[0]?.message?.content?.trim();
    if (!raw) {
      return NextResponse.json({ error: 'Réponse vide du modèle.' }, { status: 500 });
    }

    // Parse JSON généré
    let analysis: any;
    try {
      analysis = JSON.parse(raw);
    } catch {
      // Fallback minimal : renvoyer le texte brut
      analysis = { overview: { summary: raw, highlights: [] }, perSubject: [], globalTips: [], risk: { level: 'medium', reasons: ['Parsing JSON échoué'] } };
    }

    return NextResponse.json({
      analysis,
      // meta utile (facultatif)
      model,
    });
  } catch (err: any) {
    console.error('[AI Analysis] error', err?.message || err);
    return NextResponse.json(
      { error: err?.message || 'Erreur serveur AI' },
      { status: 500 }
    );
  }
}
