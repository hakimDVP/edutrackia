// lib/firebaseAdmin.ts
import * as admin from 'firebase-admin';

// Récup env
const projectId  = process.env.FB_ADMIN_PROJECT_ID!;
const clientEmail = process.env.FB_ADMIN_CLIENT_EMAIL!;
const rawKey      = process.env.FB_ADMIN_PRIVATE_KEY!;

// Remplacer les \n échappés par de vrais retours ligne
const privateKey  = rawKey.replace(/\\n/g, '\n');

if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert({
      projectId,
      clientEmail,
      privateKey,
    }),
  });
}

// ✅ Exports attendus par tes routes
export const adminAuth = admin.auth();
export const adminDb   = admin.firestore();