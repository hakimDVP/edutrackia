export const runtime = 'nodejs';

import { NextRequest, NextResponse } from 'next/server';
import { adminDb } from '@/lib/firebaseAdmin';
import { requireUserUidFromAuthHeader } from '@/lib/secure';

export async function GET(req: NextRequest) {
  try {
    const uid = await requireUserUidFromAuthHeader(req.headers.get('authorization'));
    const childId = req.nextUrl.searchParams.get('childId');

    if (!childId) {
      return NextResponse.json({ error: 'Missing childId' }, { status: 400 });
    }

    const snap = await adminDb.collection('children').doc(childId).get();
    if (!snap.exists) {
      return NextResponse.json({ error: 'Child not found' }, { status: 404 });
    }

    const child = snap.data();
    if (child?.parentId !== uid) {
      return NextResponse.json({ error: 'Not your child' }, { status: 403 });
    }

    return NextResponse.json({ child }, { status: 200 });
  } catch (e: any) {
    console.error('children/get error:', e);
    return NextResponse.json({ error: e.message || 'Server error' }, { status: 500 });
  }
}