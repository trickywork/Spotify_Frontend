const apiBaseUrl = (window.SPOTIFY_API_BASE_URL || "http://localhost:8080").replace(/\/$/, "");

const state = {
  feed: null,
  playlists: [],
  selectedPlaylistId: null,
  selectedSongId: null,
  isPlaying: false,
  elapsed: 0,
  timer: null,
};

const els = {
  nav: document.querySelector("#playlist-nav"),
  title: document.querySelector("#playlist-title"),
  description: document.querySelector("#playlist-description"),
  cover: document.querySelector("#cover"),
  songTitle: document.querySelector("#song-title"),
  songArtist: document.querySelector("#song-artist"),
  songLyric: document.querySelector("#song-lyric"),
  songList: document.querySelector("#song-list"),
  songCount: document.querySelector("#song-count"),
  feed: document.querySelector("#feed"),
  apiStatus: document.querySelector("#api-status"),
  play: document.querySelector("#play"),
  previous: document.querySelector("#previous"),
  next: document.querySelector("#next"),
  progress: document.querySelector("#progress"),
  elapsed: document.querySelector("#elapsed"),
  duration: document.querySelector("#duration"),
  refresh: document.querySelector("#refresh"),
};

function formatTime(seconds) {
  const safeSeconds = Math.max(0, Number(seconds) || 0);
  const minutes = Math.floor(safeSeconds / 60);
  const remainder = Math.floor(safeSeconds % 60).toString().padStart(2, "0");
  return `${minutes}:${remainder}`;
}

function selectedPlaylist() {
  return state.playlists.find((playlist) => playlist.id === state.selectedPlaylistId) || state.playlists[0];
}

function selectedSong() {
  const playlist = selectedPlaylist();
  if (!playlist) {
    return null;
  }
  return playlist.songs.find((song) => song.id === state.selectedSongId) || playlist.songs[0];
}

function setPlaying(isPlaying) {
  state.isPlaying = isPlaying;
  els.play.textContent = isPlaying ? "Pause" : "Play";
  clearInterval(state.timer);
  state.timer = null;

  if (isPlaying) {
    state.timer = window.setInterval(() => {
      const song = selectedSong();
      if (!song) {
        setPlaying(false);
        return;
      }

      state.elapsed += 1;
      if (state.elapsed >= song.length) {
        moveSong(1);
        return;
      }
      renderPlayer();
    }, 1000);
  }
}

function selectPlaylist(id) {
  state.selectedPlaylistId = id;
  const playlist = selectedPlaylist();
  state.selectedSongId = playlist?.songs[0]?.id || null;
  state.elapsed = 0;
  setPlaying(false);
  render();
}

function selectSong(id, autoplay = true) {
  state.selectedSongId = id;
  state.elapsed = 0;
  render();
  setPlaying(autoplay);
}

function moveSong(direction) {
  const playlist = selectedPlaylist();
  if (!playlist || playlist.songs.length === 0) {
    return;
  }

  const currentIndex = playlist.songs.findIndex((song) => song.id === state.selectedSongId);
  const nextIndex = (currentIndex + direction + playlist.songs.length) % playlist.songs.length;
  state.selectedSongId = playlist.songs[nextIndex].id;
  state.elapsed = 0;
  render();
}

function renderNav() {
  els.nav.innerHTML = "";
  state.playlists.forEach((playlist) => {
    const button = document.createElement("button");
    button.type = "button";
    button.className = `playlist-tab${playlist.id === state.selectedPlaylistId ? " active" : ""}`;
    button.textContent = playlist.name;
    button.addEventListener("click", () => selectPlaylist(playlist.id));
    els.nav.appendChild(button);
  });
}

function renderPlaylist() {
  const playlist = selectedPlaylist();
  if (!playlist) {
    return;
  }

  els.title.textContent = playlist.name;
  els.description.textContent = playlist.description;
  els.cover.className = `cover cover-${playlist.cover}`;
  els.songCount.textContent = `${playlist.songs.length} tracks`;
  els.songList.innerHTML = "";

  playlist.songs.forEach((song, index) => {
    const row = document.createElement("button");
    row.type = "button";
    row.className = `song-row${song.id === state.selectedSongId ? " active" : ""}`;
    row.innerHTML = `
      <span class="track-index">${index + 1}</span>
      <span class="song-meta">
        <strong>${song.name}</strong>
        <span>${song.artist}</span>
      </span>
      <span class="duration">${formatTime(song.length)}</span>
    `;
    row.addEventListener("click", () => selectSong(song.id));
    els.songList.appendChild(row);
  });
}

function renderPlayer() {
  const song = selectedSong();
  if (!song) {
    els.songTitle.textContent = "No song selected";
    els.songArtist.textContent = "Choose a song from the list.";
    els.songLyric.textContent = "";
    els.progress.value = 0;
    els.elapsed.textContent = "0:00";
    els.duration.textContent = "0:00";
    return;
  }

  const progress = Math.min(100, Math.round((state.elapsed / song.length) * 100));
  els.songTitle.textContent = song.name;
  els.songArtist.textContent = song.artist;
  els.songLyric.textContent = song.lyric;
  els.progress.value = progress;
  els.elapsed.textContent = formatTime(state.elapsed);
  els.duration.textContent = formatTime(song.length);
}

function renderFeed() {
  els.feed.innerHTML = "";
  if (!state.feed) {
    return;
  }

  state.feed.sections.forEach((section) => {
    const names = section.playlistIds
      .map((id) => state.playlists.find((playlist) => playlist.id === id)?.name)
      .filter(Boolean)
      .join(", ");

    const row = document.createElement("div");
    row.className = "feed-row";
    row.innerHTML = `
      <span class="track-index">${section.playlistIds.length}</span>
      <span class="feed-meta">
        <strong>${section.title}</strong>
        <span>${names}</span>
      </span>
    `;
    els.feed.appendChild(row);
  });
}

function render() {
  renderNav();
  renderPlaylist();
  renderPlayer();
  renderFeed();
}

async function loadData() {
  els.apiStatus.textContent = "Connecting";
  try {
    const [feedResponse, playlistsResponse] = await Promise.all([
      fetch(`${apiBaseUrl}/feed`),
      fetch(`${apiBaseUrl}/playlists`),
    ]);

    if (!feedResponse.ok || !playlistsResponse.ok) {
      throw new Error(`API returned ${feedResponse.status}/${playlistsResponse.status}`);
    }

    state.feed = await feedResponse.json();
    state.playlists = await playlistsResponse.json();
    state.selectedPlaylistId = state.playlists[0]?.id || null;
    state.selectedSongId = state.playlists[0]?.songs[0]?.id || null;
    state.elapsed = 0;
    els.apiStatus.textContent = "API online";
    render();
  } catch (error) {
    els.apiStatus.textContent = "API offline";
    els.songList.innerHTML = `<div class="error">Could not load Spotify API from ${apiBaseUrl}. Start the backend locally or check the Cloud Run URL.</div>`;
    els.feed.innerHTML = "";
    console.error(error);
  }
}

els.play.addEventListener("click", () => setPlaying(!state.isPlaying));
els.previous.addEventListener("click", () => moveSong(-1));
els.next.addEventListener("click", () => moveSong(1));
els.refresh.addEventListener("click", loadData);
els.progress.addEventListener("input", () => {
  const song = selectedSong();
  if (!song) {
    return;
  }
  state.elapsed = Math.round((Number(els.progress.value) / 100) * song.length);
  renderPlayer();
});

loadData();
