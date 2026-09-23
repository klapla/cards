import { kv } from '@vercel/kv';

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });
  const sub = req.body;
  if (!sub || !sub.endpoint) return res.status(400).json({ error: 'Invalid subscription' });
  // Ключ — hash endpoint'а
  const key = 'sub:' + Buffer.from(sub.endpoint).toString('base64url').slice(0, 64);
  await kv.set(key, JSON.stringify(sub));
  res.json({ ok: true });
}