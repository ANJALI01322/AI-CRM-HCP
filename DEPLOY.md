# Deploying to Vercel

The repo deploys as one Vercel project with two services (see `vercel.json`):
`frontend` (Vite, static) and `backend` (FastAPI, Python 3.12, `app.main:app`, 60 s max duration).
`/api/*` is routed to the backend; everything else to the frontend.

## Environment variables (Project Settings -> Environment Variables)

| Name | Value |
| --- | --- |
| `DATABASE_URL` | Neon pooled connection string, `?sslmode=require` |
| `GROQ_API_KEY` | Your Groq key |
| `MODEL_NAME` | `openai/gpt-oss-120b` |
| `JWT_SECRET` | 32+ random characters (`python -c "import secrets; print(secrets.token_urlsafe(48))"`) |
| `ALLOWED_ORIGINS` | Your site origin(s), comma-separated, e.g. `https://your-app.vercel.app` |

Leave `VITE_API_URL` unset (same-origin `/api`). Optional: `LOG_LEVEL`.

## Database migrations (manual, not run by Vercel)

From `backend/` with `DATABASE_URL` pointing at the target database:

```bash
pip install -r requirements.txt
alembic upgrade head          # applies 0001 (schema) and 0002 (HCP assignment)
python seed.py --reset        # OPTIONAL, demo only: recreates demo org + rep@demo.com / manager@demo.com (Demo@123)
```

`seed.py --reset` deletes the demo org's data first. Do not seed a database with real customer data,
and do not leave the public demo passwords on a production system.

## Checklist

1. Create a Neon database and copy the pooled connection string.
2. Run `alembic upgrade head` (and `python seed.py --reset` for a demo) as above.
3. Import the repo in Vercel; keep the root at the repository root so `vercel.json` is used.
4. Set the five environment variables for Production (and Preview if used).
5. Deploy.
6. Open `https://<your-domain>/api/health`: expect `{"status":"ok","db":"ok","llm":"ok (...)"}`.
7. Open the site, click **Try demo (Manager)**; the dashboard should show real counts.
8. Reload on `/login` and `/follow-ups` to confirm client-side routes don't 404.
9. Log a visit with the AI extractor and ask the AI Analyst a question to confirm Groq works.
10. Add your production domain to `ALLOWED_ORIGINS` if you use a custom domain, then redeploy.

## Notes

- Rate limits (login 5/min per IP, chat 20/min per user) are in memory per instance, so they are abuse
  protection rather than exact quotas on serverless.
- Groq's free tier has a tokens-per-minute cap; heavy use returns a clear 429 message.
