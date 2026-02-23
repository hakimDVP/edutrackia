// app/api/paypal/subscription/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/firebase';
import { doc, getDoc } from 'firebase/firestore';
import { getSubscriptionDetails } from '@/lib/paypal';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  try {
    const uid = req.headers.get('x-uid');
    if (!uid) return NextResponse.json({ error: 'Missing uid' }, { status: 400 });

    // 1) Lire l'utilisateur (subscriptionId)
    const userRef = doc(db, 'users', uid);
    const userSnap = await getDoc(userRef);
    if (!userSnap.exists()) return NextResponse.json({ error: 'User not found' }, { status: 404 });

    const { subscriptionId } = userSnap.data() as { subscriptionId?: string };
    if (!subscriptionId) return NextResponse.json({ error: 'No subscription on user' }, { status: 404 });

    // 2) Appeler PayPal
    const sub = await getSubscriptionDetails(subscriptionId);

    const payload = {
      id: sub.id,
      status: sub.status,
      plan_id: sub.plan_id,
      start_time: sub.start_time,
      next_billing_time: sub.billing_info?.next_billing_time || null,
      last_payment: sub.billing_info?.last_payment || null,
      outstanding_balance: sub.billing_info?.outstanding_balance || null,
      subscriber_email: sub.subscriber?.email_address || null,
      status_update_time: sub.status_update_time || null,
    };

    return NextResponse.json(payload, { status: 200 });
  } catch (e: any) {
    console.error('GET /api/paypal/subscription', e);
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}