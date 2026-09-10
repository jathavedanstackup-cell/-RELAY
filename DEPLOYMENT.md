# RELAY Deployment

## Frontend

```text
npm ci
npm run build
```

Serve `dist/` from a static host with SPA fallback to `index.html`. Set
`VITE_API_BASE_URL=/api/v1` for same-origin deployment, or provide the HTTPS
API origin when the frontend and backend are intentionally separate.

## Backend

From `backend/`, install `requirements.txt`, then run:

```text
python manage.py migrate
python manage.py collectstatic --noinput
python -m uvicorn config.asgi:application --host 0.0.0.0 --port 8000
```

Use a managed PostgreSQL database. The reverse proxy must route `/api/v1/` to
Django, preserve session cookies and CSRF headers, and terminate HTTPS.

## Required Environment

Set `DEPLOYMENT_ENV=production`, a random `SECRET_KEY`, `DEBUG=false`,
`ALLOWED_HOSTS`, `CSRF_TRUSTED_ORIGINS`, secure cookie flags, all `DB_*`
variables, and `GEMINI_API_KEY`. Set `RELAY_MODE=demo` or `live` deliberately.

## Production Requirements

- HTTPS is required for secure session and CSRF cookies.
- Run migrations before serving traffic.
- Run `collectstatic` and serve `STATIC_ROOT` for Django admin/static assets.
- Configure SPA fallback for manual frontend routes such as `/login` and `/cases/1`.