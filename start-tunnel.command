#!/bin/bash
cd "$(dirname "$0")"
echo "Démarrage du tunnel Cloudflare..."
echo ""
./cloudflared-mac tunnel --url http://localhost:3000
