import { Redis } from '@upstash/redis';
const redis = Redis.fromEnv();
const HISTORY_KEY = 'osrs:history:v1';
export default async function handler(req, res) {
  try {
    const now = Date.now();
    const points = (await redis.get(HISTORY_KEY)) || [];
    const clean = Array.isArray(points) ? points.filter(p => p && p.t >= now - 24*60*60*1000) : [];
    const latest = clean.length ? clean[clean.length - 1] : null;
    res.setHeader('Cache-Control', 'no-store');
    return res.status(200).json({ latest, points: clean });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
}
