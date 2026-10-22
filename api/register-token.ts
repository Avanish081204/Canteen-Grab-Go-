import type { VercelRequest, VercelResponse } from '@vercel/node';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed. Use POST.' });
  }

  try {
    const { token, orderId, orderToken, userId, platform = 'android' } = req.body || {};

    if (!token) {
      return res.status(400).json({ error: 'Missing device token' });
    }

    const SUPABASE_URL = process.env.VITE_SUPABASE_URL || 'https://idosnceaxvgnfqbwsjml.supabase.co';
    const SUPABASE_KEY = process.env.VITE_SUPABASE_PUBLISHABLE_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imlkb3NuY2VheHZnbmZxYndzam1sIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzQ0OTE5ODYsImV4cCI6MjA5MDA2Nzk4Nn0.4hc7mK22kgiTETJlbR6ET7BlwJNF8-TYMrEsYF8_Qss';

    const insertPayload = {
      token,
      order_id: orderId || null,
      order_token: orderToken || null,
      user_id: userId || null,
      platform,
      updated_at: new Date().toISOString(),
    };

    // Upsert or insert into device_push_tokens in Supabase
    const sbRes = await fetch(`${SUPABASE_URL}/rest/v1/device_push_tokens`, {
      method: 'POST',
      headers: {
        apikey: SUPABASE_KEY,
        Authorization: `Bearer ${SUPABASE_KEY}`,
        'Content-Type': 'application/json',
        Prefer: 'return=minimal',
      },
      body: JSON.stringify(insertPayload),
    });

    if (!sbRes.ok) {
      const errText = await sbRes.text();
      console.warn('Supabase device_push_tokens record notice:', errText);
    }

    return res.status(200).json({ success: true, registered: true });
  } catch (err: any) {
    console.error('register-token error:', err);
    return res.status(500).json({ error: err.message || 'Internal server error' });
  }
}
