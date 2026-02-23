// app/api/paypal/transactions/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/firebase';
import { doc, getDoc } from 'firebase/firestore';
import { listSubscriptionTransactions } from '@/lib/paypal';

export const dynamic = 'force-dynamic';

function toISO(d: Date) {
  return d.toISOString().replace(/\.\d{3}Z$/, 'Z');
}

export async function GET(req: NextRequest) {
  try {
    const uid = req.headers.get('x-uid');
    if (!uid) return NextResponse.json({ error: 'Missing uid' }, { status: 400 });

    // 1) Récupérer le subscriptionId
    const userRef = doc(db, 'users', uid);
    const userSnap = await getDoc(userRef);
    if (!userSnap.exists()) return NextResponse.json({ error: 'User not found' }, { status: 404 });
    const { subscriptionId } = userSnap.data() as { subscriptionId?: string };
    if (!subscriptionId) return NextResponse.json({ transactions: [] }, { status: 200 });

    // Optionnel : paramètres start/end
    const { searchParams } = new URL(req.url);
    const start = searchParams.get('start') || toISO(new Date(Date.now() - 180 * 24 * 3600 * 1000)); // -180j
    const end   = searchParams.get('end')   || toISO(new Date());

    // 2) PayPal
    const result = await listSubscriptionTransactions(subscriptionId, start, end);
    // result.transactions: { transaction_id, status, payer_email, time, amount{value,currency_code}... }

    return NextResponse.json(result, { status: 200 });
  } catch (e: any) {
    console.error('GET /api/paypal/transactions', e);
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}