'use client';

import { useEffect, useState } from 'react';
import { doc, onSnapshot } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { useAuth } from '@/components/AuthProvider';

type Plan = 'free' | 'premium' | string;

export function useUserPlan() {
  const { user } = useAuth();
  const [plan, setPlan] = useState<Plan>('free');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) {
      setPlan('free');
      setLoading(false);
      return;
    }
    const ref = doc(db, 'users', user.uid);
    const unsub = onSnapshot(ref, (snap) => {
      const data = snap.data() as { plan?: Plan } | undefined;
      setPlan(data?.plan ?? 'free');
      setLoading(false);
    }, () => setLoading(false));
    return () => unsub();
  }, [user]);

  return { plan, loading, user };
}