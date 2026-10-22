import type { VercelRequest, VercelResponse } from '@vercel/node';
import crypto from 'crypto';

const SERVICE_ACCOUNT = {
  project_id: 'canteen-grab-go',
  client_email: 'firebase-adminsdk-fbsvc@canteen-grab-go.iam.gserviceaccount.com',
  private_key: `-----BEGIN PRIVATE KEY-----
MIIEvQIBADANBgkqhkiG9w0BAQEFAASCBKcwggSjAgEAAoIBAQDFmqEgRYP808lz
IOEK88J47rJToJH6fGy/gbGRZC5jYC/Ay2pNIdlQaKyiJGoo9hjpEx26+01quagZ
Jh8I1V5g4jNq+2XcRoCf+EffRyr0Lu7Yq66Yf8IqDYFzNn4dmM+VshM4yzHSaDk6
8wXQdQuPyWQsP/fK02EF/J8fQ/vXCqx3Le2C2cCAdVrxtu83ha8r9iJd4hfJAQwv
R6IcmvqypAIyJY1kZXVh6EShcNL6u0hifJg1RyfJ7dU2pG1LvIBdXIUokgVGpI5T
DDg4ekZQ8ddfc853YO3YmLyvsfJcl9mV2SWASXLyq+uJY1L5h6OlZlgk5ioty+8/
pNISzNstAgMBAAECggEAE/YIDz6+c8CAIc9hNE5F55nzLSP0AxnlEV5cTdvRHMxH
XqIdwZ9o+KiuQa3MhIlBoG/EKdJ/ckfBXZL+gRGuuDo5Z/XvxvXfQemedwVVJzgD
fCMxnqmPN1jIahdH250HYS+NJghOptrM5zHL9VARhCuboSWwFg7OxwBLIakoLENz
s5gX8jw99gFF4NbfXMAXkWR1Y5G5OOuZWwUbf/mwJLO9k3oAC2W4SEU0Otov7no5
L6Yn23nF3RJMfvAABUCZf5AJuAteDW/LuITZQqXIr9rEuiJXlvfGajvZgqy9Z93U
KMxj+vpfDeJWluKosEMaonsA1qFpJqfJd9lMmEVQ0QKBgQD/ge/c3E98KcVq56ji
mAFZhcbnaDvUSie+jcZ5iCNHDb09pdzVYoZxuc+Pej8sHSBZxpeuWRV9aWNkiDBs
ldDUE5cPVuSb1Ej4opSmx+hVrRotd9wriw41B4TPQ6y+pXqH2u3z1LVki3OfaY4J
aqot6krXx+keZJ2DKdupoMqDMQKBgQDF/B+yzpMnPXm80UnVdOo0vgNtMJireLUU
LuF0LNOnD8I5aF33eia4LLaTJC5TMFANbHGIsF33pO5DHrXH4F13hImZWlc+UZni
ao9gqJwY2cS2bXZpMAnG5tGtdkvxu1b5XbRhF+z0oUQ/Rws36JrlEOZCyXciHWLQ
ciML+2oAvQKBgHCEC9i6u9X1nxYgxeJjBdUicCDfadlmfnIPhONn7AESL8/CBqmB
JatXI+wO7VrDyMdACPOiDzCXBEn1Hz3yC3AY4GDE5w8oQKodDlETn2B7RhfXvIEA
T1VS5k1Pg/bAcGD7K+ZAOVD5iAUfOokzC5YEosi7JBFaRXLJMA5W3FdBAoGAQK3H
JUD7LdyVgqvUtRlG0ggpUmiH16zNa1SNbsieNHufdeW0nP6Y254v3w343FByNpBw
3rjPWfHVrLPBqxSPNFZmJWUwDznVTfSF9ovewveRng9QmbiJ2SLa6RI2aThMh5an
MPkB/kEY7Jsm/RLOV3sX3kW217xF5dcDwAxYavkCgYEA6F78anCGF8knVgRqtZpk
WkZw9ciGpbuYJjCSW2i+CxGTrykU7BaUGHvk+vOwj1Fo27DH+iw5qAGo4VPRsNfe
7HfDBjXPiaS7Svkiw8MKX25tVZxO/icSFQ57GlEj0CF4fROJi+J/lYE7R1Dz3pT7
YVkRxkR1EJ1IuVFB6rI1x1g=
-----END PRIVATE KEY-----`
};

let cachedAccessToken: { token: string; exp: number } | null = null;

