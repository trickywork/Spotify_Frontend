# Spotify Frontend

Static frontend for the Spotify-style portfolio project. It calls the Ktor backend from `Spotify_Backend` and demonstrates playlist browsing, track selection, and simulated playback controls.

## Live Demo

- Portfolio URL: `https://spotify.junliu.dev`
- Cloud Run service: `spotify`
- Cloud Run URL: `https://spotify-gb7rmueyna-uc.a.run.app`
- Backend API: `https://spotify-api-gb7rmueyna-uc.a.run.app`
- Google Cloud project: `caramel-vim-441513-e1`
- Region: `us-central1`

The custom domain mapping exists in Cloud Run. If it is still pending, check the Cloudflare DNS record and Google-managed certificate status.

## Tech Stack

- HTML
- CSS
- Vanilla JavaScript
- Runtime config through `config.js`
- Nginx container for Cloud Run
- Google Cloud Build and Google Cloud Run

This repo intentionally has no npm build step. It is a lightweight static app.

## Project Structure

```text
Spotify_Frontend/
  index.html
  styles.css
  app.js
  config.js
  assets/
  docker-entrypoint.d/
    40-config.sh
  docs/
    configuration.md
    local-development.md
  Dockerfile
  cloudbuild.yaml
  nginx.conf
```

## Features

- Load feed sections from the backend `/feed` API.
- Load playlists from the backend `/playlists` API.
- Open playlist details.
- Select previous/next track.
- Play/pause simulated playback.
- Scrub progress.
- Responsive portfolio-friendly layout.

Audio files are not bundled. The player demonstrates UI behavior and state transitions using metadata.

## Local Development

Start the backend:

```bash
cd /Users/junliu/git_repo/Spotify_Backend
PORT=8083 ./gradlew run
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

Expected result:

- Playlist/feed sections load from `http://localhost:8083`.
- Clicking a playlist shows tracks.
- Player controls update the current track and progress bar.

## API Configuration

Local config:

```javascript
window.SPOTIFY_API_BASE_URL = "http://localhost:8083";
```

Cloud Run runtime variable:

```env
API_BASE_URL=https://spotify-api-gb7rmueyna-uc.a.run.app
```

The Docker entrypoint writes the runtime value into `config.js` when the container starts.

## Backend Pairing

Backend repo:

```text
/Users/junliu/git_repo/Spotify_Backend
https://github.com/trickywork/Spotify_Backend
```

Expected backend endpoints:

```text
GET /api/health
GET /feed
GET /playlists
GET /playlist/{id}
GET /songs/{file}
```

## Cloud Deployment

Manual deployment:

```bash
gcloud builds submit \
  --config cloudbuild.yaml \
  --substitutions _API_BASE_URL=https://spotify-api-gb7rmueyna-uc.a.run.app \
  --project caramel-vim-441513-e1
```

Cloud Run cost controls:

- static Nginx container
- `min-instances=0`
- `max-instances=2`
- 256Mi memory
- no database
- no persistent disk

## Expected Portfolio Behavior

A visitor should be able to open the page, browse playlists, click a playlist, select songs, and use play/pause/previous/next/progress controls. The API calls should succeed without the visitor needing credentials.

## Additional Notes

More setup notes:

- `docs/configuration.md`
- `docs/local-development.md`
