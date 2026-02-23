import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/firebase';
import { doc, updateDoc, serverTimestamp } from 'firebase/firestore';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const subscriptionId = body.subscriptionId;
    const uid = req.headers.get('x-uid'); // envoyé depuis la page pricing

    if (!subscriptionId || !uid) {
      return NextResponse.json(
        { error: 'Missing uid or subscription ID' },
        { status: 400 }
      );
    }

    const userRef = doc(db, 'users', uid);

    await updateDoc(userRef, {
      subscriptionId,
      subscriptionStatus: 'PENDING',
      plan: 'premium',
      updatedAt: serverTimestamp(),
    });

    return NextResponse.json({ ok: true });
  } catch (e: any) {
    console.error('Error linking subscription:', e);
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}