async function getGoogleAccessToken(): Promise<string> {
  const now = Math.floor(Date.now() / 1000);
  if (cachedAccessToken && cachedAccessToken.exp > now + 60) {
    return cachedAccessToken.token;
  }

  const header = Buffer.from(JSON.stringify({ alg: 'RS256', typ: 'JWT' })).toString('base64url');
  const claimSet = Buffer.from(
    JSON.stringify({
      iss: SERVICE_ACCOUNT.client_email,
      scope: 'https://www.googleapis.com/auth/firebase.messaging',
      aud: 'https://oauth2.googleapis.com/token',
      exp: now + 3600,
      iat: now,
    })
  ).toString('base64url');

  const sign = crypto.createSign('RSA-SHA256');
  sign.update(`${header}.${claimSet}`);
  const signature = sign.sign(SERVICE_ACCOUNT.private_key, 'base64url');
  const jwt = `${header}.${claimSet}.${signature}`;

  const res = await fetch('https://oauth2.googleapis.com/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: `grant_type=urn:ietf:params:oauth:grant-type:jwt-bearer&assertion=${jwt}`,
  });

  const data = (await res.json()) as any;
  if (!data.access_token) {
    throw new Error('Failed to obtain Google OAuth2 access token: ' + JSON.stringify(data));
  }

  cachedAccessToken = {
    token: data.access_token,
    exp: now + (data.expires_in || 3600),
  };

  return cachedAccessToken.token;
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // Enable CORS
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
    const { token, tokens, title, body, orderToken, orderId, type } = req.body || {};

    const targetTokens: string[] = [];
    if (token && typeof token === 'string') targetTokens.push(token);
    if (Array.isArray(tokens)) {
      tokens.forEach((t) => {
        if (typeof t === 'string' && !targetTokens.includes(t)) targetTokens.push(t);
      });
    }

    // If orderToken or orderId is provided but no direct token, query Supabase device_push_tokens
    if (targetTokens.length === 0 && (orderToken || orderId)) {
      const SUPABASE_URL = process.env.VITE_SUPABASE_URL || 'https://idosnceaxvgnfqbwsjml.supabase.co';
      const SUPABASE_KEY = process.env.VITE_SUPABASE_PUBLISHABLE_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imlkb3NuY2VheHZnbmZxYndzam1sIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzQ0OTE5ODYsImV4cCI6MjA5MDA2Nzk4Nn0.4hc7mK22kgiTETJlbR6ET7BlwJNF8-TYMrEsYF8_Qss';

      try {
        const queryParam = orderToken
          ? `order_token=eq.${encodeURIComponent(orderToken)}`
          : `order_id=eq.${encodeURIComponent(orderId)}`;
        const sbRes = await fetch(`${SUPABASE_URL}/rest/v1/device_push_tokens?select=token&${queryParam}`, {
          headers: { apikey: SUPABASE_KEY, Authorization: `Bearer ${SUPABASE_KEY}` },
        });
        if (sbRes.ok) {
          const records = (await sbRes.json()) as Array<{ token: string }>;
          records.forEach((r) => {
            if (r.token && !targetTokens.includes(r.token)) targetTokens.push(r.token);
          });
        }
      } catch (err) {
        console.warn('Could not query device_push_tokens from Supabase:', err);
      }
    }

    if (targetTokens.length === 0) {
      return res.status(400).json({
        error: 'No target device tokens found to send push notification.',
        details: { orderToken, orderId },
      });
    }

    const accessToken = await getGoogleAccessToken();
    const fcmEndpoint = `https://fcm.googleapis.com/v1/projects/${SERVICE_ACCOUNT.project_id}/messages:send`;

    const notificationTitle = title || (orderToken ? `Order #${orderToken} Update` : 'Canteen Order Update');
    const notificationBody = body || 'Your order status has been updated.';

    const results = await Promise.allSettled(
      targetTokens.map(async (deviceToken) => {
        const payload = {
          message: {
            token: deviceToken,
            notification: {
              title: notificationTitle,
              body: notificationBody,
            },
            data: {
              orderToken: String(orderToken || ''),
              orderId: String(orderId || ''),
              type: String(type || 'order_status'),
            },
            android: {
              priority: 'HIGH',
              notification: {
                channel_id: 'canteen_orders',
                sound: 'default',
                default_sound: true,
                default_vibrate_timings: true,
                notification_priority: 'PRIORITY_HIGH',
                visibility: 'PUBLIC',
              },
            },
          },
        };

        const fcmRes = await fetch(fcmEndpoint, {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${accessToken}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(payload),
        });

        const fcmData = await fcmRes.json();
        if (!fcmRes.ok) {
          throw new Error(JSON.stringify(fcmData));
        }
        return fcmData;
      })
    );

    const sent = results.filter((r) => r.status === 'fulfilled');
    const failed = results.filter((r) => r.status === 'rejected');

    return res.status(200).json({
      success: true,
      sentCount: sent.length,
      failedCount: failed.length,
      details: { sent, failed },
    });
  } catch (err: any) {
    console.error('send-push handler error:', err);
    return res.status(500).json({ error: err.message || 'Internal server error' });
  }
}
