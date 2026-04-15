#!/bin/bash
echo "========================================="
echo "  Business OS - Serveur de développement"
echo "========================================="
echo ""
IP=$(ipconfig getifaddr en0 2>/dev/null || ipconfig getifaddr en1 2>/dev/null || echo "IP introuvable")
echo "➜  Adresse locale : http://$IP:3000"
echo "➜  Ouvre cette URL sur ton téléphone"
echo ""
cd ~/business-os
npm run dev -- --hostname 0.0.0.0
