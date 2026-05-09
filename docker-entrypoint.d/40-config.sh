#!/bin/sh
set -eu

cat > /usr/share/nginx/html/config.js <<EOF
window.SPOTIFY_API_BASE_URL = "${API_BASE_URL:-http://localhost:8080}";
EOF
