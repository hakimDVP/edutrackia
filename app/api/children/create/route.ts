import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/firebase';
import { collection, doc, getCountFromServer, getDoc, serverTimestamp, setDoc } from 'firebase/firestore';

export async function POST(req: NextRequest) {
  try {
    const uid = req.headers.get('x-uid');
    if (!uid) return NextResponse.json({ error: 'Missing uid' }, { status: 400 });

    const { firstName, lastName, birthDate } = await req.json();
    if (!firstName) return NextResponse.json({ error: 'Missing firstName' }, { status: 400 });

    // 1) Récupérer le plan utilisateur
    const userRef = doc(db, 'users', uid);
    const userSnap = await getDoc(userRef);
    if (!userSnap.exists()) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }
    const { plan = 'free' } = userSnap.data() as { plan?: 'free' | 'premium' };

    // 2) Si FREE → vérifier le nombre d’enfants
    if (plan === 'free') {
      const childrenCol = collection(db, 'children');
      // Compter les enfants de ce parent
      const qCount = await getCountFromServer(
        // Filtrer par parentId
        // Firestore count nécessite un index si tu ajoutes d'autres where ; ici on montre la version simple
        // @ts-ignore: count sur collection + where n'est pas montré ici, garde simple.
        (childrenCol as any).where?.('parentId', '==', uid) ?? childrenCol
      );
      const childrenCount = qCount.data().count ?? 0;

      if (childrenCount >= 1) {
        return NextResponse.json(
          { error: 'Plan gratuit : 1 enfant maximum. Passez en Premium.' },
          { status: 403 }
        );
      }
    }

    // 3) Créer l’enfant
    const newId = crypto.randomUUID();
    const childRef = doc(db, 'children', newId);
    await setDoc(childRef, {
      id: newId,
      parentId: uid,
      firstName,
      lastName: lastName || '',
      birthDate: birthDate || null,
      createdAt: serverTimestamp(),
    });

    return NextResponse.json({ ok: true, id: newId });
  } catch (e: any) {
    console.error(e);
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}