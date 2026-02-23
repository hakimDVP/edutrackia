'use client';

import { useEffect, useRef, useState } from 'react';
import Script from 'next/script';
import { useAuth } from '@/components/AuthProvider';
import { useRouter } from 'next/navigation';

const CLIENT_ID = process.env.NEXT_PUBLIC_PAYPAL_CLIENT_ID ?? '';
const PLAN_ID = process.env.NEXT_PUBLIC_PAYPAL_PLAN_ID ?? '';

export default function PricingPage() {
  const { user } = useAuth();
  const router = useRouter();
  const [sdkReady, setSdkReady] = useState(false);
  const [envError, setEnvError] = useState<string | null>(null);

  useEffect(() => {
    if (!CLIENT_ID || !PLAN_ID) {
      setEnvError(
        !CLIENT_ID
          ? 'NEXT_PUBLIC_PAYPAL_CLIENT_ID est manquante dans .env.local'
          : 'NEXT_PUBLIC_PAYPAL_PLAN_ID est manquante dans .env.local'
      );
    } else {
      setEnvError(null);
    }
  }, []);

  return (
    <div className="mx-auto max-w-5xl py-12 px-4">
      <h1 className="text-3xl font-bold">Tarifs</h1>
      <p className="mt-2 text-gray-600">
        Passez en Premium pour débloquer l’IA et gérer plusieurs enfants.
      </p>

      {!!envError && (
        <div className="mt-4 rounded-md border border-red-300 bg-red-50 p-4 text-sm text-red-700">
          {envError}
        </div>
      )}

      <div className="mt-8 grid gap-6 sm:grid-cols-2">
        {/* Plan gratuit */}
        <div className="rounded-2xl border bg-white p-6">
          <h2 className="text-xl font-semibold">Gratuit</h2>
          <p className="mt-2 text-gray-600">1 enfant, notes, devoirs.</p>
          <p className="mt-4 text-3xl font-bold">0 €</p>

          {user ? (
            <button
              className="mt-6 w-full rounded-md border px-4 py-2 hover:bg-gray-50"
              onClick={() => router.push('/dashboard')}
            >
              Accéder au dashboard
            </button>
          ) : (
            <button
              className="mt-6 w-full rounded-md border px-4 py-2 hover:bg-gray-50"
              onClick={() => router.push('/auth/register')}
            >
              Créer un compte
            </button>
          )}
        </div>

        {/* Plan Premium */}
        <div className="rounded-2xl border bg-white p-6">
          <h2 className="text-xl font-semibold">Premium</h2>
          <p className="mt-2 text-gray-600">
            Enfants illimités, IA, alertes avancées et statistiques.
          </p>
          <p className="mt-4 text-3xl font-bold">
            5 €<span className="text-sm"> / mois</span>
          </p>

          {/* Conteneur du bouton PayPal */}
          <div id="paypal-subscribe-btn" className="mt-6" />

          {/* Charge le SDK PayPal (carte priorisée) */}
          {!envError && (
            <Script
              src={`https://www.paypal.com/sdk/js?client-id=${encodeURIComponent(
                CLIENT_ID
              )}&vault=true&intent=subscription&components=buttons`}
              strategy="afterInteractive"
              onLoad={() => setSdkReady(true)}
            />
          )}

          <PayPalSubscribeButton
            sdkReady={sdkReady}
            hasUser={!!user}
            planId={PLAN_ID}
          />
        </div>
      </div>
    </div>
  );
}

function PayPalSubscribeButton({
  sdkReady,
  hasUser,
  planId,
}: {
  sdkReady: boolean;
  hasUser: boolean;
  planId: string;
}) {
  const { user } = useAuth();
  const router = useRouter();
  const renderedRef = useRef(false); // évite rerender du bouton

  useEffect(() => {
    if (!sdkReady || !hasUser || renderedRef.current) return;

    // @ts-ignore
    const paypal = (window as any).paypal;
    if (!paypal || !planId) return;

    renderedRef.current = true;

    const buttons = paypal.Buttons({
      style: {
        layout: 'vertical',
        color: 'gold',
        shape: 'rect',
        label: 'subscribe',
      },

      // Création de l’abonnement
      createSubscription: (_data: any, actions: any) => {
        return actions.subscription.create({
          plan_id: planId,
          application_context: { shipping_preference: 'NO_SHIPPING' },
        });
      },

      onApprove: async (data: any) => {
        try {
          const res = await fetch('/api/paypal/link-subscription', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'x-uid': user?.uid ?? '',
            },
            body: JSON.stringify({ subscriptionId: data.subscriptionID }),
          });
          if (!res.ok) throw new Error('Link-subscription API failed');
          router.push('/dashboard');
        } catch (e) {
          console.error(e);
          alert(
            "Le paiement est passé mais la liaison compte n'a pas abouti. Contacte le support."
          );
        }
      },

      onError: (err: any) => {
        console.error('PayPal error', err);
        alert('Erreur PayPal. Réessaie dans quelques instants.');
      },
    });

    buttons.render('#paypal-subscribe-btn');

    return () => {
      try {
        buttons.close();
      } catch {}
    };
  }, [sdkReady, hasUser, planId, user, router]);

  if (!hasUser) {
    return (
      <button
        className="mt-6 w-full rounded-md bg-gray-900 px-4 py-2 text-white hover:bg-gray-800"
        onClick={() => router.push('/auth/register')}
      >
        Se connecter pour s’abonner
      </button>
    );
  }
  return null;
}