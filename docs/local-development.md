# Local Development

Run the backend first:

```bash
cd /Users/junliu/git_repo/Spotify_Backend
PORT=8083 ./gradlew run
```

Serve the frontend with any static file server:

```bash
cd /Users/junliu/git_repo/Spotify_Frontend
python3 -m http.server 5173
```

Open `http://localhost:5173`.

The frontend reads `window.SPOTIFY_API_BASE_URL` from `config.js`. By default it points to `http://localhost:8083`.
