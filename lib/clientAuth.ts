// lib/clientAuth.ts
import { auth } from '@/lib/firebase';
import { getIdToken } from 'firebase/auth';

export async function getAuthHeader() {
  const current = auth.currentUser;
  if (!current) return {};
  const token = await getIdToken(current, /* forceRefresh */ false);
  return { Authorization: `Bearer ${token}` };
}