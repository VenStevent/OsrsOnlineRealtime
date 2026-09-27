import { Redis } from '@upstash/redis';
const redis = Redis.fromEnv();
export default async function handler(req, res) {
  try {
    const latest = await redis.get('osrs:latest:v1');
    res.setHeader('Cache-Control', 'no-store');
    return res.status(200).json({ latest: latest || null });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
}
