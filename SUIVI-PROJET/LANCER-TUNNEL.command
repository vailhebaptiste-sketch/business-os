#!/bin/bash
# Double-cliquer ce fichier pour exposer l'app sur internet (5G / hors WiFi)
cd ~/business-os
echo "============================================"
echo "  Business OS — Tunnel internet"
echo "============================================"
echo ""
echo "Assure-toi que le serveur tourne (npm run dev)"
echo ""
./cloudflared-mac tunnel --url http://localhost:3000
