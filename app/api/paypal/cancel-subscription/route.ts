import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/firebase';
import { doc, getDoc, updateDoc } from 'firebase/firestore';
import { getPayPalAccessToken } from '@/lib/paypal';

export async function POST(req: NextRequest) {
  try {
    const uid = req.headers.get('x-uid');
    if (!uid) return NextResponse.json({ error: 'Missing uid' }, { status: 400 });

    const userRef = doc(db, 'users', uid);
    const snap = await getDoc(userRef);
    if (!snap.exists()) return NextResponse.json({ error: 'User not found' }, { status: 404 });

    const { subscriptionId } = snap.data() as { subscriptionId?: string };
    if (!subscriptionId) return NextResponse.json({ error: 'No subscription' }, { status: 400 });

    const { access_token, base } = await getPayPalAccessToken();
    const res = await fetch(`${base}/v1/billing/subscriptions/${subscriptionId}/cancel`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${access_token}` },
      body: JSON.stringify({ reason: 'User requested cancellation' }),
    });

    if (!res.ok) {
      const t = await res.text();
      console.error('Cancel failed', t);
      return NextResponse.json({ error: 'Cancel failed' }, { status: 500 });
    }

    await updateDoc(userRef, { subscriptionStatus: 'CANCELLED', plan: 'free' });
    return NextResponse.json({ ok: true });
  } catch (e: any) {
    console.error(e);
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}