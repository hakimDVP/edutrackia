import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/firebase';
import { collection, getDocs, query, updateDoc, where } from 'firebase/firestore';

export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    const eventType = body.event_type;
    const resource = body.resource;
    const subscriptionId = resource?.id || resource?.subscription_id;

    if (!subscriptionId) {
      return NextResponse.json({ ok: true });
    }

    // Cherche l'utilisateur qui a ce subscriptionId
    const q = query(
      collection(db, 'users'),
      where('subscriptionId', '==', subscriptionId)
    );

    const snap = await getDocs(q);
    if (snap.empty) {
      console.warn('Webhook: no user found for subscription', subscriptionId);
      return NextResponse.json({ ok: true });
    }

    const userRef = snap.docs[0].ref;

    if (eventType === 'BILLING.SUBSCRIPTION.ACTIVATED') {
      await updateDoc(userRef, {
        plan: 'premium',
        subscriptionStatus: 'ACTIVE',
      });
    }

    if (eventType === 'BILLING.SUBSCRIPTION.CANCELLED') {
      await updateDoc(userRef, {
        plan: 'free',
        subscriptionStatus: 'CANCELLED',
      });
    }

    if (eventType === 'BILLING.SUBSCRIPTION.SUSPENDED') {
      await updateDoc(userRef, {
        subscriptionStatus: 'SUSPENDED',
      });
    }

    return NextResponse.json({ ok: true });
  } catch (err: any) {
    console.error('Webhook error:', err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}