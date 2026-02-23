// lib/paypal.ts
export async function getPayPalAccessToken() {
  const clientId = process.env.PAYPAL_CLIENT_ID!;
  const secret   = process.env.PAYPAL_CLIENT_SECRET!;
  const base     = process.env.PAYPAL_ENV === 'live'
    ? 'https://api-m.paypal.com'
    : 'https://api-m.sandbox.paypal.com';

  const res = await fetch(`${base}/v1/oauth2/token`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
      'Authorization': 'Basic ' + Buffer.from(`${clientId}:${secret}`).toString('base64'),
    },
    body: 'grant_type=client_credentials',
  });
  if (!res.ok) {
    const t = await res.text();
    throw new Error('PayPal token failed: ' + t);
  }
  const json = await res.json();
  return { access_token: json.access_token as string, base };
}

export type PayPalSubscription = {
  id: string;
  status: string;
  status_update_time?: string;
  plan_id?: string;
  start_time?: string;
  billing_info?: {
    next_billing_time?: string;
    last_payment?: { time: string; amount: { currency_code: string; value: string } };
    outstanding_balance?: { currency_code: string; value: string };
    cycle_executions?: any[];
  };
  subscriber?: { email_address?: string; payer_id?: string };
};

export async function getSubscriptionDetails(subscriptionId: string) {
  const { access_token, base } = await getPayPalAccessToken();
  const res = await fetch(`${base}/v1/billing/subscriptions/${subscriptionId}`, {
    headers: { Authorization: `Bearer ${access_token}` },
    cache: 'no-store',
  });
  if (!res.ok) {
    const t = await res.text();
    throw new Error('getSubscriptionDetails failed: ' + t);
  }
  return (await res.json()) as PayPalSubscription;
}

export type PayPalTransaction = {
  id?: string;
  status?: string;
  payer_email?: string;
  time: string;
  amount: { currency_code: string; value: string };
};

export async function listSubscriptionTransactions(
  subscriptionId: string,
  startISO: string,
  endISO: string
) {
  const { access_token, base } = await getPayPalAccessToken();
  const url = new URL(`${base}/v1/billing/subscriptions/${subscriptionId}/transactions`);
  url.searchParams.set('start_time', startISO);
  url.searchParams.set('end_time', endISO);

  const res = await fetch(url.toString(), {
    headers: { Authorization: `Bearer ${access_token}` },
    cache: 'no-store',
  });
  if (!res.ok) {
    const t = await res.text();
    throw new Error('listSubscriptionTransactions failed: ' + t);
  }
  return await res.json(); // {transactions:[...]}
}