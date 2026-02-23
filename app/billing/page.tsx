'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/components/AuthProvider';
import Link from 'next/link';

type SubInfo = {
  id: string;
  status: string;
  plan_id?: string;
  start_time?: string;
  next_billing_time?: string | null;
  last_payment?: {
    time: string;
    amount: { currency_code: string; value: string };
  } | null;
  subscriber_email?: string | null;
};

type Tx = {
  transaction_id?: string;
  status?: string;
  payer_email?: string;
  time: string;
  amount: { currency_code: string; value: string };
};

export default function BillingPage() {
  const { user } = useAuth();

  const [info, setInfo] = useState<SubInfo | null>(null);
  const [txs, setTxs] = useState<Tx[]>([]);
  const [loading, setLoading] = useState(true);
  const [cancelMsg, setCancelMsg] = useState<string | null>(null);
  const [cancelLoading, setCancelLoading] = useState(false);

  const loadData = async () => {
    if (!user) return;

    setLoading(true);

    try {
      const [subRes, txRes] = await Promise.all([
        fetch('/api/paypal/subscription', {
          headers: { 'x-uid': user.uid },
        }),
        fetch('/api/paypal/transactions', {
          headers: { 'x-uid': user.uid },
        }),
      ]);

      const subJson = await subRes.json();
      const txJson = await txRes.json();

      if (subRes.ok) setInfo(subJson);
      if (txRes.ok) setTxs(txJson.transactions || []);
    } catch (e) {
      console.error('Billing load error', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user) loadData();
  }, [user]);

  const cancelSubscription = async () => {
    if (!user) return;
    if (!confirm('Voulez-vous vraiment annuler votre abonnement ?')) return;

    setCancelLoading(true);
    setCancelMsg(null);

    try {
      const res = await fetch('/api/paypal/cancel-subscription', {
        method: 'POST',
        headers: { 'x-uid': user.uid },
      });

      if (!res.ok) throw new Error('Annulation impossible.');

      setCancelMsg('Votre abonnement a été annulé. Votre plan repasse en Free.');
      await loadData();
    } catch (e: any) {
      setCancelMsg(e.message);
    } finally {
      setCancelLoading(false);
    }
  };

  if (!user) {
    return (
      <div className="rounded-xl border bg-white p-6">
        <p className="text-gray-700">Veuillez vous connecter.</p>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="rounded-xl border bg-white p-6">
        <p>Chargement...</p>
      </div>
    );
  }

  if (!info) {
    return (
      <div className="rounded-xl border bg-white p-6 space-y-4">
        <h1 className="text-xl font-semibold">Facturation</h1>
        <p className="text-gray-600">Aucun abonnement n'est actif.</p>
        <Link
          href="/pricing"
          className="text-sm underline text-blue-600 hover:text-blue-800"
        >
          Voir les abonnements
        </Link>
      </div>
    );
  }

  const fmt = (d?: string | null) => {
    if (!d) return '—';
    try {
      return new Date(d).toLocaleString('fr-FR');
    } catch {
      return d;
    }
  };

  const truncate = (s: string, n = 10) =>
    s && s.length > n ? s.slice(0, n) + '…' : s;

  return (
    <div className="space-y-6">
      <div className="rounded-xl border bg-white p-6 space-y-4">
        <h1 className="text-xl font-semibold">Facturation</h1>

        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          <Info label="Status" value={info.status} />
          <Info label="Subscription ID" value={truncate(info.id)} />
          <Info label="Plan ID" value={info.plan_id || '—'} />
          <Info label="Début" value={fmt(info.start_time)} />
          <Info
            label="Prochaine échéance"
            value={fmt(info.next_billing_time)}
          />
          <Info
            label="Dernier paiement"
            value={
              info.last_payment
                ? `${fmt(info.last_payment.time)} • ${info.last_payment.amount.value} ${info.last_payment.amount.currency_code}`
                : '—'
            }
          />
        </div>

        {cancelMsg && (
          <p className="text-sm text-gray-700">{cancelMsg}</p>
        )}

        {info.status === 'ACTIVE' && (
          <button
            onClick={cancelSubscription}
            disabled={cancelLoading}
            className="rounded-md border border-red-300 px-4 py-2 text-red-700 hover:bg-red-50 disabled:opacity-60"
          >
            {cancelLoading ? 'Annulation...' : 'Annuler l’abonnement'}
          </button>
        )}
      </div>

      {/* Historique */}
      <div className="rounded-xl border bg-white p-6 space-y-4">
        <h2 className="text-lg font-semibold">Historique des paiements</h2>

        {txs.length === 0 ? (
          <p className="text-gray-600 text-sm">
            Aucune transaction pour le moment.
          </p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b bg-gray-50 text-gray-600 uppercase text-xs">
                  <th className="px-3 py-2">Date</th>
                  <th className="px-3 py-2">Montant</th>
                  <th className="px-3 py-2">Status</th>
                  <th className="px-3 py-2">Email Payeur</th>
                  <th className="px-3 py-2">ID</th>
                </tr>
              </thead>
              <tbody>
                {txs.map((t, i) => (
                  <tr key={i} className="border-b">
                    <td className="px-3 py-2">{fmt(t.time)}</td>
                    <td className="px-3 py-2">
                      {t.amount.value} {t.amount.currency_code}
                    </td>
                    <td className="px-3 py-2">{t.status || '—'}</td>
                    <td className="px-3 py-2">{t.payer_email || '—'}</td>
                    <td className="px-3 py-2">
                      {truncate(t.transaction_id || '')}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

function Info({ label, value }: { label: string; value: any }) {
  return (
    <div>
      <p className="text-xs text-gray-500">{label}</p>
      <p className="font-medium text-gray-800">{value}</p>
    </div>
  );
}