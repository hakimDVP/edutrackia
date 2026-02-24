export const runtime = 'nodejs';

import { NextRequest, NextResponse } from 'next/server';
import { adminDb } from '@/lib/firebaseAdmin';
import { requireUserUidFromAuthHeader } from '@/lib/secure';

export async function GET(req: NextRequest) {
  try {
    const uid = await requireUserUidFromAuthHeader(req.headers.get('authorization'));
    const childId = req.nextUrl.searchParams.get('childId');
    if (!childId) return NextResponse.json({ error: 'Missing childId' }, { status: 400 });

    // Ownership
    const childSnap = await adminDb.collection('children').doc(childId).get();
    if (!childSnap.exists || childSnap.data()?.parentId !== uid) {
      return NextResponse.json({ error: 'Not your child' }, { status: 403 });
    }

    const snap = await adminDb
      .collection('grades')
      .where('childId', '==', childId)
      .orderBy('createdAt', 'desc') // si createdAt Date/Timestamp
      .get();

    const grades = snap.docs.map(d => ({ id: d.id, ...d.data() }));

    return NextResponse.json({ grades }, { status: 200 });
  } catch (e: any) {
    console.error('grades/list error:', e);
    return NextResponse.json({ error: e.message || 'Server error' }, { status: 500 });
  }
}