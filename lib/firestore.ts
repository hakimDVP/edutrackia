// lib/firestore.ts
import { db } from './firebase';
import {
  addDoc, collection, deleteDoc, doc, getDoc, getDocs, orderBy,
  query, serverTimestamp, setDoc, updateDoc, where
} from 'firebase/firestore';

// ---- Types simples ----
export type Child = {
  id?: string;
  parentId: string;
  firstName: string;
  lastName?: string;
  gradeLevel?: string; // classe/niveau (optionnel)
  createdAt?: any;
};

export type Grade = {
  id?: string;
  childId: string;
  subject: string;
  value: number;     // note /20 (MVP)
  coef?: number;     // optionnel (coefficient)
  date?: string;     // 'YYYY-MM-DD'
  createdAt?: any;
};

// ---- CHILDREN ----
export async function addChild(parentId: string, data: Omit<Child, 'parentId'|'createdAt'>) {
  const ref = await addDoc(collection(db, 'children'), {
    parentId,
    ...data,
    createdAt: serverTimestamp(),
  });
  return ref.id;
}

export async function listChildren(parentId: string): Promise<Child[]> {
  const q = query(
    collection(db, 'children'),
    where('parentId', '==', parentId),
    orderBy('createdAt', 'desc')
  );
  const snap = await getDocs(q);
  return snap.docs.map(d => ({ id: d.id, ...(d.data() as Child) }));
}

export async function getChild(childId: string): Promise<Child | null> {
  const snap = await getDoc(doc(db, 'children', childId));
  return snap.exists() ? ({ id: snap.id, ...(snap.data() as Child) }) : null;
}

export async function deleteChild(childId: string) {
  await deleteDoc(doc(db, 'children', childId));
}

// ---- GRADES ----
export async function addGrade(grade: Omit<Grade, 'createdAt'>) {
  const ref = await addDoc(collection(db, 'grades'), {
    ...grade,
    createdAt: serverTimestamp(),
  });
  return ref.id;
}

export async function listGrades(childId: string): Promise<Grade[]> {
  const q = query(
    collection(db, 'grades'),
    where('childId', '==', childId),
    orderBy('createdAt', 'desc')
  );
  const snap = await getDocs(q);
  return snap.docs.map(d => ({ id: d.id, ...(d.data() as Grade) }));
}

export function computeAverage(grades: Grade[]): number {
  if (!grades.length) return 0;
  // moyenne simple /20 (si coef non fourni)
  const hasCoef = grades.some(g => g.coef && g.coef > 0);
  if (!hasCoef) {
    const sum = grades.reduce((acc, g) => acc + g.value, 0);
    return Math.round((sum / grades.length) * 100) / 100;
  }
  // moyenne pondérée
  const { total, coefSum } = grades.reduce((acc, g) => {
    const c = g.coef ?? 1;
    acc.total += g.value * c;
    acc.coefSum += c;
    return acc;
  }, { total: 0, coefSum: 0 });
  if (coefSum === 0) return 0;
  return Math.round((total / coefSum) * 100) / 100;
}

// --- AI Reports ---
export type AIReport = {
  id?: string;
  childId: string;
  analysis: any; // JSON structuré renvoyé par l'IA
  riskLevel: 'low' | 'medium' | 'high';
  createdAt?: any;
};

export async function addAIReport(childId: string, analysis: any, riskLevel: 'low'|'medium'|'high') {
  const ref = await addDoc(collection(db, 'aiReports'), {
    childId,
    analysis,
    riskLevel,
    createdAt: serverTimestamp(),
  });
  return ref.id;
}