export const runtime = 'nodejs'; // firebase-admin ne fonctionne PAS en Edge runtime

import { NextRequest, NextResponse } from 'next/server';
import { adminDb } from '@/lib/firebaseAdmin';
import { requireUserUidFromAuthHeader } from '@/lib/secure';

export async function POST(req: NextRequest) {
  try {
    // 1️⃣ Vérifier et extraire UID via le token Firebase
    const uid = await requireUserUidFromAuthHeader(
      req.headers.get('authorization')
    );

    // 2️⃣ Lire les données envoyées
    const { firstName, lastName, birthDate, gradeLevel } = await req.json();

    if (!firstName) {
      return NextResponse.json(
        { error: 'Missing firstName' },
        { status: 400 }
      );
    }

    // 3️⃣ Lire le plan utilisateur
    const userSnap = await adminDb.collection('users').doc(uid).get();

    if (!userSnap.exists) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    const plan = userSnap.data()?.plan ?? 'free';

    // 4️⃣ Si plan FREE -> max 1 enfant
    if (plan === 'free') {
      const childrenSnap = await adminDb
        .collection('children')
        .where('parentId', '==', uid)
        .get();

      if (childrenSnap.size >= 1) {
        return NextResponse.json(
          { error: 'Plan gratuit : 1 enfant maximum. Passez en Premium.' },
          { status: 403 }
        );
      }
    }

    // 5️⃣ Création de l’enfant
    const id = crypto.randomUUID();

    await adminDb.collection('children').doc(id).set({
      id,
      parentId: uid,
      firstName,
      lastName: lastName || '',
      gradeLevel: gradeLevel || '',
      birthDate: birthDate || null,
      createdAt: new Date(),
    });

    // 6️⃣ Réponse OK
    return NextResponse.json(
      { ok: true, id },
      { status: 200 }
    );
  } catch (error: any) {
    console.error('❌ ERROR children/create:', error);
    return NextResponse.json(
      { error: error.message || 'Server error' },
      { status: 500 }
    );
  }
}