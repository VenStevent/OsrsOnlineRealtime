import { Redis } from '@upstash/redis';

const redis = Redis.fromEnv();
const SOURCE = 'https://oldschool.runescape.com/slu';
const HISTORY_KEY = 'osrs:history:v1';
const MAX_AGE_MS = 24 * 60 * 60 * 1000;

export default async function handler(req, res) {
  if (req.method !== 'GET' && req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });
  const secret = process.env.COLLECT_SECRET;
  if (secret && req.headers['x-collect-secret'] !== secret) return res.status(401).json({ error: 'Unauthorized' });

  try {
    const response = await fetch(`${SOURCE}?_=${Date.now()}`, {
      headers: { 'User-Agent': 'OSRSPlayerHistory/1.0' },
      cache: 'no-store'
    });
    if (!response.ok) throw new Error(`OSRS returned ${response.status}`);
    const html = await response.text();
    const match = html.match(/There are currently\s+([\d,]+)\s+people playing/i) || html.match(/([\d,]+)\s*players\s*online/i) || html.match(/([\d,]+)\s*players/i);
    if (!match) throw new Error('Could not find OSRS player count in homepage');

    const count = Number(match[1].replace(/,/g, ''));
    if (!Number.isFinite(count) || count < 0) throw new Error('Invalid player count');

    const now = Date.now();
    const point = { t: now, count };
    const old = (await redis.get(HISTORY_KEY)) || [];
    const points = Array.isArray(old) ? old : [];
    points.push(point);
    const cutoff = now - MAX_AGE_MS;
    const trimmed = points.filter(p => p && Number.isFinite(p.t) && p.t >= cutoff && Number.isFinite(p.count));
    await redis.set(HISTORY_KEY, trimmed);
    await redis.set('osrs:latest:v1', point);

    return res.status(200).json({ ok: true, point, points: trimmed.length });
  } catch (error) {
    return res.status(502).json({ error: error.message });
  }
}
