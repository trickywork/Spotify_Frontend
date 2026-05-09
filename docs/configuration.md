# Spotify Frontend Configuration

This file records the non-code setup needed to run and redeploy the Spotify frontend.

## Runtime Shape

The frontend is a static HTML/CSS/JavaScript app served by nginx in Cloud Run.

It does not have a database. It reads playlist and feed data from the Spotify backend API.

## Local API Wiring

The app reads the backend URL from:

```text
config.js
```

Local default:

```javascript
window.SPOTIFY_API_BASE_URL = window.SPOTIFY_API_BASE_URL || "http://localhost:8080";
```

Local startup order:

1. Start `Spotify_Backend` on `http://localhost:8080`.
2. Serve this frontend on `http://localhost:5173`.

```bash
cd /Users/junliu/git_repo/Spotify_Backend
./gradlew run
```

```bash
cd /Users/junliu/git_repo/Spotify_Frontend
python3 -m http.server 5173
```

Open:

```text
http://localhost:5173
```

## Cloud Runtime Config

Cloud Build passes the backend URL as `_API_BASE_URL`.

Cloud Run env var:

```text
API_BASE_URL=https://spotify-api-gb7rmueyna-uc.a.run.app
```

The Docker entrypoint writes that value into `config.js` before nginx starts:

```text
docker-entrypoint.d/40-config.sh
```

## Cloud Resources

Google Cloud project:

```text
caramel-vim-441513-e1
```

Region:

```text
us-central1
```

Cloud Run service:

```text
spotify
```

Cloud Run URL:

```text
https://spotify-gb7rmueyna-uc.a.run.app
```

Custom domain mapping:

```text
spotify.junliu.dev
```

Cloud Build trigger:

```text
spotify-frontend-main-deploy
```

Status:

```text
Pending until the Cloud Build GitHub App has access to trickywork/Spotify_Frontend.
```

## Cost Notes

- Static nginx container only.
- No database, object storage, or secrets are required.
- Cloud Run is configured for `min-instances=0`.
