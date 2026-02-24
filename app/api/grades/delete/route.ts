// app/api/grades/delete/route.ts
export const runtime = 'nodejs';

import { NextRequest, NextResponse } from 'next/server';
import { adminDb } from '@/lib/firebaseAdmin';
import { requireUserUidFromAuthHeader } from '@/lib/secure';

export async function POST(req: NextRequest) {
  try {
    const uid = await requireUserUidFromAuthHeader(req.headers.get('authorization'));
    const { gradeId, childId } = await req.json();

    if (!gradeId || !childId) {
      return NextResponse.json({ error: 'Missing gradeId or childId' }, { status: 400 });
    }

    // Vérifier ownership de l’enfant
    const childSnap = await adminDb.collection('children').doc(childId).get();
    if (!childSnap.exists || childSnap.data()?.parentId !== uid) {
      return NextResponse.json({ error: 'Not your child' }, { status: 403 });
    }

    // Vérifier que la note appartient bien à ce child
    const gradeRef = adminDb.collection('grades').doc(gradeId);
    const gradeSnap = await gradeRef.get();
    if (!gradeSnap.exists || gradeSnap.data()?.childId !== childId) {
      return NextResponse.json({ error: 'Grade not found for this child' }, { status: 404 });
    }

    await gradeRef.delete();

    return NextResponse.json({ ok: true }, { status: 200 });
  } catch (e: any) {
    console.error('grades/delete error:', e);
    return NextResponse.json({ error: e.message || 'Server error' }, { status: 500 });
  }
}