# OSRS Player Count History

Vercel-hosted dashboard for current OSRS player count plus the last 24 hours of snapshots.

## Stack
- Vercel Functions
- Upstash Redis via Vercel Marketplace
- GitHub Actions collector every 5 minutes
- Static HTML/CSS/JS frontend

## Deploy
1. Push this folder to a GitHub repository.
2. Import the repository into Vercel.
3. In Vercel Marketplace, add Upstash Redis to the project. Vercel will provide `UPSTASH_REDIS_REST_URL` and `UPSTASH_REDIS_REST_TOKEN` environment variables.
4. Add a Vercel environment variable named `COLLECT_SECRET` with a random secret, e.g. 32+ random characters.
5. Deploy.
6. In GitHub repository Settings > Secrets and variables > Actions, add:
   - `COLLECT_URL` = `https://YOUR-DOMAIN.vercel.app/api/collect`
   - `COLLECT_SECRET` = the same value as Vercel's `COLLECT_SECRET`
7. Run the GitHub Action once manually from Actions > Collect OSRS player count > Run workflow.
8. The dashboard will start filling with points every 5 minutes. GitHub scheduled workflows can be delayed, so timestamps are the actual collection times.

## Important
The collector reads the public OSRS homepage. The player-count source is documented as the OSRS homepage count rather than a dedicated OSRS-only JSON endpoint.

Do not expose `COLLECT_SECRET` in frontend code.
