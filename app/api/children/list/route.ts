export const runtime = 'nodejs';

import { NextRequest, NextResponse } from 'next/server';
import { adminDb } from '@/lib/firebaseAdmin';
import { requireUserUidFromAuthHeader } from '@/lib/secure';

export async function GET(req: NextRequest) {
  try {
    const uid = await requireUserUidFromAuthHeader(
      req.headers.get("authorization")
    );

    const snap = await adminDb
      .collection("children")
      .where("parentId", "==", uid)
      .get();

    const children = snap.docs.map((d) => d.data());

    return NextResponse.json({ children }, { status: 200 });
  } catch (e: any) {
    console.error("children/list error:", e);
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}