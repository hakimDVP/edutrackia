export const runtime = 'nodejs'; // firebase-admin ne fonctionne pas en Edge

import { NextRequest, NextResponse } from 'next/server';
import { adminDb } from '@/lib/firebaseAdmin';
import { requireUserUidFromAuthHeader } from '@/lib/secure';

export async function POST(req: NextRequest) {
  try {
    // 1) Auth → en-tête Authorization: Bearer <idToken>
    const uid = await requireUserUidFromAuthHeader(req.headers.get('authorization'));

    // 2) Lire le payload
    const { childId, value, subject } = await req.json();

    if (!childId || typeof value !== 'number' || !subject) {
      return NextResponse.json({ error: 'Missing childId|value|subject' }, { status: 400 });
    }

    // 3) Sécurité : vérifier que le child appartient bien au user
    const childSnap = await adminDb.collection('children').doc(childId).get();
    if (!childSnap.exists || childSnap.data()?.parentId !== uid) {
      return NextResponse.json({ error: 'Not your child' }, { status: 403 });
    }

    // 4) Créer la note (Admin SDK → pas de règles client)
    const id = crypto.randomUUID();
    await adminDb.collection('grades').doc(id).set({
      id,
      childId,
      value,
      subject,
      createdAt: new Date(),
    });

    return NextResponse.json({ ok: true, id }, { status: 200 });
  } catch (e: any) {
    console.error('❌ /api/grades/create error:', e);
    return NextResponse.json({ error: e.message || 'Server error' }, { status: 500 });
  }
}