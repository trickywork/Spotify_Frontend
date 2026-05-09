# Spotify Frontend

Static web frontend for the LaiOffer Spotify project. It calls the Ktor backend from `Spotify_Backend` and provides a deployable portfolio demo with playlist browsing, track selection, and simulated playback controls.

## Features

- Playlist navigation from the backend `/playlists` API.
- Feed sections from the backend `/feed` API.
- Select songs, move previous/next, play/pause, and scrub progress.
- Runtime API configuration through `API_BASE_URL`.

## Local Run

Start the backend:

```bash
cd /Users/junliu/git_repo/Spotify_Backend
./gradlew run
```

Serve the frontend:

```bash
cd /Users/junliu/git_repo/Spotify_Frontend
python3 -m http.server 5173
```

Open:

```text
http://localhost:5173
```

## API Configuration

Local default:

```javascript
window.SPOTIFY_API_BASE_URL = "http://localhost:8080";
```

Cloud Run runtime env:

```text
API_BASE_URL=https://spotify-api-gb7rmueyna-uc.a.run.app
```

The Docker entrypoint writes that value into `config.js` before nginx starts.

Non-code setup is documented in `docs/configuration.md`, including local API pairing, runtime `API_BASE_URL`, custom domain, and pending Cloud Build trigger setup.

## Cloud Run Deployment

The repo includes `Dockerfile` and `cloudbuild.yaml`.

Manual deploy:

```bash
gcloud builds submit \
  --config cloudbuild.yaml \
  --substitutions _API_BASE_URL=https://spotify-api-gb7rmueyna-uc.a.run.app \
  --project caramel-vim-441513-e1
```

The Cloud Build trigger should deploy on pushes to `main` after the GitHub repository is connected.

Cost controls:

- Static nginx container with 256Mi memory.
- `--min-instances=0` and `--max-instances=2`.
- No database or persistent disk.

## Repo Pairing

This repo is intentionally separate from `Spotify_Backend` because the project has frontend and backend surfaces. The deployed frontend calls the deployed backend through a configured API base URL.
