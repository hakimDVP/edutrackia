import { adminAuth } from '@/lib/firebaseAdmin';

export async function requireUserUidFromAuthHeader(authHeader?: string | null) {
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    throw new Error('Unauthorized: missing or invalid Authorization header');
  }

  const idToken = authHeader.replace('Bearer ', '').trim();
  const decoded = await adminAuth.verifyIdToken(idToken);
  return decoded.uid;
}