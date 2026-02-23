// lib/stripe.ts
export function getPlanLimit(plan: 'free' | 'premium') {
  return plan === 'free' ? 1 : 10; // MVP: 1 enfant gratuit, 10 en premium
}